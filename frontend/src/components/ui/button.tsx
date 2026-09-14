import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-teal-800",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-stone-100",
};

export function Button({ children, className, href, variant = "primary", ...props }: ButtonProps) {
  const classes = [
    "inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition-colors",
    variantClassName[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={classes} href={href} {...props}>
      {children}
    </Link>
  );
}
