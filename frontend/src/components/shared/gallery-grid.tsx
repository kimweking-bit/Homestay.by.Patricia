"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Lightbox } from "@/components/shared/lightbox";
import { Price } from "@/components/ui/price";
import type { Property } from "@/lib/mock-data";

const filters = ["All stays", "City stays", "Homes"] as const;
type GalleryFilter = (typeof filters)[number];

type ActiveGallery = {
  property: Property;
  index: number;
};

function propertyMatchesFilter(property: Property, filter: GalleryFilter, query: string) {
  const matchesFilter = filter === "All stays" || property.collection === filter;
  const searchableText = `${property.name} ${property.location} ${property.area} ${property.propertyType}`.toLowerCase();
  return matchesFilter && searchableText.includes(query.trim().toLowerCase());
}

export function GalleryGrid({ properties }: { properties: Property[] }) {
  const [filter, setFilter] = useState<GalleryFilter>("All stays");
  const [query, setQuery] = useState("");
  const [activeGallery, setActiveGallery] = useState<ActiveGallery | null>(null);
  const [isRailPaused, setIsRailPaused] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const signatureStay = properties.find((property) => property.collection === "Signature stays") ?? properties[0];
  const visibleProperties = useMemo(
    () => properties.filter((property) => propertyMatchesFilter(property, filter, query)),
    [filter, properties, query],
  );
  const railProperties = visibleProperties.filter((property) => property.id !== signatureStay?.id);
  const marqueeProperties = useMemo(() => [...railProperties, ...railProperties], [railProperties]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsRailPaused(true);
    }
  }, []);

  function scrollRail(direction: "backward" | "forward") {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    const track = rail.firstElementChild as HTMLElement | null;
    if (!track) {
      return;
    }

    const offset = track.clientWidth * 0.42;
    const nextAmount = direction === "forward" ? offset : -offset;
    track.style.transform = `translateX(${nextAmount}px)`;
    setIsRailPaused(true);

    window.setTimeout(() => {
      track.style.transform = "translateX(0)";
      setIsRailPaused(false);
    }, 300);
  }

  return (
    <>
      <section className="site-container pb-16 md:pb-24">
        {signatureStay ? (
          <article className="gallery-signature grid gap-6 border-b border-[var(--border)] pb-8 md:grid-cols-[1.24fr_0.76fr] md:items-center md:gap-6 md:pb-10">
            <button
              aria-label={`Open ${signatureStay.name} gallery`}
              className="group relative aspect-[16/10] overflow-hidden rounded-[var(--radius-image)] bg-[var(--surface-muted)] text-left"
              onClick={() => setActiveGallery({ property: signatureStay, index: 0 })}
              type="button"
            >
              <Image
                alt={signatureStay.imageAlt}
                className="image-cover image-zoom"
                fill
                priority
                quality={100}
                sizes="(min-width: 768px) 62vw, 100vw"
                src={signatureStay.heroImage}
              />
              <span className="absolute left-4 top-4 bg-[var(--brand)] px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-white uppercase">
                Signature stay
              </span>
              <span className="absolute bottom-4 left-4 border border-white/45 bg-black/25 px-3 py-2 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                View {signatureStay.galleryImages.length} photos
              </span>
            </button>

            <div className="max-w-[30rem] md:-ml-3 md:pl-0 md:pr-0">
              <p className="eyebrow text-[var(--accent)]">The signature stay</p>
              <h2 className="type-h2 mt-3 text-pretty">{signatureStay.name}</h2>
              <p className="type-body mt-4 text-[var(--muted)]">{signatureStay.shortDescription}</p>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-[var(--border)] py-4 text-sm text-[var(--muted)]">
                <span>{signatureStay.guests}</span>
                <span>{signatureStay.bedrooms}</span>
                <span>{signatureStay.galleryImages.length} photos</span>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <Price amount={signatureStay.priceValue} />
                <Link className="text-sm font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--brand)]" href={`/properties/${signatureStay.slug}`}>
                  See stay details
                </Link>
              </div>
            </div>
          </article>
        ) : null}

        <section aria-labelledby="explore-stays" className="pt-10 md:pt-14">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="eyebrow text-[var(--accent)]">Explore the collection</p>
              <h2 className="type-h2 mt-3" id="explore-stays">A place for every pace.</h2>
            </div>
            <label className="gallery-search-field w-full md:w-[20rem]">
              <span className="sr-only">Search stays</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search stays or location"
                type="search"
                value={query}
              />
            </label>
          </div>

          <div className="mt-7 flex flex-col gap-5 border-y border-[var(--border)] py-4 md:flex-row md:items-center md:justify-between">
            <div aria-label="Filter stays" className="flex flex-wrap gap-x-5 gap-y-2" role="group">
              {filters.map((item) => {
                const selected = filter === item;
                return (
                  <button
                    aria-pressed={selected}
                    className={`gallery-filter relative py-1 text-sm font-semibold ${selected ? "gallery-filter-active text-[var(--foreground)]" : "text-[var(--muted)]"}`}
                    key={item}
                    onClick={() => setFilter(item)}
                    type="button"
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <p aria-live="polite" className="type-small text-[var(--muted)]">
              {railProperties.length} {railProperties.length === 1 ? "stay" : "stays"} in the rail
            </p>
          </div>

          {railProperties.length > 0 ? (
            <>
              <div className="mt-7 flex items-center justify-end gap-2">
                <button aria-label="Show previous stays" className="gallery-rail-control" onClick={() => scrollRail("backward")} title="Previous stays" type="button">
                  <span aria-hidden="true">&#8592;</span>
                </button>
                <button aria-label="Show next stays" className="gallery-rail-control" onClick={() => scrollRail("forward")} title="Next stays" type="button">
                  <span aria-hidden="true">&#8594;</span>
                </button>
              </div>

              <div
                className="gallery-rail mt-3"
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsRailPaused(false);
                  }
                }}
                onFocusCapture={() => setIsRailPaused(true)}
                onMouseEnter={() => setIsRailPaused(true)}
                onMouseLeave={() => setIsRailPaused(false)}
                ref={railRef}
              >
                <div className={`gallery-rail-track ${isRailPaused ? "gallery-rail-track-paused" : ""}`}>
                  {marqueeProperties.map((property, index) => (
                    <article className="gallery-rail-card group" key={`${property.id}-${index}`}>
                      <button
                        aria-label={`Open ${property.name} gallery`}
                        className="relative block aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-image)] bg-[var(--surface-muted)] text-left"
                        onClick={() => setActiveGallery({ property, index: 0 })}
                        type="button"
                      >
                        <Image
                          alt={property.imageAlt}
                          className="image-cover image-zoom"
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 78vw"
                          src={property.heroImage}
                        />
                        <span className="absolute bottom-3 left-3 bg-white/94 px-3 py-2 text-xs font-semibold text-[var(--foreground)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                          View {property.galleryImages.length} photos
                        </span>
                      </button>

                      <div className="pt-4">
                        <p className="type-small text-[var(--muted)]">{property.location}</p>
                        <h3 className="mt-2 font-[var(--font-heading)] text-[1.55rem] font-semibold leading-[1.12] text-[var(--foreground)]">
                          <Link className="transition-colors hover:text-[var(--brand)]" href={`/properties/${property.slug}`}>
                            {property.name}
                          </Link>
                        </h3>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <Price amount={property.priceValue} />
                          <span className="type-small shrink-0 text-[var(--muted)]">{property.guests}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="type-body text-[var(--muted)]">No stays match that search.</p>
              <button className="mt-3 text-sm font-semibold text-[var(--brand)]" onClick={() => { setFilter("All stays"); setQuery(""); }} type="button">
                Clear search
              </button>
            </div>
          )}

          <div className="mt-14 border-t border-[var(--border)] pt-8 md:mt-16 md:grid md:grid-cols-[0.8fr_1.2fr] md:gap-12">
            <p className="eyebrow text-[var(--accent)]">A considered collection</p>
            <p className="type-body-large mt-4 max-w-2xl text-[var(--muted)] md:mt-0">
              Each home is shown through the rooms that matter. Open a photograph for the full set, or step into the stay for every practical detail.
            </p>
          </div>
        </section>
      </section>

      {activeGallery ? (
        <Lightbox
          activeIndex={activeGallery.index}
          captions={activeGallery.property.galleryCaptions}
          images={activeGallery.property.galleryImages}
          onClose={() => setActiveGallery(null)}
          onIndexChange={(index) => setActiveGallery((current) => (current ? { ...current, index } : null))}
          propertyName={activeGallery.property.name}
        />
      ) : null}
    </>
  );
}
