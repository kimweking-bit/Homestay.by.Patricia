import type { Prisma } from "@prisma/client";
import { countLabel } from "../common/dates.js";

export const propertyInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  amenities: { include: { amenity: true } },
  houseRules: { orderBy: { sortOrder: "asc" as const } },
  rooms: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.PropertyInclude;

export type PropertyRecord = Prisma.PropertyGetPayload<{ include: typeof propertyInclude }>;

export function presentProperty(property: PropertyRecord) {
  const images = [...property.images].sort((left, right) => left.sortOrder - right.sortOrder);
  const hero = images.find((image) => image.category === "hero") ?? images[0];
  const gallery = images.filter((image) => image.category !== "room");

  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    location: property.location,
    area: property.area,
    propertyType: property.propertyType,
    collection: property.collection ?? undefined,
    guests: `Up to ${property.maxGuests} guests`,
    maxGuests: property.maxGuests,
    price: `From RM ${property.pricePerNight.toLocaleString("en-MY")} / night`,
    priceValue: property.pricePerNight,
    currency: property.currency,
    heroImage: hero?.url ?? "",
    imageAlt: property.imageAlt,
    galleryImages: gallery.map((image) => image.url),
    galleryCaptions: gallery.map((image) => image.caption ?? ""),
    shortDescription: property.shortDescription,
    description: property.description,
    bedrooms: countLabel(property.bedrooms, "bedroom", "bedrooms"),
    beds: countLabel(property.beds, "bed", "beds"),
    bathrooms: countLabel(property.bathrooms, "bathroom", "bathrooms"),
    bedroomCount: property.bedrooms,
    bedCount: property.beds,
    bathroomCount: property.bathrooms,
    amenities: property.amenities.map((item) => item.amenity.name).sort((left, right) => left.localeCompare(right)),
    houseRules: [...property.houseRules].sort((left, right) => left.sortOrder - right.sortOrder).map((rule) => rule.text),
    rooms: [...property.rooms]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((room) => ({ name: room.name, image: room.imageUrl })),
    images: images.map((image) => ({
      id: image.id,
      url: image.url,
      publicId: image.publicId,
      alt: image.alt,
      caption: image.caption,
      category: image.category,
      sortOrder: image.sortOrder,
    })),
    status: property.status,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  };
}
