"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDemoBookings } from "@/lib/demo-bookings";
import { properties, reviews } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const { bookings } = useDemoBookings();
  const pending = bookings.filter((booking) => booking.status === "PENDING");
  const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="type-small mt-1 text-[var(--muted)]">What needs attention in Sutera Stays operations.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pending requests", pending.length, "Needs a decision"],
          ["Confirmed stays", confirmed.length, "Approved reservations"],
          ["Properties", properties.length, "Published homes"],
          ["Reviews", reviews.length, "Verified guest notes"],
        ].map(([label, value, hint]) => (
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4" key={label}>
            <p className="type-small text-[var(--muted)]">{label}</p>
            <p className="mt-2 font-[var(--font-heading)] text-4xl font-semibold">{value}</p>
            <p className="type-small mt-2 text-[var(--muted)]">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Needs action</h2>
            <Link className="text-sm font-semibold hover:text-[var(--accent)]" href="/admin/bookings">
              All reservations
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {pending.length > 0 ? (
              pending.map((booking) => (
                <article className="border border-[var(--border)] bg-[var(--surface)] p-4" key={booking.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="type-small text-[var(--muted)]">
                        {booking.guestName} · {booking.dates}
                      </p>
                      <h3 className="mt-1 font-semibold">{booking.propertyName}</h3>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </article>
              ))
            ) : (
              <p className="type-small border-t border-[var(--border)] pt-4 text-[var(--muted)]">No pending requests.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Upcoming confirmed</h2>
          <div className="mt-4 grid gap-3">
            {confirmed.map((booking) => (
              <article className="border-t border-[var(--border)] pt-4" key={booking.id}>
                <p className="type-small text-[var(--muted)]">{booking.dates}</p>
                <p className="mt-1 font-semibold">{booking.guestName}</p>
                <p className="type-small text-[var(--muted)]">{booking.propertyName}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
