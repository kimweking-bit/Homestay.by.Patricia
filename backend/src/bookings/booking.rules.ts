import { randomBytes } from "node:crypto";
import type { BookingStatus } from "@prisma/client";

export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ["REVIEWING", "CONFIRMED", "DECLINED", "CANCELLED"],
  REVIEWING: ["REQUESTED", "CONFIRMED", "DECLINED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  DECLINED: [],
  CANCELLED: [],
};

export const GUEST_CANCEL_FROM: BookingStatus[] = ["REQUESTED", "REVIEWING", "CONFIRMED"];
export const GUEST_EDIT_FROM: BookingStatus[] = ["REQUESTED", "REVIEWING"];

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function canTransition(from: BookingStatus, to: BookingStatus) {
  return BOOKING_TRANSITIONS[from].includes(to);
}

export function capacityError(guests: number, maxGuests: number) {
  if (!Number.isInteger(guests) || guests < 1) {
    return "Guest count must be at least 1.";
  }
  if (guests > maxGuests) {
    return `This stay accepts up to ${maxGuests} guests.`;
  }
  return null;
}

export function estimateTotal(nightlyRate: number, nights: number) {
  return nightlyRate * nights;
}

export function createReference(bytes: Uint8Array = randomBytes(6)) {
  let reference = "HBP-";
  for (const byte of bytes) {
    reference += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  }
  return reference;
}
