"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/status-badge";
import { bookingStatusDescription } from "@/lib/status";
import { apiErrorMessage } from "@/services/api-client";
import { listMyBookings } from "@/services/api/bookings";

export default function AccountBookingsPage() {
  const bookingsQuery = useQuery({
    queryKey: ["my-bookings"],
    queryFn: listMyBookings,
  });

  return (
    <section className="site-container py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Reservations</h1>
      <p className="type-small mt-2 text-[var(--muted)]">Stay requests and their current status.</p>

      {bookingsQuery.isPending ? <p className="mt-8" role="status">Loading your reservations...</p> : null}
      {bookingsQuery.isError ? (
        <p className="mt-8 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(bookingsQuery.error, "Your reservations could not be loaded.")}
        </p>
      ) : null}
      {bookingsQuery.isSuccess && bookingsQuery.data.items.length === 0 ? (
        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p>No booking requests yet.</p>
          <Link className="mt-3 inline-block font-semibold underline" href="/properties">Browse stays</Link>
        </div>
      ) : null}

      {bookingsQuery.isSuccess && bookingsQuery.data.items.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th className="py-3 pr-4 font-semibold">Reference</th>
                <th className="py-3 pr-4 font-semibold">Stay</th>
                <th className="py-3 pr-4 font-semibold">Dates</th>
                <th className="py-3 pr-4 font-semibold">Guests</th>
                <th className="py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingsQuery.data.items.map((booking) => (
                <tr className="border-b border-[var(--border)]" key={booking.bookingId}>
                  <td className="py-4 pr-4 text-[var(--muted)]">{booking.reference}</td>
                  <td className="py-4 pr-4">
                    <Link className="font-semibold hover:text-[var(--accent)]" href={`/properties/${booking.propertySlug}`}>
                      {booking.propertyName}
                    </Link>
                  </td>
                  <td className="py-4 pr-4">{booking.dates}</td>
                  <td className="py-4 pr-4">{booking.guests}</td>
                  <td className="py-4">
                    <StatusBadge status={booking.status} />
                    <p className="type-small mt-2 text-[var(--muted)]">{bookingStatusDescription[booking.status]}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
