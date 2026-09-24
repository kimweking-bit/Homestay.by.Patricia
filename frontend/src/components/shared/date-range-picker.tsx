"use client";

import { useMemo, useState } from "react";
import { monthGrid } from "@/lib/availability";
import {
  formatDisplayDate,
  nightsBetween,
  rangeOverlapsBlocked,
  todayIso,
} from "@/lib/booking";
import { cn } from "@/lib/cn";

type DateRangePickerProps = {
  blockedDates: Set<string>;
  checkIn: string;
  checkOut: string;
  onChange: (next: { checkIn: string; checkOut: string }) => void;
  className?: string;
};

type DayVisual =
  | "empty"
  | "past"
  | "blocked"
  | "available"
  | "today"
  | "selected"
  | "in-range";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function overlapsBlocked(start: string, end: string, blocked: Set<string>) {
  return rangeOverlapsBlocked(start, end, blocked);
}

function visualForDay(
  iso: string,
  today: string,
  blocked: Set<string>,
  checkIn: string,
  checkOut: string,
  hover: string | null,
): DayVisual {
  if (iso < today) return "past";
  if (blocked.has(iso)) return "blocked";
  if (iso === checkIn || iso === checkOut) return "selected";

  const rangeEnd =
    checkOut || (checkIn && hover && hover > checkIn ? hover : null);
  if (checkIn && rangeEnd && iso > checkIn && iso < rangeEnd) {
    if (!overlapsBlocked(checkIn, rangeEnd, blocked)) return "in-range";
  }

  if (iso === today) return "today";
  return "available";
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      className="drp-chevron"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d={dir === "prev" ? "M10 3.5 5.5 8 10 12.5" : "M6 3.5 10.5 8 6 12.5"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function DateRangePicker({
  blockedDates,
  checkIn,
  checkOut,
  onChange,
  className,
}: DateRangePickerProps) {
  const today = todayIso();
  const now = new Date();
  const [{ year, month }, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<"in" | "out">("in");

  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(
    "en-MY",
    { month: "long", timeZone: "UTC" },
  );
  const yearLabel = String(year);

  const selectingCheckout = Boolean(checkIn && !checkOut);
  const nights =
    checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null;
  const previewNights =
    !checkOut && checkIn && hoverDate && hoverDate > checkIn
      ? nightsBetween(checkIn, hoverDate)
      : null;

  function selectDay(iso: string, visual: DayVisual) {
    if (visual === "past" || visual === "blocked" || visual === "empty") return;

    if (!checkIn || (checkIn && checkOut) || activeField === "in") {
      if (checkIn && checkOut && activeField === "out" && iso > checkIn) {
        if (!overlapsBlocked(checkIn, iso, blockedDates)) {
          onChange({ checkIn, checkOut: iso });
          setHoverDate(null);
          return;
        }
      }
      onChange({ checkIn: iso, checkOut: "" });
      setActiveField("out");
      setHoverDate(null);
      return;
    }

    if (iso <= checkIn) {
      onChange({ checkIn: iso, checkOut: "" });
      setActiveField("out");
      setHoverDate(null);
      return;
    }

    if (overlapsBlocked(checkIn, iso, blockedDates)) {
      onChange({ checkIn: iso, checkOut: "" });
      setActiveField("out");
      setHoverDate(null);
      return;
    }

    onChange({ checkIn, checkOut: iso });
    setActiveField("in");
    setHoverDate(null);
  }

  function clearRange() {
    onChange({ checkIn: "", checkOut: "" });
    setActiveField("in");
    setHoverDate(null);
  }

  const showNights = nights ?? previewNights;

  return (
    <div className={cn("drp", className)}>
      <div className="drp-shell">
        {/* Dual date fields */}
        <div className="drp-fields" role="group" aria-label="Stay dates">
          <button
            className={cn(
              "drp-field",
              activeField === "in" && "is-active",
              checkIn && "is-filled",
            )}
            onClick={() => setActiveField("in")}
            type="button"
          >
            <span className="drp-field-label">Check-in</span>
            <span className="drp-field-value">
              {checkIn ? formatDisplayDate(checkIn) : "Add date"}
            </span>
          </button>
          <div className="drp-field-bridge" aria-hidden="true">
            <span className="drp-field-bridge-line" />
            {showNights && showNights > 0 ? (
              <span className="drp-nights-chip">
                {showNights} {showNights === 1 ? "night" : "nights"}
              </span>
            ) : (
              <span className="drp-field-bridge-dot" />
            )}
            <span className="drp-field-bridge-line" />
          </div>
          <button
            className={cn(
              "drp-field",
              activeField === "out" && "is-active",
              checkOut && "is-filled",
            )}
            onClick={() => {
              if (checkIn) setActiveField("out");
              else setActiveField("in");
            }}
            type="button"
          >
            <span className="drp-field-label">Check-out</span>
            <span className="drp-field-value">
              {checkOut
                ? formatDisplayDate(checkOut)
                : selectingCheckout
                  ? "Select date"
                  : "Add date"}
            </span>
          </button>
        </div>

        {/* Month chrome */}
        <div className="drp-month-bar">
          <button
            aria-label="Previous month"
            className="drp-nav-btn"
            onClick={() => setCursor((c) => shiftMonth(c.year, c.month, -1))}
            type="button"
          >
            <Chevron dir="prev" />
          </button>
          <div className="drp-month-title">
            <span className="drp-month-name">{monthName}</span>
            <span className="drp-month-year">{yearLabel}</span>
          </div>
          <button
            aria-label="Next month"
            className="drp-nav-btn"
            onClick={() => setCursor((c) => shiftMonth(c.year, c.month, 1))}
            type="button"
          >
            <Chevron dir="next" />
          </button>
        </div>

        <div className="drp-weekdays" aria-hidden="true">
          {WEEKDAYS.map((day, i) => (
            <span key={`${day}-${i}`} className="drp-weekday">
              {day}
            </span>
          ))}
        </div>

        <div
          aria-label={`Calendar ${monthName} ${yearLabel}`}
          className={cn("drp-grid", selectingCheckout && "is-selecting-out")}
          onMouseLeave={() => setHoverDate(null)}
          role="grid"
        >
          {cells.map((cell, index) => {
            if (!cell.iso || cell.date == null) {
              return (
                <div key={`empty-${index}`} className="drp-cell is-empty" />
              );
            }

            const visual = visualForDay(
              cell.iso,
              today,
              blockedDates,
              checkIn,
              checkOut,
              hoverDate,
            );
            const isStart = cell.iso === checkIn;
            const isEnd = cell.iso === checkOut;
            const rangeEnd =
              checkOut ||
              (checkIn && hoverDate && hoverDate > checkIn ? hoverDate : null);
            const inPreviewRange =
              Boolean(
                checkIn &&
                  rangeEnd &&
                  cell.iso > checkIn &&
                  cell.iso < rangeEnd &&
                  !checkOut,
              );
            const disabled = visual === "past" || visual === "blocked";

            return (
              <div
                key={cell.iso}
                className={cn(
                  "drp-cell",
                  `is-${visual}`,
                  isStart && "is-start",
                  isEnd && "is-end",
                  inPreviewRange && "is-preview",
                )}
              >
                <button
                  aria-label={`${formatDisplayDate(cell.iso)}${
                    disabled
                      ? ", unavailable"
                      : isStart
                        ? ", check-in"
                        : isEnd
                          ? ", check-out"
                          : ""
                  }`}
                  aria-pressed={isStart || isEnd}
                  className="drp-day"
                  disabled={disabled}
                  onClick={() => selectDay(cell.iso!, visual)}
                  onFocus={() => {
                    if (selectingCheckout && !disabled) setHoverDate(cell.iso!);
                  }}
                  onMouseEnter={() => {
                    if (selectingCheckout && !disabled) setHoverDate(cell.iso!);
                  }}
                  type="button"
                >
                  <span className="drp-day-num">{cell.date}</span>
                  {visual === "today" && !isStart && !isEnd ? (
                    <span className="drp-today-dot" aria-hidden="true" />
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>

        <div className="drp-footer">
          <ul className="drp-legend" aria-label="Calendar legend">
            <li>
              <span className="drp-legend-swatch is-available" aria-hidden="true" />
              Open
            </li>
            <li>
              <span className="drp-legend-swatch is-selected" aria-hidden="true" />
              Chosen
            </li>
            <li>
              <span className="drp-legend-swatch is-blocked" aria-hidden="true" />
              Booked
            </li>
          </ul>
          {checkIn || checkOut ? (
            <button className="drp-clear" onClick={clearRange} type="button">
              Clear dates
            </button>
          ) : (
            <span className="drp-footer-hint">
              {activeField === "out" && checkIn
                ? "Choose check-out"
                : "Choose check-in"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
