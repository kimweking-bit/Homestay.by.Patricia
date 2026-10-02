"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiErrorMessage } from "@/services/api-client";
import { getSession, logoutAccount } from "@/services/api/auth";
import { listMyBookings } from "@/services/api/bookings";

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [logoutError, setLogoutError] = useState("");
  const session = useQuery({ queryKey: ["session"], queryFn: getSession, retry: false });
  const bookings = useQuery({ queryKey: ["my-bookings"], queryFn: listMyBookings });
  const logout = useMutation({
    mutationFn: logoutAccount,
    onSuccess: () => {
      queryClient.setQueryData(["session"], null);
      queryClient.removeQueries({ queryKey: ["my-bookings"] });
      router.replace("/");
    },
    onError: (error) => setLogoutError(apiErrorMessage(error, "Sign out failed. Please try again.")),
  });

  const allBookings = bookings.data?.items ?? [];
  const upcoming = allBookings.filter((booking) => ["REQUESTED", "REVIEWING", "CONFIRMED"].includes(booking.status));
  const past = allBookings.filter((booking) => ["CANCELLED", "DECLINED"].includes(booking.status));

  return (
    <section className="site-container py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Guest account</h1>
          <p className="type-small mt-2 text-[var(--muted)]">
            {session.data ? `Welcome, ${session.data.firstName}.` : "Reservations, profile, and support for your stay requests."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button href="/account/profile" variant="secondary">Edit profile</Button>
          <Button disabled={logout.isPending} onClick={() => logout.mutate()} type="button" variant="secondary">
            {logout.isPending ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
      {logoutError ? <p className="mt-4 text-[var(--color-danger)]" role="alert">{logoutError}</p> : null}

      <nav className="mt-8 flex flex-wrap gap-4 border-b border-[var(--border)] pb-3 text-sm font-semibold">
        <span className="border-b-2 border-[var(--color-gold)] pb-3">Overview</span>
        <Link className="pb-3 text-[var(--muted)] hover:text-[var(--foreground)]" href="/account/bookings">Reservations</Link>
        <Link className="pb-3 text-[var(--muted)] hover:text-[var(--foreground)]" href="/account/profile">Profile</Link>
      </nav>

      {bookings.isPending ? <p className="mt-8" role="status">Loading your reservations...</p> : null}
      {bookings.isError ? (
        <p className="mt-8 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(bookings.error, "Your reservations could not be loaded.")}
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-lg font-semibold">Upcoming</h2>
          <div className="mt-4 grid gap-4">
            {upcoming.map((booking) => (
              <article className="border border-[var(--border)] bg-[var(--surface)] p-5" key={booking.bookingId}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="type-small text-[var(--muted)]">{booking.dates} · {booking.reference}</p>
                    <h3 className="mt-1 text-xl font-semibold">{booking.propertyName}</h3>
                    <p className="type-small mt-2 text-[var(--muted)]">{booking.guests} · {booking.price}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </article>
            ))}
            {bookings.isSuccess && upcoming.length === 0 ? <p className="type-small text-[var(--muted)]">No upcoming requests.</p> : null}
          </div>

          <h2 className="mt-10 text-lg font-semibold">Past</h2>
          <div className="mt-4 grid gap-4">
            {past.map((booking) => (
              <article className="border-t border-[var(--border)] pt-4" key={booking.bookingId}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="type-small text-[var(--muted)]">{booking.dates}</p>
                    <h3 className="mt-1 font-semibold">{booking.propertyName}</h3>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </article>
            ))}
            {bookings.isSuccess && past.length === 0 ? <p className="type-small text-[var(--muted)]">No past stays yet.</p> : null}
          </div>
        </div>

        <aside className="grid gap-5 self-start">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Saved stays</h2>
            <p className="type-small mt-2 text-[var(--muted)]">Saved homes will appear here when favorites are available.</p>
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Support</h2>
            <p className="type-small mt-2 text-[var(--muted)]">Need to change dates or ask about a request?</p>
            <div className="mt-4"><Button href="/contact" variant="secondary">Contact Patricia</Button></div>
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Payment methods</h2>
            <p className="type-small mt-2 text-[var(--muted)]">No payment details are stored on this page. Payment collection is not enabled.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
