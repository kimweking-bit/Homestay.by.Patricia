import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { imagePaths } from "@/lib/image-paths";

type BrandMarkProps = {
  href?: string;
  inverted?: boolean;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
};

const sizeClassName = {
  sm: "size-10",
  md: "size-12",
  lg: "size-[4.5rem]",
};

export function BrandMark({
  href = "/",
  inverted = false,
  showWordmark = true,
  size = "md",
  onClick,
}: BrandMarkProps) {
  const mark = (
    <>
      <span
        className={cn(
          "relative block overflow-hidden rounded-full border shadow-[var(--shadow-subtle)]",
          sizeClassName[size],
          inverted ? "border-[rgb(255_255_255_/_0.35)]" : "border-[color-mix(in_srgb,var(--color-gold)_45%,var(--border))]",
        )}
      >
        <Image
          alt=""
          className="object-cover"
          fill
          sizes={size === "lg" ? "72px" : "48px"}
          src={imagePaths.brand.patriciaLogo}
        />
      </span>
      {showWordmark ? (
        <span className="grid leading-none">
          <span className={cn("font-[var(--font-heading)] text-xl font-semibold", inverted ? "text-[var(--color-soft-white)]" : "text-[var(--foreground)]")}>
            {brand.name}
          </span>
          <span className={cn("mt-1 text-[11px] font-semibold tracking-[0.14em] uppercase", inverted ? "text-[rgb(255_255_255_/_0.62)]" : "text-[var(--muted)]")}>
            {brand.region}
          </span>
        </span>
      ) : (
        <span className="sr-only">{brand.name}</span>
      )}
    </>
  );

  if (!href) {
    return <span className="inline-flex items-center gap-3">{mark}</span>;
  }

  return (
    <Link
      aria-label={`${brand.name} home`}
      className="inline-flex items-center gap-3"
      href={href}
      onClick={onClick}
    >
      {mark}
    </Link>
  );
}
