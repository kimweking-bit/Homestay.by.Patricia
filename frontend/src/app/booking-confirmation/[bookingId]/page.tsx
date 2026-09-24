import type { Metadata } from "next";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { formatDisplayDate, nightsBetween } from "@/lib/booking";
import { properties } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Request received",
  description: "Patricia has received your Sutera Stays booking request and will review the dates before confirming.",
};

type PageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string; property?: string }>;
};

export default async function BookingConfirmationPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const property = properties.find((item) => item.slug === query.property) ?? properties[0];
  const nights = query.checkIn && query.checkOut ? nightsBetween(query.checkIn, query.checkOut) : null;

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
            <dt className="text-[var(--muted)]">Stay</dt>
            <dd className="font-semibold">{property.name}</dd>
          </div>
          {query.checkIn && query.checkOut ? (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-[var(--muted)]">Dates</dt>
              <dd className="font-semibold">
                {formatDisplayDate(query.checkIn)} – {formatDisplayDate(query.checkOut)}
                {nights ? ` · ${nights} nights` : ""}
              </dd>
            </div>
          ) : null}
          {query.guests ? (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-[var(--muted)]">Guests</dt>
              <dd className="font-semibold">{query.guests}</dd>
            </div>
          ) : null}
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
          <Button href="/properties" variant="secondary">
            Back to stays
          </Button>
        </div>
      </div>
    </section>
  );
}
