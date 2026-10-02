"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDisplayDate, formatMoney, nightsBetween, parseGuests, rangeOverlapsBlocked } from "@/lib/booking";
import { apiErrorMessage, ApiClientError } from "@/services/api-client";
import { createBooking, quoteBooking } from "@/services/api/bookings";
import { getAvailability, getProperty } from "@/services/api/properties";

export default function BookingPage() {
  const params = useParams<{ propertyId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const propertyQuery = useQuery({
    queryKey: ["property", params.propertyId],
    queryFn: () => getProperty(params.propertyId),
  });
  const property = propertyQuery.data;
  const availabilityQuery = useQuery({
    queryKey: ["availability", property?.slug],
    queryFn: () => getAvailability(property?.slug ?? params.propertyId),
    enabled: Boolean(property),
  });
  const blockedDatesArray = availabilityQuery.data?.blockedDates ?? [];
  const blockedDates = new Set(blockedDatesArray);

  const initialCheckIn = searchParams.get("checkIn") ?? "";
  const initialCheckOut = searchParams.get("checkOut") ?? "";
  const initialGuests = property ? String(parseGuests(searchParams.get("guests") ?? undefined, property.maxGuests)) : "1";

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
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
    setNeedsSignIn(false);
    try {
      const guests = Number(form.get("guests"));
      const quote = await quoteBooking({
        propertyId: property.id,
        checkIn,
        checkOut,
        guests,
      });
      if (!quote.available) {
        setError("Those dates are not available. Please choose another range.");
        return;
      }
      const booking = await createBooking({
        propertyId: property.id,
        checkIn,
        checkOut,
        guests,
        firstName: String(form.get("firstName") ?? "").trim(),
        lastName: String(form.get("lastName") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        specialRequest: String(form.get("specialRequest") ?? "").trim() || undefined,
      });
      router.push(`/booking-confirmation/${encodeURIComponent(booking.reference)}`);
    } catch (submitError) {
      setNeedsSignIn(submitError instanceof ApiClientError && submitError.status === 401);
      setError(apiErrorMessage(submitError, "We could not submit your booking request. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (propertyQuery.isPending) {
    return <section className="site-container py-16" role="status">Loading stay details...</section>;
  }

  if (propertyQuery.isError || !property) {
    return (
      <section className="site-container py-16 md:py-24">
        <h1 className="type-h1">This stay could not be loaded.</h1>
        <p className="type-body mt-4 text-[var(--muted)]" role="alert">
          {apiErrorMessage(propertyQuery.error, "The property service is temporarily unavailable.")}
        </p>
        <div className="mt-8">
          <Button href="/properties" variant="secondary">Back to stays</Button>
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
            <Input defaultValue={initialCheckIn} label="Check-in" min={new Date().toISOString().slice(0, 10)} name="checkIn" required type="date" />
            <Input defaultValue={initialCheckOut} label="Check-out" min={new Date().toISOString().slice(0, 10)} name="checkOut" required type="date" />
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
            <div role="alert">
              <p className="type-body text-[var(--color-danger)]">{error}</p>
              {needsSignIn ? (
                <Link
                  className="mt-2 inline-block font-semibold underline"
                  href={`/login?next=${encodeURIComponent(`/booking/${params.propertyId}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)}`}
                >
                  Sign in or create an account to send this request
                </Link>
              ) : null}
            </div>
          ) : null}
          {availabilityQuery.isError ? (
            <p className="type-small text-[var(--color-danger)]" role="alert">
              {apiErrorMessage(availabilityQuery.error, "Availability could not be checked.")}
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
          Availability on this page reflects current reservation records. Patricia remains the source of truth when she confirms a stay.
        </p>
      </aside>
    </section>
  );
}
