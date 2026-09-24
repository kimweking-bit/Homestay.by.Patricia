import { eachDateInRange } from "@/lib/booking";
import { demoBookings, type BookingStatus } from "@/lib/mock-data";

const occupyingStatuses: BookingStatus[] = ["PENDING", "CONFIRMED"];

const monthLookup: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseDemoDate(value: string) {
  const match = value.trim().match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/);
  if (!match) {
    return null;
  }

  const month = monthLookup[match[2]];
  if (month === undefined) {
    return null;
  }

  const date = new Date(Number(match[3]), month, Number(match[1]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type OccupiedRange = {
  bookingId: string;
  guestName: string;
  status: BookingStatus;
  start: string;
  end: string;
  dates: string[];
};

export function parseDemoDateRange(label: string) {
  const [startLabel, endLabel] = label.split(" - ").map((part) => part.trim());
  const start = parseDemoDate(startLabel);
  const end = parseDemoDate(endLabel);
  if (!start || !end) {
    return null;
  }

  return {
    start: toIso(start),
    end: toIso(end),
  };
}

export function getOccupiedRanges(bookings = demoBookings): OccupiedRange[] {
  return bookings.flatMap((booking) => {
    if (!occupyingStatuses.includes(booking.status)) {
      return [];
    }

    const range = parseDemoDateRange(booking.dates);
    if (!range) {
      return [];
    }

    return [
      {
        bookingId: booking.id,
        guestName: booking.guestName,
        status: booking.status,
        start: range.start,
        end: range.end,
        dates: eachDateInRange(range.start, range.end),
      },
    ];
  });
}

export function getBlockedDates(bookings = demoBookings) {
  return new Set(getOccupiedRanges(bookings).flatMap((range) => range.dates));
}

export type CalendarDayState = "available" | "booked" | "held" | "blocked" | "selected" | "today" | "past";

export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string | null; date: number | null }> = [];

  for (let index = 0; index < startWeekday; index += 1) {
    cells.push({ iso: null, date: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ iso, date: day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ iso: null, date: null });
  }

  return cells;
}
