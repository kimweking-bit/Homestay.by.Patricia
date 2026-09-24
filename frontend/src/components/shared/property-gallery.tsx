"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/shared/lightbox";
import { imagePaths } from "@/lib/image-paths";

type PropertyGalleryProps = {
  images: string[];
  captions?: string[];
  propertyName: string;
};

export function PropertyGallery({ images, captions, propertyName }: PropertyGalleryProps) {
  const galleryImages = images.length > 0 ? images : [imagePaths.properties.legacyHero];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <section className="site-container">
        <div className={galleryImages.length > 1 ? "grid gap-3 md:grid-cols-[1.45fr_0.75fr]" : "grid gap-3"}>
          <button
            aria-label={`Open ${propertyName} featured photo`}
            className="relative min-h-[320px] overflow-hidden rounded-[var(--radius-image)] bg-[var(--surface-muted)] text-left md:min-h-[560px]"
            onClick={() => setActiveIndex(0)}
            type="button"
          >
            <Image
              alt={`${propertyName}${captions?.[0] ? ` — ${captions[0]}` : " featured photo"}`}
              className="image-cover"
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              src={galleryImages[0]}
            />
          </button>
          {galleryImages.length > 1 ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              {galleryImages.slice(1, 3).map((image, index) => (
                <button
                  aria-label={`Open ${propertyName} gallery photo ${index + 2}`}
                  className="relative min-h-[200px] overflow-hidden rounded-[var(--radius-image)] bg-[var(--surface-muted)] text-left md:min-h-[274px]"
                  key={`${image}-${index}`}
                  onClick={() => setActiveIndex(index + 1)}
                  type="button"
                >
                  <Image
                    alt={`${propertyName}${captions?.[index + 1] ? ` — ${captions[index + 1]}` : ` gallery view ${index + 2}`}`}
                    className="image-cover"
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw"
                    src={image}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="type-small text-[var(--muted)]">{galleryImages.length} photographs</p>
          <button
            className="type-small border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
            onClick={() => setActiveIndex(0)}
            type="button"
          >
            {galleryImages.length > 1 ? "View all photos" : "View photo"}
          </button>
        </div>
      </section>

      {activeIndex !== null ? (
        <Lightbox
          activeIndex={activeIndex}
          captions={captions}
          images={galleryImages}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
          propertyName={propertyName}
        />
      ) : null}
    </>
  );
}
