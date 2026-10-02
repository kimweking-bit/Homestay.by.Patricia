import { apiRequest } from "@/services/api-client";

export type ApiBookingStatus = "REQUESTED" | "REVIEWING" | "CONFIRMED" | "DECLINED" | "CANCELLED";

export type BookingHistoryEntry = {
  id: string;
  oldStatus: ApiBookingStatus | null;
  newStatus: ApiBookingStatus;
  actorId: string | null;
  note: string | null;
  createdAt: string;
};

export type BookingRecord = {
  id: string;
  bookingId: string;
  reference: string;
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  guestName: string;
  email: string;
  phone: string;
  dates: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guests: string;
  status: ApiBookingStatus;
  nights: number;
  nightlyRate: number;
  estimatedTotal: number;
  currency: string;
  price: string;
  request: string;
  history: BookingHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type BookingList = {
  items: BookingRecord[];
  page: number;
  pageSize: number;
  total: number;
};

export type BookingQuote = {
  propertyId: string;
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  nightlyRate: number;
  estimatedTotal: number;
  currency: string;
  available: boolean;
};

export type CreateBookingInput = {
  propertyId?: string;
  propertySlug?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequest?: string;
};

export function quoteBooking(input: Pick<CreateBookingInput, "propertyId" | "propertySlug" | "checkIn" | "checkOut" | "guests">) {
  return apiRequest<BookingQuote>("/bookings/quote", { method: "POST", body: input });
}

export function createBooking(input: CreateBookingInput) {
  return apiRequest<BookingRecord>("/bookings", { method: "POST", body: input });
}

export function listMyBookings() {
  return apiRequest<BookingList>("/bookings?pageSize=50");
}

export function getBooking(idOrReference: string) {
  return apiRequest<BookingRecord>(`/bookings/${encodeURIComponent(idOrReference)}`);
}

export function updateBooking(idOrReference: string, input: { checkIn?: string; checkOut?: string; guests?: number; specialRequest?: string }) {
  return apiRequest<BookingRecord>(`/bookings/${encodeURIComponent(idOrReference)}`, { method: "PATCH", body: input });
}

export function cancelBooking(idOrReference: string, note?: string) {
  return apiRequest<BookingRecord>(`/bookings/${encodeURIComponent(idOrReference)}/cancel`, { method: "POST", body: { note } });
}

export function listAdminBookings() {
  return apiRequest<BookingList>("/admin/bookings?pageSize=50");
}

export function updateBookingStatus(idOrReference: string, status: ApiBookingStatus, note?: string) {
  return apiRequest<BookingRecord>(`/admin/bookings/${encodeURIComponent(idOrReference)}/status`, { method: "PATCH", body: { status, note } });
}
