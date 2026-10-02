import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { BookingStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { formatIsoDate, nightsBetweenDates, parseIsoDate, todayIso } from "../common/dates.js";
import { canTransition, capacityError, createReference, estimateTotal, GUEST_CANCEL_FROM, GUEST_EDIT_FROM } from "./booking.rules.js";
import { bookingInclude, presentBooking, type BookingRecord } from "./booking.presenter.js";
import type { CreateBookingDto, QuoteBookingDto, UpdateBookingDto } from "./dto.js";

type Actor = { id: string; role: "GUEST" | "ADMIN" };

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async quote(input: QuoteBookingDto) {
    const property = await this.findPublishedProperty(input.propertyId, input.propertySlug);
    const stay = this.parseStay(input.checkIn, input.checkOut, input.guests, property.maxGuests);
    const available = await this.isAvailable(property.id, stay.checkIn, stay.checkOut);
    return {
      propertyId: property.id,
      propertySlug: property.slug,
      checkIn: formatIsoDate(stay.checkIn),
      checkOut: formatIsoDate(stay.checkOut),
      guests: input.guests,
      nights: stay.nights,
      nightlyRate: property.pricePerNight,
      estimatedTotal: estimateTotal(property.pricePerNight, stay.nights),
      currency: property.currency,
      available,
    };
  }

  async create(actor: Actor, input: CreateBookingDto) {
    const property = await this.findPublishedProperty(input.propertyId, input.propertySlug);
    const stay = this.parseStay(input.checkIn, input.checkOut, input.guests, property.maxGuests);

    const booking = await this.prisma.$transaction(async (tx) => {
      await this.lockProperty(tx, property.id);
      await this.assertAvailable(tx, property.id, stay.checkIn, stay.checkOut);
      const reference = await this.allocateReference(tx);
      const created = await tx.booking.create({
        data: {
          reference,
          userId: actor.id,
          propertyId: property.id,
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          guests: input.guests,
          nights: stay.nights,
          nightlyRate: property.pricePerNight,
          estimatedTotal: estimateTotal(property.pricePerNight, stay.nights),
          currency: property.currency,
          status: "REQUESTED",
          specialRequest: input.specialRequest || null,
          guestFirstName: input.firstName,
          guestLastName: input.lastName,
          guestEmail: input.email,
          guestPhone: input.phone,
          party: {
            create: {
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email,
              phone: input.phone,
              isPrimary: true,
            },
          },
          history: {
            create: {
              oldStatus: null,
              newStatus: "REQUESTED",
              actorId: actor.id,
              note: "Booking request submitted",
            },
          },
        },
        include: bookingInclude,
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "booking.create",
          entityType: "booking",
          entityId: created.id,
          note: created.reference,
        },
      });
      return created;
    });

    return presentBooking(booking);
  }

  async listForUser(userId: string, page: number, pageSize: number) {
    return this.list({ userId }, page, pageSize);
  }

  async listForAdmin(page: number, pageSize: number, status?: BookingStatus) {
    return this.list(status ? { status } : {}, page, pageSize);
  }

  async getForActor(actor: Actor, idOrReference: string) {
    const booking = await this.findBooking(idOrReference);
    this.assertCanRead(actor, booking);
    return presentBooking(booking);
  }

  async updateForGuest(actor: Actor, idOrReference: string, input: UpdateBookingDto) {
    const existing = await this.findBooking(idOrReference);
    this.assertOwner(actor, existing);
    if (!GUEST_EDIT_FROM.includes(existing.status)) {
      throw new ConflictException("This request can no longer be modified.");
    }

    const checkIn = input.checkIn ? this.requireDate(input.checkIn, "Check-in") : existing.checkIn;
    const checkOut = input.checkOut ? this.requireDate(input.checkOut, "Check-out") : existing.checkOut;
    const guests = input.guests ?? existing.guests;
    const stayError = this.validateStay(checkIn, checkOut, guests, existing.property.maxGuests);
    if (stayError) {
      throw new BadRequestException(stayError);
    }
    const nights = nightsBetweenDates(checkIn, checkOut);
    const datesChanged =
      formatIsoDate(checkIn) !== formatIsoDate(existing.checkIn) ||
      formatIsoDate(checkOut) !== formatIsoDate(existing.checkOut) ||
      guests !== existing.guests;
    const nextStatus: BookingStatus = datesChanged && existing.status === "REVIEWING" ? "REQUESTED" : existing.status;

    const booking = await this.prisma.$transaction(async (tx) => {
      await this.lockProperty(tx, existing.propertyId);
      const current = await tx.booking.findUnique({ where: { id: existing.id }, include: bookingInclude });
      if (!current || !GUEST_EDIT_FROM.includes(current.status)) {
        throw new ConflictException("This request can no longer be modified.");
      }
      await this.assertAvailable(tx, current.propertyId, checkIn, checkOut, current.id);
      if (nextStatus !== current.status) {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId: current.id,
            oldStatus: current.status,
            newStatus: nextStatus,
            actorId: actor.id,
            note: "Dates changed during review, so the request returned to the queue",
          },
        });
      }
      const updated = await tx.booking.update({
        where: { id: current.id },
        data: {
          checkIn,
          checkOut,
          guests,
          nights,
          nightlyRate: current.property.pricePerNight,
          estimatedTotal: estimateTotal(current.property.pricePerNight, nights),
          status: nextStatus,
          guestFirstName: input.firstName ?? current.guestFirstName,
          guestLastName: input.lastName ?? current.guestLastName,
          guestEmail: input.email?.trim().toLowerCase() ?? current.guestEmail,
          guestPhone: input.phone ?? current.guestPhone,
          specialRequest: input.specialRequest === undefined ? current.specialRequest : input.specialRequest || null,
        },
        include: bookingInclude,
      });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "booking.update", entityType: "booking", entityId: current.id },
      });
      return updated;
    });

    return presentBooking(booking);
  }

  async cancel(actor: Actor, idOrReference: string, note?: string) {
    const existing = await this.findBooking(idOrReference);
    if (actor.role !== "ADMIN") {
      this.assertOwner(actor, existing);
    }
    return this.transition(actor, existing.id, "CANCELLED", note ?? "Cancelled", true);
  }

  async changeStatus(actor: Actor, idOrReference: string, status: BookingStatus, note?: string) {
    const existing = await this.findBooking(idOrReference);
    return this.transition(actor, existing.id, status, note, false);
  }

  private async transition(actor: Actor, bookingId: string, status: BookingStatus, note: string | undefined, guestCancel: boolean) {
    const preview = await this.prisma.booking.findUnique({ where: { id: bookingId }, select: { id: true, propertyId: true } });
    if (!preview) {
      throw new NotFoundException("Booking not found");
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      await this.lockProperty(tx, preview.propertyId);
      const current = await tx.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
      if (!current) {
        throw new NotFoundException("Booking not found");
      }
      if (guestCancel && !GUEST_CANCEL_FROM.includes(current.status)) {
        throw new ConflictException("This request can no longer be cancelled.");
      }
      if (!canTransition(current.status, status)) {
        throw new ConflictException(`Cannot move a ${current.status} request to ${status}.`);
      }
      if (status === "CONFIRMED") {
        await this.assertAvailable(tx, current.propertyId, current.checkIn, current.checkOut, current.id);
      }
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: current.id,
          oldStatus: current.status,
          newStatus: status,
          actorId: actor.id,
          note: note ?? null,
        },
      });
      const updated = await tx.booking.update({
        where: { id: current.id },
        data: { status },
        include: bookingInclude,
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "booking.status",
          entityType: "booking",
          entityId: current.id,
          note: `${current.status}->${status}`,
        },
      });
      return updated;
    });

    return presentBooking(booking);
  }

  private async list(where: Prisma.BookingWhereInput, page: number, pageSize: number) {
    const [total, items] = await this.prisma.$transaction([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items: items.map(presentBooking), page, pageSize, total };
  }

  private async findBooking(idOrReference: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { OR: [{ id: idOrReference }, { reference: idOrReference }] },
      include: bookingInclude,
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }

  private assertCanRead(actor: Actor, booking: BookingRecord) {
    if (actor.role === "ADMIN" || booking.userId === actor.id) {
      return;
    }
    throw new ForbiddenException("You do not have access to this booking");
  }

  private assertOwner(actor: Actor, booking: BookingRecord) {
    if (booking.userId !== actor.id) {
      throw new ForbiddenException("You do not have access to this booking");
    }
  }

  private async findPublishedProperty(propertyId?: string, propertySlug?: string) {
    if (!propertyId && !propertySlug) {
      throw new BadRequestException("A property is required");
    }
    const property = await this.prisma.property.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [...(propertyId ? [{ id: propertyId }] : []), ...(propertySlug ? [{ slug: propertySlug }] : [])],
      },
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }
    return property;
  }

  private parseStay(checkInValue: string, checkOutValue: string, guests: number, maxGuests: number) {
    const checkIn = this.requireDate(checkInValue, "Check-in");
    const checkOut = this.requireDate(checkOutValue, "Check-out");
    const error = this.validateStay(checkIn, checkOut, guests, maxGuests);
    if (error) {
      throw new BadRequestException(error);
    }
    return { checkIn, checkOut, nights: nightsBetweenDates(checkIn, checkOut) };
  }

  private requireDate(value: string, label: string) {
    const date = parseIsoDate(value);
    if (!date) {
      throw new BadRequestException(`${label} is not a valid date`);
    }
    return date;
  }

  private validateStay(checkIn: Date, checkOut: Date, guests: number, maxGuests: number) {
    const today = parseIsoDate(todayIso());
    if (!today || checkIn < today) {
      return "Check-in cannot be in the past.";
    }
    const nights = nightsBetweenDates(checkIn, checkOut);
    if (nights < 1) {
      return "Check-out must be after check-in.";
    }
    if (nights > 366) {
      return "Stay length is not valid.";
    }
    return capacityError(guests, maxGuests);
  }

  private async isAvailable(propertyId: string, checkIn: Date, checkOut: Date) {
    const [booking, block] = await Promise.all([
      this.prisma.booking.findFirst({
        where: { propertyId, status: "CONFIRMED", checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
        select: { id: true },
      }),
      this.prisma.availabilityBlock.findFirst({
        where: { propertyId, date: { gte: checkIn, lt: checkOut } },
        select: { id: true },
      }),
    ]);
    return !booking && !block;
  }

  private async assertAvailable(tx: Prisma.TransactionClient, propertyId: string, checkIn: Date, checkOut: Date, ignoreBookingId?: string) {
    const booking = await tx.booking.findFirst({
      where: {
        propertyId,
        status: "CONFIRMED",
        id: ignoreBookingId ? { not: ignoreBookingId } : undefined,
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { id: true, reference: true },
    });
    if (booking) {
      throw new ConflictException({
        statusCode: 409,
        error: "Conflict",
        message: "Those dates are not available.",
        code: "AVAILABILITY_CONFLICT",
      });
    }
    const block = await tx.availabilityBlock.findFirst({
      where: { propertyId, date: { gte: checkIn, lt: checkOut } },
      select: { id: true },
    });
    if (block) {
      throw new ConflictException({
        statusCode: 409,
        error: "Conflict",
        message: "Those dates are not available.",
        code: "AVAILABILITY_CONFLICT",
      });
    }
  }

  private async lockProperty(tx: Prisma.TransactionClient, propertyId: string) {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM properties WHERE id = ${propertyId} FOR UPDATE`;
    if (rows.length === 0) {
      throw new NotFoundException("Property not found");
    }
  }

  private async allocateReference(tx: Prisma.TransactionClient) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const reference = createReference();
      const existing = await tx.booking.findUnique({ where: { reference }, select: { id: true } });
      if (!existing) {
        return reference;
      }
    }
    throw new ConflictException("Could not allocate a booking reference");
  }
}
