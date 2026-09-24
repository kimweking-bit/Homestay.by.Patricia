import {
  CLOUDINARY_CLOUD_NAME,
  cloudinaryAssetMeta,
  localPathToPublicId,
} from "@/lib/cloudinary-assets";

export { CLOUDINARY_CLOUD_NAME };

const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export type CloudinaryTransform = {
  width?: number;
  height?: number;
  /** Cloudinary quality. Prefer auto. */
  quality?: number | "auto";
  /** Cloudinary format. Prefer auto. */
  format?: string;
  crop?: "fill" | "fit" | "limit" | "scale" | "thumb";
  gravity?: string;
};

/** True for absolute http(s) URLs. */
export function isRemoteUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/** True when the URL is already a Cloudinary delivery URL. */
export function isCloudinaryUrl(src: string): boolean {
  return /res\.cloudinary\.com\//i.test(src);
}

/**
 * Resolve a local public path, public ID, or passthrough remote URL
 * into a Cloudinary public ID when possible.
 */
export function toPublicId(src: string): string | null {
  if (!src) return null;
  if (isCloudinaryUrl(src)) {
    // .../upload/v123/folder/id.ext or .../upload/transforms/folder/id
    const afterUpload = src.split("/upload/")[1];
    if (!afterUpload) return null;
    const parts = afterUpload.split("/").filter(Boolean);
    // drop version (v123) and transform segments (contain _)
    let i = 0;
    if (parts[i] && /^v\d+$/.test(parts[i])) i += 1;
    while (parts[i] && /[_=,]/.test(parts[i])) i += 1;
    const idWithExt = parts.slice(i).join("/");
    return idWithExt.replace(/\.(jpe?g|png|webp|gif|avif)$/i, "");
  }
  if (isRemoteUrl(src)) return null;
  // normalize local path
  const normalized = src.startsWith("/") ? src : `/${src}`;
  if (localPathToPublicId[normalized]) return localPathToPublicId[normalized];
  // already a public id?
  if (src.startsWith("homestay-by-patricia/")) return src;
  return null;
}

/**
 * Build a Cloudinary delivery URL with f_auto / q_auto by default.
 */
export function buildCloudinaryUrl(
  publicId: string,
  transform: CloudinaryTransform = {},
): string {
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop,
    gravity,
  } = transform;

  const segments: string[] = [];
  if (format) segments.push(`f_${format}`);
  if (quality !== undefined && quality !== null) {
    segments.push(typeof quality === "number" ? `q_${quality}` : `q_${quality}`);
  }
  if (width) segments.push(`w_${Math.round(width)}`);
  if (height) segments.push(`h_${Math.round(height)}`);
  if (crop) segments.push(`c_${crop}`);
  if (gravity) segments.push(`g_${gravity}`);
  // Keep originals within a sensible bound when no width given
  if (!width && !height) segments.push("c_limit", "w_2400");

  const transforms = segments.join(",");
  return `${CLOUDINARY_BASE}/${transforms}/${publicId}`;
}

/**
 * Resolve any app image src (local path, public ID, or remote URL) to a
 * final URL suitable for next/image or <img>.
 */
export function resolveImageSrc(
  src: string,
  transform: CloudinaryTransform = {},
): string {
  if (!src) return src;
  // External non-Cloudinary (e.g. Unsplash avatars) — leave alone
  if (isRemoteUrl(src) && !isCloudinaryUrl(src)) return src;

  const publicId = toPublicId(src);
  if (!publicId) return src;
  return buildCloudinaryUrl(publicId, transform);
}

/** Intrinsic dimensions when known from upload metadata. */
export function getAssetDimensions(src: string): { width: number; height: number } | null {
  const publicId = toPublicId(src);
  if (!publicId) return null;
  const meta = cloudinaryAssetMeta[publicId];
  if (!meta) return null;
  return { width: meta.width, height: meta.height };
}

/**
 * Named presets for common surfaces. Width is a desktop target; next/image
 * loader still supplies the responsive width per request.
 */
export const imagePresets = {
  hero: { quality: "auto" as const, format: "auto" as const },
  card: { quality: "auto" as const, format: "auto" as const },
  gallery: { quality: "auto" as const, format: "auto" as const },
  thumb: { quality: "auto" as const, format: "auto" as const },
  brand: { quality: "auto" as const, format: "auto" as const },
} as const;
