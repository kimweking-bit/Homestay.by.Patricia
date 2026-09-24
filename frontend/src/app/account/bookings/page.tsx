import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoBookings } from "@/lib/mock-data";
import { bookingStatusDescription } from "@/lib/status";

export default function AccountBookingsPage() {
  return (
    <section className="site-container py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Reservations</h1>
      <p className="type-small mt-2 text-[var(--muted)]">Stay requests and their current status.</p>

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
            {demoBookings.map((booking) => (
              <tr className="border-b border-[var(--border)]" key={booking.id}>
                <td className="py-4 pr-4 text-[var(--muted)]">{booking.id}</td>
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
    </section>
  );
}
