"use client";

import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
};

export function Checkbox({ className, id, label, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className="type-small flex items-center gap-3 text-[var(--muted)]" htmlFor={inputId}>
      <input
        className={cn(
          "h-4 w-4 accent-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]",
          className,
        )}
        id={inputId}
        type="checkbox"
        {...props}
      />
      {label}
    </label>
  );
}
