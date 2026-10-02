"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/services/api-client";
import { blockDate, getAdminAvailability, listAdminProperties, unblockDate } from "@/services/api/properties";
import { toIsoDate } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { monthGrid } from "@/lib/availability";

export default function AdminAvailabilityPage() {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedSlug, setSelectedSlug] = useState("");
  const properties = useQuery({ queryKey: ["admin-properties"], queryFn: listAdminProperties });
  const property = properties.data?.items.find((item) => item.slug === selectedSlug) ?? properties.data?.items[0];
  const availability = useQuery({
    queryKey: ["admin-availability", property?.slug],
    queryFn: () => getAdminAvailability(property?.slug ?? ""),
    enabled: Boolean(property),
  });
  const mutation = useMutation({
    mutationFn: ({ date, blocked }: { date: string; blocked: boolean }) =>
      blocked ? unblockDate(property?.slug ?? "", date) : blockDate(property?.slug ?? "", date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-availability", property?.slug] }),
  });

  const cells = useMemo(() => monthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const label = new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(cursor);
  const today = toIsoDate(new Date());
  const hostBlocked = new Set(availability.data?.hostBlockedDates ?? []);
  const confirmed = availability.data?.confirmedRanges ?? [];
  const held = availability.data?.openRequests ?? [];

  function toggleBlock(iso: string) {
    if (iso < today) return;
    mutation.mutate({ date: iso, blocked: hostBlocked.has(iso) });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
      <p className="type-small mt-1 max-w-2xl text-[var(--muted)]">
        Confirmed stays and host blocks come from the backend availability service.
      </p>
      {properties.isError ? (
        <p className="mt-4 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(properties.error, "Properties could not be loaded.")}
        </p>
      ) : null}
      {properties.isPending ? <p className="mt-4" role="status">Loading properties...</p> : null}
      {property ? (
        <label className="mt-5 block max-w-md text-sm font-semibold">
          Stay
          <select
            className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3"
            onChange={(event) => setSelectedSlug(event.target.value)}
            value={property.slug}
          >
            {properties.data?.items.map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </select>
        </label>
      ) : null}
      {availability.isError ? (
        <p className="mt-4 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(availability.error, "Availability could not be loaded.")}
        </p>
      ) : null}
      {mutation.isError ? (
        <p className="mt-4 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(mutation.error, "The availability block could not be updated.")}
        </p>
      ) : null}
      {property ? <p className="mt-4 text-sm font-semibold">{property.name}</p> : null}

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
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
      </div>
      {availability.isPending ? <p className="mt-2" role="status">Loading calendar availability...</p> : null}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell.iso) return <span className="min-h-16" key={`empty-${index}`} />;
          const confirmedRange = confirmed.find((range) => cell.iso! >= range.start && cell.iso! < range.end);
          const heldRange = held.find((range) => cell.iso! >= range.start && cell.iso! < range.end);
          const isBlocked = hostBlocked.has(cell.iso);
          const isToday = cell.iso === today;
          return (
            <button
              className={cn(
                "min-h-16 border border-[var(--border)] bg-[var(--surface)] p-2 text-left text-sm",
                isToday && "ring-1 ring-[var(--color-gold)]",
                confirmedRange && "bg-[rgb(34_34_34_/_0.1)]",
                heldRange && "bg-[rgb(255_56_92_/_0.12)]",
                isBlocked && "bg-[var(--surface-muted)]",
                cell.iso < today && "opacity-50",
              )}
              disabled={!availability.isSuccess || mutation.isPending || Boolean(confirmedRange || heldRange) || cell.iso < today}
              key={cell.iso}
              onClick={() => toggleBlock(cell.iso!)}
              type="button"
            >
              <span className="font-semibold">{cell.date}</span>
              <span className="mt-1 block text-[11px] text-[var(--muted)]">
                {confirmedRange ? "Booked" : heldRange ? "Held" : isBlocked ? "Blocked" : cell.iso < today ? "Past" : "Available"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 type-small text-[var(--muted)]">
        <span>Available</span><span>Booked (confirmed)</span><span>Held (open request)</span><span>Blocked (host)</span><span>Today</span>
      </div>
    </div>
  );
}
