export const imagePaths = {
  brand: {
    patriciaLogo: "/images/brand/patricia/WhatsApp Image 2026-09-15 at 11.46.16.jpeg",
    patriciaProfile: "/images/brand/patricia/WhatsApp Image 2026-09-15 at 11.46.16.jpeg",
  },
  properties: {
    legacyHero: "/images/property-hero.jpeg",
    suteraHero: "/images/sutera-hero-staircase.jpg",
    folders: {
      property01: "/images/properties/property-01",
      property02: "/images/properties/property-02",
      property03: "/images/properties/property-03",
      property04: "/images/properties/property-04",
      property05: "/images/properties/property-05",
    },
    property01: {
      staircase: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.28 (1).jpeg",
      openLivingDining: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.28.jpeg",
      twinBedroom: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.29.jpeg",
      mainKitchen: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.30.jpeg",
      exteriorGarden: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.31 (1).jpeg",
      diningCorner: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.31.jpeg",
      balcony: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.32.jpeg",
      loungeWide: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.33 (1).jpeg",
      kitchenette: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.33.jpeg",
      exteriorFacade: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.34 (1).jpeg",
      bunkRoom: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.34 (2).jpeg",
      livingVertical: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.34.jpeg",
      stairLounge: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.35 (1).jpeg",
      queenBedroom: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.35 (2).jpeg",
      balconyBedroom: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.35 (3).jpeg",
      diningTable: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.35.jpeg",
      singleBedroom: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.36 (1).jpeg",
      tvLounge: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.36 (2).jpeg",
      bathroom: "/images/properties/property-01/patricia pics/WhatsApp Image 2026-09-14 at 17.48.36.jpeg",
    },
  },
} as const;

export function propertyImagePath(propertyFolder: keyof typeof imagePaths.properties.folders, filename: string) {
  return `${imagePaths.properties.folders[propertyFolder]}/${filename}`;
}
