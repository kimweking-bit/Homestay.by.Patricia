"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  options: SelectOption[];
};

export function Select({
  className,
  helperText,
  error,
  id,
  label,
  options,
  value,
  defaultValue,
  disabled,
  name,
  onChange,
  onBlur,
  required,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;
  const helperId = helperText ? `${selectId}-helper` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(
    String(defaultValue ?? options[0]?.value ?? ""),
  );
  const selectedValue = String(isControlled ? value : uncontrolled);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue) ?? options[0],
    [options, selectedValue],
  );

  const enabledIndexes = useMemo(
    () =>
      options
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => !option.disabled)
        .map(({ index }) => index),
    [options],
  );

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(-1);
  }, []);

  const commit = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);

      if (onChange) {
        const synthetic = {
          target: { value: next, name },
          currentTarget: { value: next, name },
        } as unknown as ChangeEvent<HTMLSelectElement>;
        onChange(synthetic);
      }
      close();
      triggerRef.current?.focus();
    },
    [close, isControlled, name, onChange],
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }

    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = options.findIndex((option) => option.value === selectedValue);
    const start =
      selectedIndex >= 0 && !options[selectedIndex]?.disabled
        ? selectedIndex
        : (enabledIndexes[0] ?? -1);
    setHighlight(start);

    // Scroll active option into view after open
    requestAnimationFrame(() => {
      const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
      active?.scrollIntoView({ block: "nearest" });
    });
  }, [enabledIndexes, open, options, selectedValue]);

  function moveHighlight(direction: 1 | -1) {
    if (enabledIndexes.length === 0) return;
    const position = enabledIndexes.indexOf(highlight);
    const nextPosition =
      position === -1
        ? direction === 1
          ? 0
          : enabledIndexes.length - 1
        : (position + direction + enabledIndexes.length) % enabledIndexes.length;
    const next = enabledIndexes[nextPosition] ?? -1;
    setHighlight(next);
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`);
      el?.scrollIntoView({ block: "nearest" });
    });
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (event.key === "ArrowDown") moveHighlight(1);
      if (event.key === "ArrowUp") moveHighlight(-1);
      if (event.key === "Enter" || event.key === " ") {
        const option = options[highlight];
        if (option && !option.disabled) commit(option.value);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setHighlight(enabledIndexes[0] ?? -1);
    } else if (event.key === "End") {
      event.preventDefault();
      setHighlight(enabledIndexes[enabledIndexes.length - 1] ?? -1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[highlight];
      if (option && !option.disabled) commit(option.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      close();
    }
  }

  const isActive = Boolean(className?.includes("is-active-control"));

  return (
    <div className="ui-select" ref={rootRef} data-open={open ? "true" : "false"}>
      {label ? (
        <label className="type-label mb-2 block" htmlFor={selectId}>
          {label}
          {required ? <span className="sr-only"> (required)</span> : null}
        </label>
      ) : null}

      {/* Native select kept for form posts / progressive enhancement; visually hidden */}
      <select
        aria-hidden="true"
        className="ui-select-native"
        disabled={disabled}
        id={`${selectId}-native`}
        name={name}
        onChange={() => undefined}
        required={required}
        tabIndex={-1}
        value={selectedValue}
        {...props}
      >
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        aria-controls={listboxId}
        aria-describedby={describedBy}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={Boolean(error) || undefined}
        aria-required={required || undefined}
        className={cn(
          "field-control ui-select-trigger",
          isActive ? "is-active-control" : null,
          open ? "is-open" : null,
          error ? "is-invalid" : null,
          className || null,
        )}
        disabled={disabled}
        id={selectId}
        onBlur={onBlur as never}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        onKeyDown={onTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span className="ui-select-value">{selectedOption?.label ?? "Select"}</span>
        <span aria-hidden="true" className="ui-select-chevron">
          <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
            <path
              d="M4 6.25 8 10.25 12 6.25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <ul
          aria-labelledby={selectId}
          className="ui-select-menu"
          id={listboxId}
          onKeyDown={onListKeyDown}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const selected = option.value === selectedValue;
            const active = index === highlight;
            return (
              <li
                aria-disabled={option.disabled || undefined}
                aria-selected={selected}
                className={cn(
                  "ui-select-option",
                  selected && "is-selected",
                  active && "is-active",
                  option.disabled && "is-disabled",
                )}
                data-active={active ? "true" : undefined}
                data-index={index}
                id={`${selectId}-option-${index}`}
                key={option.value}
                onMouseEnter={() => {
                  if (!option.disabled) setHighlight(index);
                }}
                onMouseDown={(event) => {
                  // Prevent button blur-before-click race
                  event.preventDefault();
                }}
                onClick={() => {
                  if (option.disabled) return;
                  commit(option.value);
                }}
                role="option"
              >
                <span className="ui-select-option-label">{option.label}</span>
                {selected ? (
                  <span aria-hidden="true" className="ui-select-check">
                    <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                      <path
                        d="M2.5 7.2 5.4 10.1 11.5 3.9"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {helperText && !error ? (
        <p className="mt-2 text-sm text-[var(--muted)]" id={helperId}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-[var(--color-danger)]" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
