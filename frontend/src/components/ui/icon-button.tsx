import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ children, className, label, ...props }: IconButtonProps) {
  return (
    <button aria-label={label} className={cn("icon-btn", className)} type="button" {...props}>
      {children}
    </button>
  );
}
