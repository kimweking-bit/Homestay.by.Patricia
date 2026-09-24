"use client";

import { useId } from "react";
import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helperText?: ReactNode;
  error?: ReactNode;
};

export function Textarea({ className, helperText, error, id, label, ...props }: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [props["aria-describedby"], helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label className="type-label" htmlFor={inputId}>
        {label}
      </label>
      <textarea
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn("field-control field-control-textarea", className)}
        id={inputId}
        {...props}
      />
      {helperText ? (
        <p className="type-small text-[var(--muted)]" id={helperId}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="type-small text-[var(--color-danger)]" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
