"use client";

import Image, { type ImageProps } from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";

export type AppImageProps = Omit<ImageProps, "loader">;

/**
 * Client Image wrapper that always applies the Cloudinary loader.
 * Required because next/image is a Client Component and cannot receive
 * a loader function across the RSC boundary from Server Components.
 *
 * Migrated `/images/...` paths → f_auto / q_auto / responsive width.
 * External URLs (Unsplash, etc.) pass through unchanged.
 */
export function AppImage(props: AppImageProps) {
  return <Image {...props} loader={cloudinaryLoader} />;
}

export default AppImage;
