import type { ImageLoaderProps } from "next/image";
import {
  buildCloudinaryUrl,
  isCloudinaryUrl,
  isRemoteUrl,
  toPublicId,
} from "@/lib/cloudinary";

/**
 * next/image loader: migrated assets → Cloudinary (f_auto, q_auto, responsive w_).
 * External non-Cloudinary URLs (e.g. Unsplash) pass through unchanged.
 */
export default function cloudinaryLoader({ src, width }: ImageLoaderProps): string {
  if (!src) return src;

  // Unsplash / other third-party CDNs — do not rewrite
  if (isRemoteUrl(src) && !isCloudinaryUrl(src)) {
    return src;
  }

  const publicId = toPublicId(src);
  if (!publicId) {
    // Unmapped local path — leave as static public URL
    return src;
  }

  return buildCloudinaryUrl(publicId, {
    width,
    quality: "auto",
    format: "auto",
    crop: "limit",
  });
}
