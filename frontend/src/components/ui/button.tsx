import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "inverse" | "ghost" | "ghostInverse" | "constructive" | "destructive";

type SharedButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
};

type ButtonAsLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  SharedButtonProps & {
    href: string;
  };

type ButtonAsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  SharedButtonProps & {
    href?: never;
  };

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

function isLinkButtonProps(props: ButtonProps): props is ButtonAsLinkProps {
  return typeof props.href === "string";
}

export function Button(props: ButtonProps) {
  if (isLinkButtonProps(props)) {
    const { children, className, href, variant: variantName, ...linkProps } = props;
    return (
      <Link className={cn("btn", `btn-${variantName ?? "primary"}`, className)} href={href} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { children, className, variant: variantName, ...buttonProps } = props;
  return (
    <button className={cn("btn", `btn-${variantName ?? "primary"}`, className)} {...buttonProps}>
      {children}
    </button>
  );
}
