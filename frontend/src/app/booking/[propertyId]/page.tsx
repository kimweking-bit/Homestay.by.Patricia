"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppImage } from "@/components/ui/app-image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBlockedDates } from "@/lib/availability";
import { formatDisplayDate, formatMoney, nightsBetween, parseGuests, rangeOverlapsBlocked } from "@/lib/booking";
import { properties } from "@/lib/mock-data";

export default function BookingPage() {
  const params = useParams<{ propertyId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const property = useMemo(
    () => properties.find((item) => item.id === params.propertyId || item.slug === params.propertyId),
    [params.propertyId],
  );
  const blockedDates = useMemo(() => getBlockedDates(), []);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialCheckIn = searchParams.get("checkIn") ?? "";
  const initialCheckOut = searchParams.get("checkOut") ?? "";
  const initialGuests = property ? String(parseGuests(searchParams.get("guests") ?? undefined, property.maxGuests)) : "1";

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const requiredFields = ["firstName", "lastName", "email", "phone", "checkIn", "checkOut", "guests"];
    const missingField = requiredFields.find((field) => !form.get(field));
    const checkIn = String(form.get("checkIn") ?? "");
    const checkOut = String(form.get("checkOut") ?? "");
    const nights = nightsBetween(checkIn, checkOut);

    if (missingField) {
      setError("Please complete the required booking request details.");
      return;
    }

    if (!nights) {
      setError("Departure must be after arrival.");
      return;
    }

    if (rangeOverlapsBlocked(checkIn, checkOut, blockedDates)) {
      setError("Those dates are not available. Please choose another range.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    const query = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(form.get("guests")),
      property: property.slug,
    });
    window.setTimeout(() => router.push(`/booking-confirmation/demo-request?${query.toString()}`), 400);
  }

  if (!property) {
    return (
      <section className="site-container py-16 md:py-24">
        <h1 className="type-h1">This stay could not be found.</h1>
        <div className="mt-8">
          <Button href="/properties" variant="secondary">
            Back to stays
          </Button>
        </div>
      </section>
    );
  }

  const nights = nightsBetween(initialCheckIn, initialCheckOut);
  const overlap = initialCheckIn && initialCheckOut ? rangeOverlapsBlocked(initialCheckIn, initialCheckOut, blockedDates) : false;
  const total = nights ? nights * property.priceValue : null;
  const guestOptions = Array.from({ length: property.maxGuests }, (_, index) => ({
    value: String(index + 1),
    label: `${index + 1} ${index === 0 ? "guest" : "guests"}`,
  }));

  return (
    <section className="site-container grid gap-12 py-12 md:grid-cols-[minmax(0,1fr)_360px] md:py-20 lg:gap-16">
      <div>
        <p className="type-small text-[var(--muted)]">Booking request</p>
        <h1 className="type-h1 mt-2 text-pretty">Request {property.name}</h1>
        <p className="type-body-large mt-4 max-w-2xl text-[var(--muted)]">
          Submit your details. Patricia will review the request. Nothing is confirmed until she approves it.
        </p>

        <ol className="mt-8 grid gap-4 border-y border-[var(--border)] py-6 sm:grid-cols-3">
          {[
            ["01", "Dates and guests"],
            ["02", "Your details"],
            ["03", "Patricia reviews"],
          ].map(([step, label]) => (
            <li className="text-sm text-[var(--muted)]" key={step}>
              <span className="block font-semibold text-[var(--foreground)]">{step}</span>
              {label}
            </li>
          ))}
        </ol>

        <form className="mt-10 grid gap-5" onSubmit={submitRequest}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input defaultValue={initialCheckIn} label="Check-in" name="checkIn" required type="date" />
            <Input defaultValue={initialCheckOut} label="Check-out" name="checkOut" required type="date" />
          </div>
          <Select defaultValue={initialGuests} label="Guests" name="guests" options={guestOptions} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="First name" name="firstName" required />
            <Input label="Last name" name="lastName" required />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Email" name="email" required type="email" />
            <Input label="Phone" name="phone" required />
          </div>
          <Textarea label="Special request" name="specialRequest" />
          {error ? (
            <p className="type-body text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          ) : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending request..." : "Submit booking request"}
          </Button>
        </form>
      </div>

      <aside className="border border-[var(--border)] bg-[var(--surface)] p-5 md:self-start md:p-6">
        <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[var(--radius-image)] bg-[var(--surface-muted)]">
          <AppImage alt={property.imageAlt} className="image-cover" fill sizes="360px" src={property.heroImage} />
        </div>
        <h2 className="type-h3">{property.name}</h2>
        <p className="type-small mt-2 text-[var(--muted)]">{property.location}</p>
        <dl className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Nightly</dt>
            <dd className="font-semibold">{formatMoney(property.priceValue)}</dd>
          </div>
          {initialCheckIn && initialCheckOut ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Dates</dt>
              <dd className="font-semibold">
                {formatDisplayDate(initialCheckIn)} – {formatDisplayDate(initialCheckOut)}
              </dd>
            </div>
          ) : null}
          {nights && total && !overlap ? (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Nights</dt>
                <dd className="font-semibold">{nights}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-3">
                <dt className="font-semibold">Estimated total</dt>
                <dd className="font-semibold">{formatMoney(total)}</dd>
              </div>
            </>
          ) : null}
        </dl>
        <p className="type-small mt-5 text-[var(--muted)]">
          Availability on this page reflects current reservation records in the demo. Patricia remains the source of truth once operations are connected.
        </p>
      </aside>
    </section>
  );
}
