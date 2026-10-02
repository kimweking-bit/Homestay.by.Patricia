import type { Metadata } from "next";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/shared/property-card";
import { brand } from "@/lib/brand";
import { imagePaths } from "@/lib/image-paths";
import { loadPublishedProperties } from "@/services/api/properties";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${brand.name} | Private homes worth remembering`,
  description: brand.description,
};

const reasons = [
  {
    title: "A private-home rhythm",
    text: "Space to settle in, cook simply, gather comfortably, and move through the day without a hotel routine.",
  },
  {
    title: "Photographed honestly",
    text: "What you see is the home as it lives—rooms, light, and finishes chosen so you can decide with confidence.",
  },
  {
    title: "Hosted with care",
    text: "Patricia reviews every request personally. Nothing is confirmed until the stay is right for the home and for you.",
  },
];

const trustNotes = [
  {
    title: "Request to book",
    text: "Send your dates and party size. Patricia confirms only when the stay fits the home.",
  },
  {
    title: "Clear house notes",
    text: "Amenities, layout, and house rules are published up front so there are fewer surprises on arrival.",
  },
  {
    title: "Direct host contact",
    text: "Questions go straight to the host—not a marketplace message queue.",
  },
];

export default async function HomePage() {
  const properties = await loadPublishedProperties();
  const featured = properties[0];
  const moreStays = properties.slice(1, 4);
  const storyPhotos = featured?.galleryImages.slice(0, 3) ?? [];

  if (!featured) {
    return (
      <section className="site-container section-y">
        <h1 className="type-h1">Make yourself at home.</h1>
        <p className="type-body mt-4 max-w-2xl text-[var(--muted)]">
          Stays will appear here when the catalog is ready.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="home-hero" aria-label="Welcome">
        <AppImage
          alt="Warm interior of a Patricia homestay living space"
          className="hero-image image-cover"
          fill
          priority
          sizes="100vw"
          src={imagePaths.properties.suteraHero}
        />
        <div className="hero-veil" aria-hidden />
        <div className="home-hero-panel site-container">
          <div className="hero-copy">
            <h1 className="home-hero-title">
              <span>MAKE YOURSELF</span>
              <span>AT HOME.</span>
            </h1>
            <p className="hero-subtitle">
              Discover private Malaysian homes hosted with care—browse stays, check availability, and
              request a booking when the fit feels right.
            </p>
            <div className="hero-actions">
              <Button href="/properties">Browse stays</Button>
              <Button href={`/properties/${featured.slug}`} variant="secondary">
                View featured home
              </Button>
            </div>
          </div>
        </div>
        <div aria-hidden className="hero-scroll-cue">
          <span>Scroll</span>
          <i />
        </div>
      </section>

      {moreStays.length > 0 ? (
        <section className="home-band-muted">
          <div className="site-container section-y">
            <div className="home-discovery-strip">
              <div className="home-discovery-head">
                <div>
                  <p className="eyebrow mb-3 text-[var(--accent)]">More stays</p>
                  <h2 className="type-h2 text-pretty">Continue exploring</h2>
                  <p className="mt-3 max-w-xl text-[var(--muted)]">
                    The same calm presentation across every listing—so comparing homes stays easy.
                  </p>
                </div>
                <Button href="/properties" variant="secondary">
                  View all stays
                </Button>
              </div>
              <div className="home-discovery-grid">
                {moreStays.map((property, index) => (
                  <PropertyCard key={property.id} priority={index === 0} property={property} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="site-container section-y">
        <div className="mb-10 max-w-2xl md:mb-14">
          <p className="eyebrow mb-4 text-[var(--accent)]">Why guests stay</p>
          <h2 className="type-h2 text-pretty">Warm hospitality, private-home comfort.</h2>
        </div>
        <div className="home-reasons">
          {reasons.map((reason, index) => (
            <article className="home-reason" key={reason.title}>
              <span className="home-reason-index">0{index + 1}</span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-band">
        <div className="site-container section-y">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
            <div className="max-w-xl">
              <p className="eyebrow mb-4 text-[var(--accent)]">Inside the home</p>
              <h2 className="type-h2 text-pretty">A quieter look at the spaces you&apos;ll live in.</h2>
            </div>
            <Button href="/gallery" variant="secondary">
              Open gallery
            </Button>
          </div>
          <div className="home-photo-story">
            <figure className="home-photo-frame home-photo-frame-tall">
              <AppImage
                alt={featured.galleryCaptions[3] ?? featured.imageAlt}
                className="image-cover"
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                src={featured.galleryImages[3] ?? featured.heroImage}
              />
            </figure>
            <figure className="home-photo-frame">
              <AppImage
                alt={featured.galleryCaptions[10] ?? "Homestay interior detail"}
                className="image-cover"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                src={featured.galleryImages[10] ?? featured.heroImage}
              />
            </figure>
            <figure className="home-photo-frame">
              <AppImage
                alt={featured.galleryCaptions[12] ?? "Homestay living space"}
                className="image-cover"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                src={featured.galleryImages[12] ?? featured.heroImage}
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="home-band-muted">
        <div className="site-container section-y">
          <div className="home-host">
            <figure className="home-host-portrait">
              <AppImage
                alt="Warm living space from the Patricia terrace home"
                className="image-cover"
                fill
                sizes="(min-width: 900px) 40vw, 100vw"
                src={storyPhotos[0] ?? featured.heroImage}
              />
            </figure>
            <div>
              <p className="eyebrow mb-4 text-[var(--accent)]">Your host</p>
              <h2 className="type-h2 text-pretty">Hosted personally by {brand.host}.</h2>
              <p className="type-body-large mt-5 max-w-xl text-[var(--muted)]">
                Every stay is looked after by the same host who prepared the home. You get clear
                guidance before arrival, thoughtful notes for your visit, and a direct line when you
                need it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/about">Read {brand.host}&apos;s story</Button>
                <Button href="/contact" variant="secondary">
                  Contact host
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container section-y">
        <div className="mb-10 max-w-2xl md:mb-12">
          <p className="eyebrow mb-4 text-[var(--accent)]">Before you book</p>
          <h2 className="type-h2 text-pretty">Trust built into the process.</h2>
        </div>
        <div className="home-trust">
          {trustNotes.map((note) => (
            <article className="home-trust-item" key={note.title}>
              <h3>{note.title}</h3>
              <p>{note.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container pb-20 md:pb-28">
        <div className="gold-rule mb-12" />
        <div className="home-final-cta">
          <div>
            <p className="eyebrow mb-4 text-[var(--accent)]">Plan your stay</p>
            <h2 className="type-h2 text-pretty">Find a home that feels like yours for a while.</h2>
            <p className="mt-4 max-w-xl text-[var(--muted)]">
              Browse available stays, open a home that fits, and send a booking request when you are
              ready.
            </p>
          </div>
          <div className="home-final-actions">
            <Button href="/properties">Browse stays</Button>
            <Button href={`/booking/${featured.id}`} variant="secondary">
              Check availability
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
