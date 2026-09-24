"use client";

import { AppImage } from "@/components/ui/app-image";
import { useEffect, useRef } from "react";
type LightboxProps = {
  images: string[];
  captions?: string[];
  propertyName: string;
  activeIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function Lightbox({
  images,
  captions,
  propertyName,
  activeIndex,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeImage = images[activeIndex];
  const caption = captions?.[activeIndex];

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowRight") {
        onIndexChange((activeIndex + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        onIndexChange((activeIndex - 1 + images.length) % images.length);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length, onClose, onIndexChange]);

  if (!activeImage) {
    return null;
  }

  return (
    <div aria-label={`${propertyName} photo gallery`} aria-modal="true" className="lightbox" role="dialog">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="type-small">
          {activeIndex + 1} / {images.length}
          {caption ? <span className="ml-3 text-[rgb(255_255_255_/_0.72)]">{caption}</span> : null}
        </p>
        <button
          className="type-small border border-[rgb(255_255_255_/_0.28)] px-4 py-3 font-semibold"
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          Close
        </button>
      </div>
      <div className="relative min-h-[58vh]">
        <AppImage alt={`${propertyName}${caption ? ` — ${caption}` : " enlarged photo"}`} className="object-contain" fill sizes="100vw" src={activeImage} />
      </div>
      <div className="mt-4 flex justify-between gap-3">
        <button
          className="type-small border border-[rgb(255_255_255_/_0.28)] px-4 py-3 font-semibold"
          onClick={() => onIndexChange((activeIndex - 1 + images.length) % images.length)}
          type="button"
        >
          Previous
        </button>
        <button
          className="type-small border border-[rgb(255_255_255_/_0.28)] px-4 py-3 font-semibold"
          onClick={() => onIndexChange((activeIndex + 1) % images.length)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
