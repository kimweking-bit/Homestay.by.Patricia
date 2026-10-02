import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { eachNight, formatIsoDate, parseIsoDate, todayIso } from "../common/dates.js";
import type { CreateBlockDto, CreatePropertyDto, PropertyImageInput, PropertyRoomInput, UpdatePropertyDto } from "./dto.js";
import { presentProperty, propertyInclude } from "./property.presenter.js";

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(page: number, pageSize: number, query?: string) {
    const q = query?.trim();
    const where: Prisma.PropertyWhereInput = {
      status: "PUBLISHED",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { area: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return this.list(where, page, pageSize);
  }

  async listAdmin(page: number, pageSize: number) {
    return this.list({}, page, pageSize);
  }

  async getPublic(idOrSlug: string) {
    const property = await this.prisma.property.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: propertyInclude,
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }
    return presentProperty(property);
  }

  async getAdmin(idOrSlug: string) {
    return presentProperty(await this.requireProperty(idOrSlug, false));
  }

  async create(input: CreatePropertyDto, actorId: string) {
    const property = await this.prisma.property.create({
      data: {
        id: input.id,
        slug: input.slug,
        name: input.name,
        shortDescription: input.shortDescription,
        description: input.description,
        location: input.location,
        area: input.area,
        propertyType: input.propertyType,
        collection: input.collection ?? null,
        bedrooms: input.bedrooms,
        beds: input.beds,
        bathrooms: input.bathrooms,
        maxGuests: input.maxGuests,
        pricePerNight: input.pricePerNight,
        currency: (input.currency ?? "MYR").toUpperCase(),
        imageAlt: input.imageAlt,
        status: input.status ?? "PUBLISHED",
        ...this.relationCreates(input.amenities, input.houseRules, input.images, input.rooms),
      },
      include: propertyInclude,
    });
    await this.audit(actorId, "property.create", property.id, property.slug);
    return presentProperty(property);
  }

  async update(idOrSlug: string, input: UpdatePropertyDto, actorId: string) {
    const existing = await this.requireProperty(idOrSlug, false);
    const property = await this.prisma.$transaction(async (tx) => {
      if (input.amenities) {
        await this.replaceAmenities(tx, existing.id, input.amenities);
      }
      if (input.houseRules) {
        await tx.propertyHouseRule.deleteMany({ where: { propertyId: existing.id } });
        await tx.propertyHouseRule.createMany({
          data: input.houseRules.map((text, index) => ({ propertyId: existing.id, text, sortOrder: index })),
        });
      }
      if (input.images) {
        await tx.propertyImage.deleteMany({ where: { propertyId: existing.id } });
        await tx.propertyImage.createMany({ data: this.imageRows(existing.id, input.images) });
      }
      if (input.rooms) {
        await tx.propertyRoom.deleteMany({ where: { propertyId: existing.id } });
        await tx.propertyRoom.createMany({ data: this.roomRows(existing.id, input.rooms) });
      }
      return tx.property.update({
        where: { id: existing.id },
        data: {
          slug: input.slug,
          name: input.name,
          shortDescription: input.shortDescription,
          description: input.description,
          location: input.location,
          area: input.area,
          propertyType: input.propertyType,
          collection: input.collection,
          bedrooms: input.bedrooms,
          beds: input.beds,
          bathrooms: input.bathrooms,
          maxGuests: input.maxGuests,
          pricePerNight: input.pricePerNight,
          currency: input.currency?.toUpperCase(),
          imageAlt: input.imageAlt,
          status: input.status,
        },
        include: propertyInclude,
      });
    });
    await this.audit(actorId, "property.update", property.id, property.slug);
    return presentProperty(property);
  }

  async archive(idOrSlug: string, actorId: string) {
    const existing = await this.requireProperty(idOrSlug, false);
    const property = await this.prisma.property.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
      include: propertyInclude,
    });
    await this.audit(actorId, "property.archive", property.id, property.slug);
    return presentProperty(property);
  }

  async replaceAmenityNames(idOrSlug: string, names: string[], actorId: string) {
    const existing = await this.requireProperty(idOrSlug, false);
    await this.prisma.$transaction(async (tx) => {
      await this.replaceAmenities(tx, existing.id, names);
    });
    await this.audit(actorId, "property.amenities", existing.id);
    return this.getAdmin(existing.id);
  }

  async addImage(idOrSlug: string, image: PropertyImageInput, actorId: string) {
    const existing = await this.requireProperty(idOrSlug, false);
    const created = await this.prisma.propertyImage.create({
      data: {
        propertyId: existing.id,
        url: image.url,
        publicId: image.publicId,
        alt: image.alt,
        caption: image.caption,
        category: image.category ?? "gallery",
        sortOrder: image.sortOrder ?? 0,
      },
    });
    await this.audit(actorId, "property.image.create", existing.id, created.id);
    return created;
  }

  async removeImage(idOrSlug: string, imageId: string, actorId: string) {
    const existing = await this.requireProperty(idOrSlug, false);
    const image = await this.prisma.propertyImage.findFirst({ where: { id: imageId, propertyId: existing.id } });
    if (!image) {
      throw new NotFoundException("Image not found");
    }
    await this.prisma.propertyImage.delete({ where: { id: image.id } });
    await this.audit(actorId, "property.image.delete", existing.id, image.id);
    return { ok: true };
  }

  async addBlock(idOrSlug: string, input: CreateBlockDto, actorId: string) {
    const existing = await this.requireProperty(idOrSlug, false);
    const date = parseIsoDate(input.date);
    if (!date) {
      throw new BadRequestException("Date is not valid");
    }
    const conflict = await this.prisma.booking.findFirst({
      where: {
        propertyId: existing.id,
        status: "CONFIRMED",
        checkIn: { lte: date },
        checkOut: { gt: date },
      },
      select: { id: true },
    });
    if (conflict) {
      throw new ConflictException({
        statusCode: 409,
        error: "Conflict",
        message: "That night is already confirmed for a stay.",
        code: "AVAILABILITY_CONFLICT",
      });
    }
    const block = await this.prisma.availabilityBlock.upsert({
      where: { propertyId_date: { propertyId: existing.id, date } },
      update: { note: input.note ?? null, createdById: actorId },
      create: { propertyId: existing.id, date, note: input.note ?? null, createdById: actorId },
    });
    await this.audit(actorId, "availability.block", existing.id, input.date);
    return { id: block.id, date: formatIsoDate(block.date), note: block.note };
  }

  async removeBlock(idOrSlug: string, dateValue: string, actorId: string) {
    const existing = await this.requireProperty(idOrSlug, false);
    const date = parseIsoDate(dateValue);
    if (!date) {
      throw new BadRequestException("Date is not valid");
    }
    await this.prisma.availabilityBlock.deleteMany({ where: { propertyId: existing.id, date } });
    await this.audit(actorId, "availability.unblock", existing.id, dateValue);
    return { ok: true };
  }

  async availability(idOrSlug: string, fromValue: string | undefined, toValue: string | undefined, includeGuests: boolean) {
    const property = await this.requireProperty(idOrSlug, !includeGuests);
    const from = parseIsoDate(fromValue ?? todayIso()) ?? parseIsoDate(todayIso());
    const defaultTo = new Date(from!);
    defaultTo.setUTCMonth(defaultTo.getUTCMonth() + 18);
    const to = parseIsoDate(toValue ?? formatIsoDate(defaultTo)) ?? defaultTo;
    if (!from || to <= from) {
      throw new BadRequestException("Availability range is not valid");
    }

    const [confirmed, blocks, requests] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          propertyId: property.id,
          status: "CONFIRMED",
          checkIn: { lt: to },
          checkOut: { gt: from },
        },
        select: { id: true, reference: true, checkIn: true, checkOut: true },
      }),
      this.prisma.availabilityBlock.findMany({
        where: { propertyId: property.id, date: { gte: from, lt: to } },
        select: { date: true, note: true },
      }),
      includeGuests
        ? this.prisma.booking.findMany({
            where: {
              propertyId: property.id,
              status: { in: ["REQUESTED", "REVIEWING"] },
              checkIn: { lt: to },
              checkOut: { gt: from },
            },
            select: {
              id: true,
              reference: true,
              status: true,
              checkIn: true,
              checkOut: true,
              guestFirstName: true,
              guestLastName: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const blocked = new Set<string>();
    for (const booking of confirmed) {
      for (const night of eachNight(booking.checkIn, booking.checkOut)) {
        blocked.add(night);
      }
    }
    const hostBlockedDates = blocks.map((block) => formatIsoDate(block.date));
    for (const date of hostBlockedDates) {
      blocked.add(date);
    }

    return {
      propertyId: property.id,
      from: formatIsoDate(from),
      to: formatIsoDate(to),
      blockedDates: [...blocked].sort(),
      hostBlockedDates: hostBlockedDates.sort(),
      confirmedRanges: confirmed.map((booking) => ({
        bookingId: booking.id,
        reference: booking.reference,
        start: formatIsoDate(booking.checkIn),
        end: formatIsoDate(booking.checkOut),
      })),
      openRequests: requests.map((booking) => ({
        bookingId: booking.id,
        reference: booking.reference,
        status: booking.status,
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`.trim(),
        start: formatIsoDate(booking.checkIn),
        end: formatIsoDate(booking.checkOut),
      })),
    };
  }

  private async list(where: Prisma.PropertyWhereInput, page: number, pageSize: number) {
    const [total, items] = await this.prisma.$transaction([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        include: propertyInclude,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items: items.map(presentProperty), page, pageSize, total };
  }

  private async requireProperty(idOrSlug: string, publishedOnly: boolean) {
    const property = await this.prisma.property.findFirst({
      where: {
        ...(publishedOnly ? { status: "PUBLISHED" } : {}),
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: propertyInclude,
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }
    return property;
  }

  private relationCreates(amenities: string[], houseRules: string[], images: PropertyImageInput[], rooms: PropertyRoomInput[]) {
    return {
      houseRules: { create: houseRules.map((text, index) => ({ text, sortOrder: index })) },
      rooms: { create: rooms.map((room, index) => ({ name: room.name, imageUrl: room.imageUrl, sortOrder: index })) },
      images: { create: images.map((image, index) => this.imageData(image, index)) },
      amenities: {
        create: amenities.map((name) => ({
          amenity: {
            connectOrCreate: { where: { name }, create: { name } },
          },
        })),
      },
    };
  }

  private imageData(image: PropertyImageInput, index: number) {
    return {
      url: image.url,
      publicId: image.publicId,
      alt: image.alt,
      caption: image.caption,
      category: image.category ?? (index === 0 ? "hero" : "gallery"),
      sortOrder: image.sortOrder ?? index,
    };
  }

  private imageRows(propertyId: string, images: PropertyImageInput[]) {
    return images.map((image, index) => ({ propertyId, ...this.imageData(image, index) }));
  }

  private roomRows(propertyId: string, rooms: PropertyRoomInput[]) {
    return rooms.map((room, index) => ({ propertyId, name: room.name, imageUrl: room.imageUrl, sortOrder: index }));
  }

  private async replaceAmenities(tx: Prisma.TransactionClient, propertyId: string, names: string[]) {
    await tx.propertyAmenity.deleteMany({ where: { propertyId } });
    for (const name of [...new Set(names.map((item) => item.trim()).filter(Boolean))]) {
      const amenity = await tx.amenity.upsert({ where: { name }, update: {}, create: { name } });
      await tx.propertyAmenity.create({ data: { propertyId, amenityId: amenity.id } });
    }
  }

  private audit(actorId: string, action: string, entityId: string, note?: string) {
    return this.prisma.auditLog.create({
      data: { actorId, action, entityType: "property", entityId, note },
    });
  }
}
