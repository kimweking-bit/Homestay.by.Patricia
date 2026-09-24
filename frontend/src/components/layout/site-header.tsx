"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/properties", label: "Stays" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const SCROLL_SOLID_AT = 96;
const SCROLL_HIDE_DELTA = 8;

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const overlay = isHome && !scrolled && !isOpen;

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const delta = y - lastY;

      setScrolled(y > SCROLL_SOLID_AT);

      // Keep nav visible near top, when menu is open, or on scroll-up.
      if (y < SCROLL_SOLID_AT || isOpen) {
        setHidden(false);
      } else if (delta > SCROLL_HIDE_DELTA) {
        setHidden(true);
      } else if (delta < -SCROLL_HIDE_DELTA) {
        setHidden(false);
      }

      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-[var(--z-header)] transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out will-change-transform",
        hidden && !isOpen ? "-translate-y-full" : "translate-y-0",
        overlay
          ? "absolute border-b border-[rgb(255_255_255_/_0.18)] bg-transparent text-[var(--color-soft-white)]"
          : "fixed border-b border-[rgb(44_36_28_/_0.1)] bg-[rgb(247_241_232_/_0.88)] text-[var(--foreground)] shadow-[0_10px_28px_rgb(44_36_28_/_0.08)] backdrop-blur-md",
      )}
    >
      <div className="site-container flex min-h-[var(--header-height)] items-center justify-between gap-6">
        <BrandMark inverted={overlay} onClick={() => setIsOpen(false)} />

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "site-link nav-hover-link relative py-2 text-[15px] font-semibold",
                  overlay ? "text-[rgb(255_255_255_/_0.76)] hover:text-[var(--color-soft-white)]" : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  active && (overlay ? "text-[var(--color-soft-white)]" : "text-[var(--foreground)]"),
                  active && "nav-hover-link-active",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            className={cn(
              "site-link nav-hover-link relative py-2 text-[15px] font-semibold",
              overlay ? "text-[rgb(255_255_255_/_0.76)] hover:text-[var(--color-soft-white)]" : "text-[var(--muted)] hover:text-[var(--foreground)]",
              pathname.startsWith("/account") && (overlay ? "text-[var(--color-soft-white)]" : "text-[var(--foreground)]"),
              pathname.startsWith("/account") && "nav-hover-link-active",
            )}
            href="/account"
          >
            Account
          </Link>
          <Button className="site-header-cta" href="/properties">
            Browse stays
          </Button>
        </nav>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 border-b px-1 text-[15px] font-semibold md:hidden",
            overlay ? "border-[rgb(255_255_255_/_0.42)] text-[var(--color-soft-white)]" : "border-[var(--color-brass)] text-[var(--foreground)]",
          )}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[rgb(34_34_34_/_0.1)] bg-[var(--color-porcelain)] text-[var(--foreground)] shadow-[var(--shadow-overlay)] md:hidden"
          id="mobile-navigation"
        >
          <div className="site-container grid gap-1 py-5">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "border-l-2 py-3 pl-4 text-[15px] font-semibold transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]",
                    active ? "border-[var(--color-brass)] text-[var(--foreground)]" : "border-transparent text-[var(--muted)]",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link className="border-l-2 border-transparent py-3 pl-4 text-[15px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]" href="/account" onClick={() => setIsOpen(false)}>
              Account
            </Link>
            <Link className="border-l-2 border-transparent py-3 pl-4 text-[15px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]" href="/login" onClick={() => setIsOpen(false)}>
              Sign in
            </Link>
            <div className="pt-3">
              <Button href="/properties" onClick={() => setIsOpen(false)}>
                Browse stays
              </Button>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
