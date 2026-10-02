"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiErrorMessage } from "@/services/api-client";
import { listAdminBookings } from "@/services/api/bookings";
import { listAdminProperties } from "@/services/api/properties";
import { listAdminUsers } from "@/services/api/users";
import { reviews } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const bookings = useQuery({ queryKey: ["admin-bookings"], queryFn: listAdminBookings });
  const properties = useQuery({ queryKey: ["admin-properties"], queryFn: listAdminProperties });
  const users = useQuery({ queryKey: ["admin-users"], queryFn: listAdminUsers });

  const requests = bookings.data?.items ?? [];
  const pending = requests.filter((booking) => booking.status === "REQUESTED" || booking.status === "REVIEWING");
  const confirmed = requests.filter((booking) => booking.status === "CONFIRMED");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="type-small mt-1 text-[var(--muted)]">What needs attention in Homestay by Patricia operations.</p>

      {bookings.isError || properties.isError || users.isError ? (
        <p className="mt-4 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(bookings.error ?? properties.error ?? users.error, "Some dashboard data could not be loaded.")}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pending requests", bookings.isPending ? "…" : pending.length, "Needs a decision"],
          ["Confirmed stays", bookings.isPending ? "…" : confirmed.length, "Approved reservations"],
          ["Properties", properties.isPending ? "…" : properties.data?.total ?? 0, "Stored property records"],
          ["User accounts", users.isPending ? "…" : users.data?.total ?? 0, "Accounts visible to admins"],
        ].map(([label, value, hint]) => (
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4" key={label}>
            <p className="type-small text-[var(--muted)]">{label}</p>
            <p className="mt-2 font-[var(--font-heading)] text-4xl font-semibold" role="status">{value}</p>
            <p className="type-small mt-2 text-[var(--muted)]">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Needs action</h2>
            <Link className="text-sm font-semibold hover:text-[var(--accent)]" href="/admin/bookings">All reservations</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {bookings.isPending ? <p role="status">Loading requests...</p> : null}
            {pending.length > 0 ? pending.map((booking) => (
              <article className="border border-[var(--border)] bg-[var(--surface)] p-4" key={booking.bookingId}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="type-small text-[var(--muted)]">{booking.guestName} · {booking.dates}</p>
                    <h3 className="mt-1 font-semibold">{booking.propertyName}</h3>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </article>
            )) : bookings.isSuccess ? (
              <p className="type-small border-t border-[var(--border)] pt-4 text-[var(--muted)]">No pending requests.</p>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Upcoming confirmed</h2>
          <div className="mt-4 grid gap-3">
            {confirmed.map((booking) => (
              <article className="border-t border-[var(--border)] pt-4" key={booking.bookingId}>
                <p className="type-small text-[var(--muted)]">{booking.dates}</p>
                <p className="mt-1 font-semibold">{booking.guestName}</p>
                <p className="type-small text-[var(--muted)]">{booking.propertyName}</p>
              </article>
            ))}
            {bookings.isSuccess && confirmed.length === 0 ? <p className="type-small text-[var(--muted)]">No confirmed stays.</p> : null}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Guest notes</h2>
        <p className="type-small mt-2 text-[var(--muted)]">{reviews.length} curated notes shown on the public stay pages.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recent accounts</h2>
        {users.isPending ? <p className="mt-3" role="status">Loading accounts...</p> : null}
        {users.isSuccess && users.data.items.length === 0 ? (
          <p className="mt-3 type-small text-[var(--muted)]">No accounts found.</p>
        ) : null}
        {users.isSuccess && users.data.items.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                <tr><th className="py-3 pr-4">Name</th><th className="py-3 pr-4">Email</th><th className="py-3 pr-4">Role</th><th className="py-3">Created</th></tr>
              </thead>
              <tbody>
                {users.data.items.slice(0, 5).map((user) => (
                  <tr className="border-b border-[var(--border)]" key={user.id}>
                    <td className="py-3 pr-4">{user.firstName} {user.lastName}</td>
                    <td className="py-3 pr-4">{user.email}</td>
                    <td className="py-3 pr-4">{user.role}</td>
                    <td className="py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
