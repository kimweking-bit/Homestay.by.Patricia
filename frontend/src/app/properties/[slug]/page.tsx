import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { BookingPanel } from "@/components/shared/booking-panel";
import { PropertyGallery } from "@/components/shared/property-gallery";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { contactDetails, properties, reviews } from "@/lib/mock-data";

type PropertyDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);

  if (!property) {
    return { title: "Stay not found" };
  }

  return {
    title: property.name,
    description: property.shortDescription,
    openGraph: {
      title: `${property.name} | ${brand.name}`,
      description: property.shortDescription,
      images: [{ url: property.heroImage, alt: property.imageAlt }],
    },
  };
}

const faqs = [
  {
    question: "How do I book?",
    answer: "Choose dates and guests, send a request, and wait for Patricia to review. The stay is only confirmed after she approves it.",
  },
  {
    question: "When is a stay confirmed?",
    answer: "Not at the moment you submit. Confirmation comes after Patricia checks the dates and guest details.",
  },
  {
    question: "How do I reach Patricia?",
    answer: `Email is the only channel: ${contactDetails.email}. Patricia reads every message herself.`,
  },
];

export default async function PropertyDetailPage({ params, searchParams }: PropertyDetailPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const property = properties.find((item) => item.slug === slug);

  if (!property) {
    return (
      <section className="site-container py-16 md:py-24">
        <p className="type-small mb-3 text-[var(--muted)]">Stay not found</p>
        <h1 className="type-h1">This stay is not available.</h1>
        <p className="type-body-large mt-5 max-w-2xl text-[var(--muted)]">
          The link may have changed, or this home may not be listed with Homestay by Patricia yet.
        </p>
        <div className="mt-8">
          <Button href="/properties" variant="secondary">
            Back to stays
          </Button>
        </div>
      </section>
    );
  }

  const propertyReviews = reviews.filter((review) => review.propertySlug === property.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: property.shortDescription,
    image: property.heroImage,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Setia Alam",
      addressRegion: "Selangor",
      addressCountry: "MY",
    },
    parentOrganization: {
      "@type": "Organization",
      name: brand.name,
    },
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} type="application/ld+json" />

      <section className="site-container py-8 md:py-12">
        <Link
          className="type-small mb-6 inline-flex font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
          href="/properties"
        >
          Back to stays
        </Link>
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-3xl">
            <p className="type-small text-[var(--muted)]">{property.location}</p>
            <h1 className="type-h1 mt-2 text-pretty">{property.name}</h1>
            <p className="type-body-large mt-4 max-w-2xl text-[var(--muted)]">{property.shortDescription}</p>
          </div>
          <p className="type-small text-[var(--muted)]">
            {property.propertyType} · {property.guests}
            {propertyReviews.length > 0 ? ` · ${propertyReviews.length} guest notes` : ""}
          </p>
        </div>
      </section>

      <PropertyGallery captions={property.galleryCaptions} images={property.galleryImages} propertyName={property.name} />

      <section className="site-container grid gap-12 py-14 pb-28 md:grid-cols-[minmax(0,1fr)_360px] md:py-20 md:pb-24 lg:gap-16">
        <div className="space-y-14">
          <section>
            <h2 className="type-h2">The stay</h2>
            <p className="type-body-large mt-5 max-w-3xl text-[var(--muted)]">{property.description}</p>
            <dl className="mt-8 grid gap-5 border-t border-[var(--border)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Bedrooms", property.bedrooms],
                ["Beds", property.beds],
                ["Bathrooms", property.bathrooms],
                ["Guests", property.guests],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="type-small text-[var(--muted)]">{label}</dt>
                  <dd className="mt-1 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="hairline-top pt-10">
            <h2 className="type-h2">Rooms</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {property.rooms.map((room) => (
                <figure className="overflow-hidden rounded-[var(--radius-image)] bg-[var(--surface-muted)]" key={room.name}>
                  <div className="relative aspect-[4/3]">
                    <Image alt={room.name} className="image-cover" fill sizes="(min-width: 768px) 30vw, 100vw" src={room.image} />
                  </div>
                  <figcaption className="px-1 py-3 text-sm font-semibold">{room.name}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="hairline-top pt-10">
            <h2 className="type-h2">Amenities</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {property.amenities.map((amenity) => (
                <li className="border-t border-[var(--border)] pt-3 text-[var(--muted)]" key={amenity}>
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          <section className="hairline-top pt-10">
            <h2 className="type-h2">Location</h2>
            <p className="type-body mt-4 max-w-2xl text-[var(--muted)]">
              {property.area}. The home sits in a residential neighbourhood rather than a tourist strip. Directions are shared after Patricia confirms the stay.
            </p>
          </section>

          <section className="hairline-top pt-10">
            <h2 className="type-h2">House rules</h2>
            <ul className="mt-6 space-y-3">
              {property.houseRules.map((rule) => (
                <li className="border-t border-[var(--border)] pt-3 text-[var(--muted)]" key={rule}>
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          <section className="hairline-top pt-10">
            <h2 className="type-h2">The host</h2>
            <p className="type-body mt-4 max-w-2xl text-[var(--muted)]">
              Patricia hosts Homestay by Patricia directly. She reviews every request, answers practical questions, and confirms only when the dates work.
            </p>
            <div className="mt-6">
              <Button href="/about" variant="secondary">
                About Patricia
              </Button>
            </div>
          </section>

          <section className="hairline-top pt-10">
            <h2 className="type-h2">Reviews</h2>
            {propertyReviews.length > 0 ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {propertyReviews.map((review) => (
                  <article className="border-t border-[var(--border)] pt-5" key={review.id}>
                    <h3 className="text-lg font-semibold">{review.name}</h3>
                    <p className="type-small mt-1 text-[var(--muted)]">{review.location}</p>
                    <p className="type-body mt-4 text-[var(--muted)]">{review.text}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="type-body mt-4 max-w-2xl text-[var(--muted)]">
                Verified guest notes will appear here when they are ready to publish. Until then, the photographs and house details are the honest record of the stay.
              </p>
            )}
          </section>

          <section className="hairline-top pt-10">
            <h2 className="type-h2">Questions</h2>
            <div className="mt-6 grid gap-5">
              {faqs.map((item) => (
                <article className="border-t border-[var(--border)] pt-4" key={item.question}>
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="type-body mt-2 text-[var(--muted)]">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div aria-label="Booking request" className="booking-panel-rail">
          <BookingPanel
            initialCheckIn={query.checkIn}
            initialCheckOut={query.checkOut}
            initialGuests={query.guests}
            property={property}
          />
        </div>
      </section>
    </>
  );
}
