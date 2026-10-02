import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/auth/password.js";

/**
 * DEVELOPMENT SEED ONLY.
 * Properties come from the guest frontend catalog.
 * Accounts below are local development credentials, not production users.
 * No sample bookings or reviews are inserted.
 */
export const DEV_ADMIN_EMAIL = "patricia.dev@homestaybypatricia.test";
export const DEV_ADMIN_PASSWORD = "DevAdmin-Patricia-2026";
export const DEV_GUEST_EMAIL = "guest.dev@homestaybypatricia.test";
export const DEV_GUEST_PASSWORD = "DevGuest-Patricia-2026";

type CatalogProperty = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  location: string;
  area: string;
  propertyType: string;
  collection: string | null;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  currency: string;
  imageAlt: string;
  heroImage: string;
  galleryImages: string[];
  galleryCaptions: string[];
  amenities: string[];
  houseRules: string[];
  rooms: Array<{ name: string; image: string }>;
};

const catalog = JSON.parse(readFileSync(new URL("./dev-catalog.json", import.meta.url), "utf8")) as CatalogProperty[];

export async function seed(prisma: PrismaClient) {
  for (const property of catalog) {
    const scalars = {
      slug: property.slug,
      name: property.name,
      shortDescription: property.shortDescription,
      description: property.description,
      location: property.location,
      area: property.area,
      propertyType: property.propertyType,
      collection: property.collection,
      bedrooms: property.bedrooms,
      beds: property.beds,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      pricePerNight: property.pricePerNight,
      currency: property.currency,
      imageAlt: property.imageAlt,
      status: "PUBLISHED" as const,
    };

    await prisma.property.upsert({
      where: { id: property.id },
      create: { id: property.id, ...scalars },
      update: scalars,
    });
    await prisma.propertyImage.deleteMany({ where: { propertyId: property.id } });
    await prisma.propertyAmenity.deleteMany({ where: { propertyId: property.id } });
    await prisma.propertyHouseRule.deleteMany({ where: { propertyId: property.id } });
    await prisma.propertyRoom.deleteMany({ where: { propertyId: property.id } });

    const images = property.galleryImages.map((url, index) => ({
      propertyId: property.id,
      url,
      caption: property.galleryCaptions[index] ?? "",
      alt: property.imageAlt,
      category: url === property.heroImage && index === property.galleryImages.indexOf(property.heroImage) ? "hero" : "gallery",
      sortOrder: index,
    }));
    if (!images.some((image) => image.category === "hero")) {
      images.unshift({
        propertyId: property.id,
        url: property.heroImage,
        caption: "",
        alt: property.imageAlt,
        category: "hero",
        sortOrder: 0,
      });
    }
    if (images.length > 0) {
      await prisma.propertyImage.createMany({ data: images });
    }

    for (const [index, text] of property.houseRules.entries()) {
      await prisma.propertyHouseRule.create({ data: { propertyId: property.id, text, sortOrder: index } });
    }
    for (const [index, room] of property.rooms.entries()) {
      await prisma.propertyRoom.create({
        data: { propertyId: property.id, name: room.name, imageUrl: room.image, sortOrder: index },
      });
    }
    for (const name of [...new Set(property.amenities)]) {
      const amenity = await prisma.amenity.upsert({ where: { name }, update: {}, create: { name } });
      await prisma.propertyAmenity.create({ data: { propertyId: property.id, amenityId: amenity.id } });
    }
  }

  await ensureDevUser(prisma, {
    email: DEV_ADMIN_EMAIL,
    password: DEV_ADMIN_PASSWORD,
    firstName: "Patricia",
    lastName: "Dev",
    phone: null,
    role: "ADMIN",
  });
  await ensureDevUser(prisma, {
    email: DEV_GUEST_EMAIL,
    password: DEV_GUEST_PASSWORD,
    firstName: "Guest",
    lastName: "Dev",
    phone: "+60 12-000 0000",
    role: "GUEST",
  });
}

async function ensureDevUser(
  prisma: PrismaClient,
  input: { email: string; password: string; firstName: string; lastName: string; phone: string | null; role: "ADMIN" | "GUEST" },
) {
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role,
    },
    create: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role,
    },
  });
  await prisma.guestProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  const prisma = new PrismaClient();
  try {
    await seed(prisma);
    console.log("Development seed complete. No production accounts or sample bookings were created.");
  } finally {
    await prisma.$disconnect();
  }
}
