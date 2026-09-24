"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { cn } from "@/lib/cn";

const adminLinks = [
  ["/admin/dashboard", "Overview"],
  ["/admin/bookings", "Reservations"],
  ["/admin/availability", "Calendar"],
  ["/admin/properties", "Properties"],
  ["/admin/reviews", "Reviews"],
  ["/admin/settings", "Settings"],
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="ops-shell min-h-screen lg:grid">
      <aside className={cn("ops-sidebar", open ? "block" : "hidden lg:block")}>
        <div className="flex items-center justify-between px-5 py-5">
          <BrandMark href="/admin/dashboard" inverted size="sm" />
          <button className="type-small text-[var(--color-soft-white)] lg:hidden" onClick={() => setOpen(false)} type="button">
            Close
          </button>
        </div>
        <p className="px-5 pb-3 text-[11px] font-semibold tracking-[0.14em] text-[var(--color-gold-soft)] uppercase">Operations</p>
        <nav aria-label="Host operations">
          {adminLinks.map(([href, label]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn("ops-link", active && "ops-link-active")}
                href={href}
                key={href}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 px-5 pb-8">
          <Link className="text-sm text-[rgb(255_255_255_/_0.65)] hover:text-[var(--color-soft-white)]" href="/">
            View guest site
          </Link>
        </div>
      </aside>

      <div className="min-w-0 bg-[var(--background)]">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:px-8">
          <button
            className="type-small min-h-11 border border-[var(--border)] px-3 font-semibold lg:hidden"
            onClick={() => setOpen(true)}
            type="button"
          >
            Menu
          </button>
          <p className="text-sm font-semibold text-[var(--foreground)]">Sutera Stays · Host</p>
          <Link className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]" href="/properties">
            Guest site
          </Link>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
