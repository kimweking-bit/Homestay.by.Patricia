"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useDemoBookings } from "@/lib/demo-bookings";

export default function AdminBookingsPage() {
  const { bookings, setStatus } = useDemoBookings();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reservations</h1>
      <p className="type-small mt-1 text-[var(--muted)]">
        Approve or decline stay requests. Changes stay in this browser until the reservations service is connected.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted)]">
            <tr>
              <th className="py-3 pr-4 font-semibold">Guest</th>
              <th className="py-3 pr-4 font-semibold">Stay</th>
              <th className="py-3 pr-4 font-semibold">Dates</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr className="border-b border-[var(--border)] align-top" key={booking.id}>
                <td className="py-4 pr-4">
                  <p className="font-semibold">{booking.guestName}</p>
                  <p className="type-small text-[var(--muted)]">{booking.email}</p>
                  <p className="type-small mt-2 text-[var(--muted)]">{booking.request}</p>
                </td>
                <td className="py-4 pr-4">
                  {booking.propertyName}
                  <p className="type-small text-[var(--muted)]">
                    {booking.guests} · {booking.price}
                  </p>
                </td>
                <td className="py-4 pr-4 whitespace-nowrap">{booking.dates}</td>
                <td className="py-4 pr-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="py-4">
                  {booking.status === "PENDING" ? (
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setStatus(booking.id, "CONFIRMED")} type="button" variant="constructive">
                        Approve
                      </Button>
                      <Button onClick={() => setStatus(booking.id, "REJECTED")} type="button" variant="destructive">
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <p className="type-small text-[var(--muted)]">No action</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
