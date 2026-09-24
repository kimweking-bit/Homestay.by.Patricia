export type BookingQuery = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

export function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso() {
  return toIsoDate(new Date());
}

export function addDays(isoDate: string, days: number) {
  const date = parseIsoDate(isoDate);
  if (!date) {
    return null;
  }
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const start = parseIsoDate(checkIn);
  const end = parseIsoDate(checkOut);
  if (!start || !end) {
    return null;
  }

  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

export function formatMoney(amount: number) {
  return `RM ${amount.toLocaleString("en-MY")}`;
}

export function formatDisplayDate(isoDate: string) {
  const date = parseIsoDate(isoDate);
  if (!date) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function eachDateInRange(checkIn: string, checkOut: string) {
  const dates: string[] = [];
  const start = parseIsoDate(checkIn);
  const end = parseIsoDate(checkOut);
  if (!start || !end || end <= start) {
    return dates;
  }

  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function rangeOverlapsBlocked(checkIn: string, checkOut: string, blockedDates: Set<string>) {
  return eachDateInRange(checkIn, checkOut).some((date) => blockedDates.has(date));
}

export function bookingHref(propertyId: string, query: BookingQuery) {
  const params = new URLSearchParams();
  if (query.checkIn) {
    params.set("checkIn", query.checkIn);
  }
  if (query.checkOut) {
    params.set("checkOut", query.checkOut);
  }
  if (query.guests) {
    params.set("guests", query.guests);
  }

  const search = params.toString();
  return search ? `/booking/${propertyId}?${search}` : `/booking/${propertyId}`;
}

export function parseGuests(value: string | undefined, maxGuests: number) {
  const guests = Number(value);
  if (!Number.isInteger(guests) || guests < 1) {
    return 1;
  }
  return Math.min(guests, maxGuests);
}
