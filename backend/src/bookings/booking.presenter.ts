import type { Prisma } from "@prisma/client";
import { countLabel, formatDisplayDate, formatIsoDate, formatMoney } from "../common/dates.js";

export const bookingInclude = {
  property: { select: { id: true, name: true, slug: true, maxGuests: true, pricePerNight: true, currency: true, status: true } },
  history: { orderBy: { createdAt: "asc" as const } },
  party: true,
} satisfies Prisma.BookingInclude;

export type BookingRecord = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

export function presentBooking(booking: BookingRecord) {
  const checkIn = formatIsoDate(booking.checkIn);
  const checkOut = formatIsoDate(booking.checkOut);
  return {
    id: booking.reference,
    bookingId: booking.id,
    reference: booking.reference,
    propertyId: booking.propertyId,
    propertyName: booking.property.name,
    propertySlug: booking.property.slug,
    guestName: `${booking.guestFirstName} ${booking.guestLastName}`.trim(),
    email: booking.guestEmail,
    phone: booking.guestPhone,
    dates: `${formatDisplayDate(checkIn)} - ${formatDisplayDate(checkOut)}`,
    checkIn,
    checkOut,
    guestCount: booking.guests,
    guests: countLabel(booking.guests, "guest", "guests"),
    status: booking.status,
    nights: booking.nights,
    nightlyRate: booking.nightlyRate,
    estimatedTotal: booking.estimatedTotal,
    currency: booking.currency,
    price: formatMoney(booking.estimatedTotal, booking.currency),
    request: booking.specialRequest ?? "",
    specialRequest: booking.specialRequest,
    party: booking.party.map((guest) => ({
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      isPrimary: guest.isPrimary,
    })),
    history: booking.history.map((entry) => ({
      id: entry.id,
      oldStatus: entry.oldStatus,
      newStatus: entry.newStatus,
      actorId: entry.actorId,
      note: entry.note,
      createdAt: entry.createdAt.toISOString(),
    })),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}
