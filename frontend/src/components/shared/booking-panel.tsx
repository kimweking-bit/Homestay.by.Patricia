"use client";

import { useMemo, useState } from "react";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { getBlockedDates } from "@/lib/availability";
import { bookingHref, formatMoney, nightsBetween } from "@/lib/booking";
import type { Property } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

type BookingPanelProps = {
  property: Property;
  className?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: string | number;
};

export function BookingPanel({
  property,
  className,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests,
}: BookingPanelProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(() => {
    const parsed = Number(initialGuests);
    if (Number.isFinite(parsed) && parsed >= 1) {
      return Math.min(property.maxGuests, Math.max(1, Math.floor(parsed)));
    }
    return Math.min(2, Math.max(1, property.maxGuests));
  });

  const blockedDates = useMemo(() => getBlockedDates(), []);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null;
  const total = nights ? property.priceValue * nights : 0;
  const canRequest = Boolean(
    nights && nights > 0 && guests >= 1 && guests <= property.maxGuests,
  );

  return (
    <aside
      aria-labelledby="booking-panel-heading"
      className={cn("booking-panel", className)}
    >
      <header className="booking-panel-header">
        <div className="booking-panel-price-row">
          <Price
            amount={property.priceValue}
            className="booking-panel-price"
            suffix="/ night"
          />
        </div>
        <p className="booking-panel-kicker" id="booking-panel-heading">
          Request a stay — Patricia confirms personally
        </p>
      </header>

      {/* Guests first so they are reachable without scrolling past the calendar */}
      <div className="booking-panel-guests">
        <div className="booking-panel-guests-copy">
          <p className="booking-panel-guests-label">Guests</p>
          <p className="booking-panel-guests-hint">Max {property.maxGuests}</p>
        </div>
        <div className="booking-panel-guests-control">
          <button
            aria-label="Fewer guests"
            className="booking-panel-guest-btn"
            disabled={guests <= 1}
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            type="button"
          >
            −
          </button>
          <span aria-live="polite" className="booking-panel-guest-count">
            {guests}
          </span>
          <button
            aria-label="More guests"
            className="booking-panel-guest-btn"
            disabled={guests >= property.maxGuests}
            onClick={() =>
              setGuests((g) => Math.min(property.maxGuests, g + 1))
            }
            type="button"
          >
            +
          </button>
        </div>
      </div>

      <DateRangePicker
        blockedDates={blockedDates}
        checkIn={checkIn}
        checkOut={checkOut}
        onChange={({ checkIn: nextIn, checkOut: nextOut }) => {
          setCheckIn(nextIn);
          setCheckOut(nextOut);
        }}
      />

      {nights && nights > 0 ? (
        <div aria-live="polite" className="booking-panel-quote">
          <div className="booking-panel-quote-row">
            <span>
              {formatMoney(property.priceValue)} × {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </span>
            <span>{formatMoney(total)}</span>
          </div>
          <div className="booking-panel-quote-row is-total">
            <span>Estimated total</span>
            <Price amount={total} className="booking-panel-total-price" />
          </div>
          <p className="booking-panel-quote-note">
            Estimate only. No charge until Patricia confirms your request.
          </p>
        </div>
      ) : (
        <p className="booking-panel-nudge">
          {checkIn && !checkOut
            ? "Select a check-out date on the calendar."
            : "Select check-in and check-out to see your total."}
        </p>
      )}

      <div className="booking-panel-cta">
        {canRequest ? (
          <Button
            className="booking-panel-submit w-full"
            href={bookingHref(property.id, {
              checkIn,
              checkOut,
              guests: String(guests),
            })}
            variant="primary"
          >
            Request these dates
          </Button>
        ) : (
          <Button
            className="booking-panel-submit w-full"
            disabled
            type="button"
            variant="primary"
          >
            {checkIn && !checkOut ? "Select check-out" : "Select your dates"}
          </Button>
        )}
        <p className="booking-panel-reassure">
          You won’t pay now. Patricia reviews every stay request by hand.
        </p>
      </div>
    </aside>
  );
}
