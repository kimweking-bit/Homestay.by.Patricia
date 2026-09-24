import Image from "next/image";
import { Button } from "@/components/ui/button";
import { properties } from "@/lib/mock-data";

export default function AdminPropertiesPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
          <p className="type-small mt-1 text-[var(--muted)]">Published homes on Sutera Stays.</p>
        </div>
        <Button disabled type="button">
          Add property
        </Button>
      </div>
      <p className="type-small mt-3 text-[var(--muted)]">Adding a home will open here when property management is connected.</p>

      <div className="mt-8 grid gap-4">
        {properties.map((property) => (
          <article className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[160px_1fr_auto]" key={property.id}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-image)]">
              <Image alt={property.imageAlt} className="image-cover" fill sizes="160px" src={property.heroImage} />
            </div>
            <div>
              <p className="type-small text-[var(--muted)]">{property.location}</p>
              <h2 className="text-xl font-semibold">{property.name}</h2>
              <p className="type-small mt-2 text-[var(--muted)]">
                {property.propertyType} · {property.guests}
              </p>
            </div>
            <Button href={`/properties/${property.slug}`} variant="secondary">
              View
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
