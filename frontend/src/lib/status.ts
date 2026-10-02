import type { BookingStatus } from "@/lib/mock-data";

export const bookingStatusLabel: Record<BookingStatus, string> = {
  PENDING: "Pending review",
  REQUESTED: "Pending review",
  REVIEWING: "Under review",
  CONFIRMED: "Confirmed",
  REJECTED: "Declined",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

export const bookingStatusDescription: Record<BookingStatus, string> = {
  PENDING: "Patricia is reviewing this request.",
  REQUESTED: "Patricia is reviewing this request.",
  REVIEWING: "Patricia is reviewing this request.",
  CONFIRMED: "This stay is approved.",
  REJECTED: "This request was declined.",
  DECLINED: "This request was declined.",
  CANCELLED: "This stay is no longer active.",
};
