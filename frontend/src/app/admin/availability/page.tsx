"use client";

import { useMemo, useState } from "react";
import { getOccupiedRanges, monthGrid } from "@/lib/availability";
import { toIsoDate } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { useDemoBookings } from "@/lib/demo-bookings";
import { properties } from "@/lib/mock-data";

export default function AdminAvailabilityPage() {
  const { bookings } = useDemoBookings();
  const [cursor, setCursor] = useState(() => new Date());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const occupied = useMemo(() => getOccupiedRanges(bookings), [bookings]);
  const occupiedDates = useMemo(() => new Set(occupied.flatMap((range) => range.dates)), [occupied]);
  const cells = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const label = new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(cursor);
  const today = toIsoDate(new Date());
  const property = properties[0];

  function toggleBlock(iso: string) {
    if (occupiedDates.has(iso) || iso < today) {
      return;
    }
    setBlocked((current) => {
      const next = new Set(current);
      if (next.has(iso)) {
        next.delete(iso);
      } else {
        next.add(iso);
      }
      return next;
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
      <p className="type-small mt-1 max-w-2xl text-[var(--muted)]">
        Reservation dates come from current request records. Host-blocked days stay in this browser until availability is connected.
      </p>
      <p className="mt-4 text-sm font-semibold">{property.name}</p>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          className="type-small min-h-11 border border-[var(--border)] px-3 font-semibold"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          type="button"
        >
          Previous
        </button>
        <p className="font-semibold">{label}</p>
        <button
          className="type-small min-h-11 border border-[var(--border)] px-3 font-semibold"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          type="button"
        >
          Next
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell.iso) {
            return <span className="min-h-16" key={`empty-${index}`} />;
          }

          const held = occupied.find((range) => range.dates.includes(cell.iso!) && range.status === "PENDING");
          const booked = occupied.find((range) => range.dates.includes(cell.iso!) && range.status === "CONFIRMED");
          const isBlocked = blocked.has(cell.iso);
          const isToday = cell.iso === today;

          return (
            <button
              className={cn(
                "min-h-16 border border-[var(--border)] bg-[var(--surface)] p-2 text-left text-sm",
                isToday && "ring-1 ring-[var(--color-gold)]",
                booked && "bg-[rgb(34_34_34_/_0.1)]",
                held && "bg-[rgb(255_56_92_/_0.12)]",
                isBlocked && "bg-[var(--surface-muted)]",
                cell.iso < today && "opacity-50",
              )}
              disabled={Boolean(booked || held) || cell.iso < today}
              key={cell.iso}
              onClick={() => toggleBlock(cell.iso!)}
              type="button"
            >
              <span className="font-semibold">{cell.date}</span>
              <span className="mt-1 block text-[11px] text-[var(--muted)]">
                {booked ? "Booked" : held ? "Held" : isBlocked ? "Blocked" : cell.iso < today ? "Past" : "Available"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 type-small text-[var(--muted)]">
        <span>Available</span>
        <span>Booked (confirmed)</span>
        <span>Held (pending review)</span>
        <span>Blocked (host)</span>
        <span>Today</span>
      </div>
    </div>
  );
}
