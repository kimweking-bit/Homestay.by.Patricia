"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDisplayDate } from "@/lib/booking";
import { apiErrorMessage } from "@/services/api-client";
import { getBooking } from "@/services/api/bookings";

export default function BookingConfirmationPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingQuery = useQuery({
    queryKey: ["booking", params.bookingId],
    queryFn: () => getBooking(params.bookingId),
  });

  if (bookingQuery.isPending) {
    return <section className="site-container py-16" role="status">Loading your booking request...</section>;
  }

  if (bookingQuery.isError) {
    return (
      <section className="site-container py-16 md:py-24">
        <h1 className="type-h1">Your booking could not be loaded.</h1>
        <p className="type-body-large mt-5 text-[var(--muted)]" role="alert">
          {apiErrorMessage(bookingQuery.error, "Sign in with the account used to submit this request.")}
        </p>
        <div className="mt-8 flex gap-3">
          <Button href="/login">Sign in</Button>
          <Button href="/properties" variant="secondary">Back to stays</Button>
        </div>
      </section>
    );
  }

  const booking = bookingQuery.data;

  return (
    <section className="site-container py-16 md:py-24">
      <div className="max-w-2xl">
        <BrandMark href="/" showWordmark={false} size="lg" />
        <p className="eyebrow mt-8 mb-4 text-[var(--accent)]">Request received</p>
        <h1 className="type-h1 text-pretty">Patricia has received your booking request.</h1>
        <p className="type-body-large mt-5 text-[var(--muted)]">
          Your stay is not confirmed yet. She will review the dates and contact details, then approve or decline the request.
        </p>

        <dl className="mt-8 grid gap-4 border-y border-[var(--border)] py-6">
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-[var(--muted)]">Reference</dt>
            <dd className="font-semibold">{booking.reference}</dd>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-[var(--muted)]">Stay</dt>
            <dd className="font-semibold">{booking.propertyName}</dd>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-[var(--muted)]">Dates</dt>
            <dd className="font-semibold">
              {formatDisplayDate(booking.checkIn)} – {formatDisplayDate(booking.checkOut)} · {booking.nights} nights
            </dd>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-[var(--muted)]">Guests</dt>
            <dd className="font-semibold">{booking.guests}</dd>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-[var(--muted)]">Status</dt>
            <dd><StatusBadge status={booking.status} /></dd>
          </div>
        </dl>

        <ol className="mt-8 grid gap-5 sm:grid-cols-3">
          <li>
            <p className="font-semibold">Next</p>
            <p className="type-small mt-2 text-[var(--muted)]">Patricia checks availability.</p>
          </li>
          <li>
            <p className="font-semibold">Then</p>
            <p className="type-small mt-2 text-[var(--muted)]">You receive a confirmation update.</p>
          </li>
          <li>
            <p className="font-semibold">Finally</p>
            <p className="type-small mt-2 text-[var(--muted)]">Stay details are agreed directly.</p>
          </li>
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/account/bookings">View request status</Button>
          <Button href="/properties" variant="secondary">Back to stays</Button>
        </div>
      </div>
    </section>
  );
}
