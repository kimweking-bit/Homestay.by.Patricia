import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { brand } from "@/lib/brand";
import { contactDetails } from "@/lib/mock-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--color-forest)] text-[var(--color-soft-white)]">
      <div className="site-container grid gap-10 py-12 md:grid-cols-[1.3fr_0.7fr_0.8fr_0.7fr] md:py-16">
        <div>
          <BrandMark href="/" inverted showWordmark />
          <p className="type-body mt-5 max-w-sm text-[rgb(255_255_255_/_0.68)]">
            {brand.description}
          </p>
        </div>

        <div>
          <p className="type-metadata mb-4 text-[var(--color-gold-soft)]">
            Explore
          </p>
          <nav className="grid gap-3 text-sm text-[rgb(255_255_255_/_0.72)]">
            <Link
              className="hover:text-[var(--color-soft-white)]"
              href="/properties"
            >
              Stays
            </Link>
            <Link
              className="hover:text-[var(--color-soft-white)]"
              href="/gallery"
            >
              Gallery
            </Link>
            <Link
              className="hover:text-[var(--color-soft-white)]"
              href="/about"
            >
              About
            </Link>
            <Link
              className="hover:text-[var(--color-soft-white)]"
              href="/contact"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div>
          <p className="type-metadata mb-4 text-[var(--color-gold-soft)]">
            Stay in touch
          </p>
          <div className="grid gap-3 text-sm text-[rgb(255_255_255_/_0.72)]">
            <a
              className="hover:text-[var(--color-soft-white)]"
              href={`mailto:${contactDetails.email}`}
            >
              {contactDetails.email}
            </a>
            <p className="text-[rgb(255_255_255_/_0.55)]">
              {contactDetails.location}
            </p>
          </div>
        </div>

        <div>
          <p className="type-metadata mb-4 text-[var(--color-gold-soft)]">
            Guests
          </p>
          <nav className="grid gap-3 text-sm text-[rgb(255_255_255_/_0.72)]">
            <Link
              className="hover:text-[var(--color-soft-white)]"
              href="/account"
            >
              Account
            </Link>
            <Link
              className="hover:text-[var(--color-soft-white)]"
              href="/account/bookings"
            >
              Reservations
            </Link>
            <Link
              className="hover:text-[var(--color-soft-white)]"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="hover:text-[var(--color-soft-white)]"
              href="/admin/dashboard"
            >
              Host
            </Link>
          </nav>
        </div>
      </div>
      <div className="site-container flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(255_255_255_/_0.12)] py-5 text-sm text-[rgb(255_255_255_/_0.55)]">
        <p>
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
        <p>Contact by email only</p>
      </div>
    </footer>
  );
}
