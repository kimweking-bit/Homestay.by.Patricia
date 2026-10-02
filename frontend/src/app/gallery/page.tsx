import type { Metadata } from "next";
import { GalleryGrid } from "@/components/shared/gallery-grid";
import { loadPublishedProperties } from "@/services/api/properties";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore Sutera Stays through the rooms, details, and shared spaces of each home.",
};

export default async function GalleryPage() {
  const properties = await loadPublishedProperties();
  const galleryProperties = properties.filter((property) => property.collection);

  return (
    <>
      <section className="site-container pb-5 pt-7 md:pb-6 md:pt-9">
        <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-12">
          <div>
            <p className="eyebrow mb-4 text-[var(--accent)]">Gallery</p>
            <h1 className="type-h1 max-w-3xl text-pretty">Find a place that feels right.</h1>
          </div>
          <p className="type-body-large max-w-2xl text-[var(--muted)]">
            A considered collection of city apartments and homes. Browse the real rooms, then open any stay for its complete photo set.
          </p>
        </div>
      </section>
      <GalleryGrid properties={galleryProperties} />
    </>
  );
}
