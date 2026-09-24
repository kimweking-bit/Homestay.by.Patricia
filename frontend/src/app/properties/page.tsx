import Image from "next/image";
import { EmptyState } from "@/components/shared/empty-state";
import { StaysExplorer } from "@/components/shared/stays-explorer";
import { brand } from "@/lib/brand";
import { properties } from "@/lib/mock-data";

export default function PropertiesPage() {
  const count = properties.length;
  const atmosphere = properties.slice(0, 3);

  if (count === 0) {
    return (
      <section className="site-container section-y">
        <EmptyState
          eyebrow="Stays"
          title="No stays available right now"
          text={`${brand.name} will share the next private homes here when they’re ready to host.`}
          actionHref="/"
          actionLabel="Back to home"
        />
      </section>
    );
  }

  return (
    <>
      <section className="site-container stays-intro">
        <div className="stays-intro-copy">
          <p className="eyebrow mb-3 text-[var(--accent)]">Stays</p>
          <h1 className="type-h1 text-pretty">Private homes, hosted with care.</h1>
          <p className="type-body mt-4 max-w-2xl text-[var(--muted)]">
            A curated collection of {brand.name}’s private homes in Malaysia — calm spaces you request
            directly, reviewed personally by Patricia.
          </p>
          <p className="type-small mt-4 text-[var(--muted)]">
            {count} private {count === 1 ? "home" : "homes"} · Direct hosting · Malaysia
          </p>
        </div>

        {atmosphere.length > 0 ? (
          <div
            className={[
              "stays-atmosphere",
              atmosphere.length === 1 ? "stays-atmosphere-solo" : "",
              atmosphere.length === 2 ? "stays-atmosphere-duo" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label="A glimpse of Patricia’s homes"
          >
            {atmosphere.map((property, index) => (
              <div
                key={property.id}
                className={index === 0 ? "stays-atmosphere-lead" : "stays-atmosphere-tile"}
              >
                <Image
                  alt={property.imageAlt}
                  className="image-cover image-zoom"
                  fill
                  priority={index === 0}
                  sizes={
                    index === 0
                      ? "(min-width: 900px) 55vw, 100vw"
                      : "(min-width: 900px) 22vw, 50vw"
                  }
                  src={property.heroImage}
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="site-container stays-main">
        <StaysExplorer properties={properties} />
      </div>
    </>
  );
}
