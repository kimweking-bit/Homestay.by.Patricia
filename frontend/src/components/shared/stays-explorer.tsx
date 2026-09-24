"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "@/components/shared/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Property } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

type StaysExplorerProps = {
  properties: Property[];
};

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function StaysExplorer({ properties }: StaysExplorerProps) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [guests, setGuests] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const areas = useMemo(
    () => uniqueSorted(properties.map((property) => property.area || property.location)),
    [properties],
  );
  const types = useMemo(
    () => uniqueSorted(properties.map((property) => property.propertyType)),
    [properties],
  );

  const filtersActive =
    query.trim().length > 0 || area !== "all" || propertyType !== "all" || guests !== "all";

  const activeCount = [
    query.trim().length > 0,
    area !== "all",
    propertyType !== "all",
    guests !== "all",
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const minGuests = guests === "all" ? 0 : Number(guests);

    return properties.filter((property) => {
      if (area !== "all") {
        const propertyArea = property.area || property.location;
        if (propertyArea !== area) return false;
      }

      if (propertyType !== "all" && property.propertyType !== propertyType) {
        return false;
      }

      if (minGuests > 0 && property.maxGuests < minGuests) {
        return false;
      }

      if (!needle) return true;

      const haystack = [
        property.name,
        property.location,
        property.area,
        property.propertyType,
        property.shortDescription,
        property.description,
        ...(property.amenities ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [area, guests, properties, propertyType, query]);

  function clearFilters() {
    setQuery("");
    setArea("all");
    setPropertyType("all");
    setGuests("all");
  }

  const resultLabel =
    filtered.length === properties.length
      ? `${properties.length} ${properties.length === 1 ? "stay" : "stays"}`
      : `${filtered.length} of ${properties.length} stays`;

  return (
    <div className="stays-explorer">
      <section className="stays-filter" aria-labelledby="stays-filter-heading">
        <div className="stays-filter-bar">
          <div className="stays-filter-lead">
            <h2 id="stays-filter-heading" className="stays-filter-title">
              Browse stays
            </h2>
            <p className="stays-filter-count" aria-live="polite">
              {resultLabel}
            </p>
          </div>

          <div className="stays-filter-bar-actions">
            {filtersActive ? (
              <button className="stays-filter-clear" onClick={clearFilters} type="button">
                Clear all
              </button>
            ) : null}

            <button
              aria-controls="stays-filter-panel"
              aria-expanded={filtersOpen}
              className={cn("stays-filter-toggle", filtersActive && "is-active")}
              onClick={() => setFiltersOpen((open) => !open)}
              type="button"
            >
              Filters
              {activeCount > 0 ? (
                <span className="stays-filter-toggle-count" aria-hidden="true">
                  {activeCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {filtersActive ? (
          <div className="stays-filter-chips" aria-label="Active filters">
            {query.trim() ? (
              <button
                className="stays-filter-chip"
                onClick={() => setQuery("")}
                type="button"
                aria-label={`Remove search “${query.trim()}”`}
              >
                <span>Search · {query.trim()}</span>
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
            {area !== "all" ? (
              <button
                className="stays-filter-chip"
                onClick={() => setArea("all")}
                type="button"
                aria-label={`Remove area ${area}`}
              >
                <span>Area · {area}</span>
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
            {propertyType !== "all" ? (
              <button
                className="stays-filter-chip"
                onClick={() => setPropertyType("all")}
                type="button"
                aria-label={`Remove type ${propertyType}`}
              >
                <span>Type · {propertyType}</span>
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
            {guests !== "all" ? (
              <button
                className="stays-filter-chip"
                onClick={() => setGuests("all")}
                type="button"
                aria-label={`Remove ${guests} guests filter`}
              >
                <span>Guests · {guests} guests</span>
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn("stays-filter-panel", filtersOpen && "is-open")}
          id="stays-filter-panel"
        >
          <div className="stays-filter-grid">
            <div className="stays-filter-search">
              <Input
                className={cn(query.trim() && "is-active-control")}
                label="Search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, area, amenity…"
                value={query}
              />
            </div>

            <Select
              className={cn(area !== "all" && "is-active-control")}
              label="Area"
              onChange={(event) => setArea(event.target.value)}
              options={[
                { label: "All areas", value: "all" },
                ...areas.map((value) => ({ label: value, value })),
              ]}
              value={area}
            />

            <Select
              className={cn(propertyType !== "all" && "is-active-control")}
              label="Type"
              onChange={(event) => setPropertyType(event.target.value)}
              options={[
                { label: "All types", value: "all" },
                ...types.map((value) => ({ label: value, value })),
              ]}
              value={propertyType}
            />

            <Select
              className={cn(guests !== "all" && "is-active-control")}
              label="Guests"
              onChange={(event) => setGuests(event.target.value)}
              options={[
                { label: "Any number of guests", value: "all" },
                { label: "2 guests", value: "2" },
                { label: "4 guests", value: "4" },
                { label: "6 guests", value: "6" },
                { label: "8 guests", value: "8" },
              ]}
              value={guests}
            />
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="stays-filter-empty" role="status">
          <p className="eyebrow mb-2 text-[var(--accent)]">Stays</p>
          <h2 className="type-h2">No stays match those filters</h2>
          <p className="mt-2 max-w-md text-[var(--muted)]">
            Try a broader area, fewer guests, or clear search to see Patricia’s full collection.
          </p>
          <div className="mt-5">
            <Button onClick={clearFilters} type="button" variant="secondary">
              Clear all filters
            </Button>
          </div>
        </div>
      ) : (
        <section className="stays-grid-section" aria-labelledby="stays-grid-heading">
          <div className="mb-6 max-w-xl">
            <p className="eyebrow mb-2 text-[var(--accent)]">
              {filtersActive ? "Results" : "Collection"}
            </p>
            <h2 id="stays-grid-heading" className="type-h2 text-pretty">
              {filtersActive ? "Matching homes" : "Homes to explore"}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((property, index) => (
              <PropertyCard
                key={property.id}
                priority={index < 3}
                property={property}
              />
            ))}
          </div>
        </section>
      )}

      <section className="stays-booking-flow" aria-labelledby="booking-flow-heading">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2 text-[var(--accent)]">How it works</p>
          <h2 id="booking-flow-heading" className="type-h2 text-pretty">
            Request dates. Patricia reviews.
          </h2>
          <p className="mt-2 text-[var(--muted)]">
            Stays are confirmed personally — not auto-booked like a marketplace listing.
          </p>
        </div>

        <ol className="stays-steps mt-8">
          <li className="stays-step">
            <span className="stays-step-index" aria-hidden="true">
              01
            </span>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Choose your stay</h3>
              <p className="mt-2 text-[var(--muted)]">
                Browse Patricia’s private homes and open the one that feels right.
              </p>
            </div>
          </li>
          <li className="stays-step">
            <span className="stays-step-index" aria-hidden="true">
              02
            </span>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Request your dates</h3>
              <p className="mt-2 text-[var(--muted)]">
                Share when you’d like to visit — this is a request, not an instant booking.
              </p>
            </div>
          </li>
          <li className="stays-step">
            <span className="stays-step-index" aria-hidden="true">
              03
            </span>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Patricia reviews</h3>
              <p className="mt-2 text-[var(--muted)]">
                She confirms availability personally and follows up on your request.
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={`/booking/${properties[0]?.id ?? ""}`}>Request dates</Button>
          <Button href="/contact" variant="secondary">
            Ask Patricia
          </Button>
        </div>
      </section>
    </div>
  );
}
