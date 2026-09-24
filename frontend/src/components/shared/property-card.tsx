import { AppImage } from "@/components/ui/app-image";
import Link from "next/link";
import { Price } from "@/components/ui/price";
import type { Property } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

type PropertyCardProps = {
  property: Property;
  className?: string;
  priority?: boolean;
};

export function PropertyCard({ property, className, priority = false }: PropertyCardProps) {
  const href = `/properties/${property.slug}`;

  return (
    <article className={cn("property-card group", className)}>
      <Link className="property-card-link" href={href}>
        <div className="property-card-media">
          <AppImage
            alt={property.imageAlt}
            className="image-cover image-zoom"
            fill
            priority={priority}
            sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            src={property.heroImage}
          />
          <span className="property-card-badge">{property.propertyType}</span>
        </div>

        <div className="property-card-body">
          <div className="property-card-copy">
            <h3 className="property-card-title">{property.name}</h3>
            <p className="property-card-meta">
              <span>{property.location}</span>
              <span aria-hidden="true">·</span>
              <span>{property.guests}</span>
            </p>
            {property.shortDescription ? (
              <p className="property-card-blurb">{property.shortDescription}</p>
            ) : null}
          </div>

          <div className="property-card-footer">
            <Price amount={property.priceValue} className="property-card-price" />
            <span className="property-card-cta" aria-hidden="true">
              View stay
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
