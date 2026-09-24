import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { demoBookings } from "@/lib/mock-data";

const upcoming = demoBookings.filter((booking) => booking.status === "CONFIRMED" || booking.status === "PENDING");
const past = demoBookings.filter((booking) => booking.status === "CANCELLED" || booking.status === "REJECTED");

export default function AccountPage() {
  return (
    <section className="site-container py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Guest account</h1>
          <p className="type-small mt-2 text-[var(--muted)]">Reservations, profile, and support for your Sutera Stays requests.</p>
        </div>
        <Button href="/account/profile" variant="secondary">
          Edit profile
        </Button>
      </div>

      <nav className="mt-8 flex flex-wrap gap-4 border-b border-[var(--border)] pb-3 text-sm font-semibold">
        <span className="border-b-2 border-[var(--color-gold)] pb-3">Overview</span>
        <Link className="pb-3 text-[var(--muted)] hover:text-[var(--foreground)]" href="/account/bookings">
          Reservations
        </Link>
        <Link className="pb-3 text-[var(--muted)] hover:text-[var(--foreground)]" href="/account/profile">
          Profile
        </Link>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-lg font-semibold">Upcoming</h2>
          <div className="mt-4 grid gap-4">
            {upcoming.map((booking) => (
              <article className="border border-[var(--border)] bg-[var(--surface)] p-5" key={booking.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="type-small text-[var(--muted)]">{booking.dates}</p>
                    <h3 className="mt-1 text-xl font-semibold">{booking.propertyName}</h3>
                    <p className="type-small mt-2 text-[var(--muted)]">
                      {booking.guests} · {booking.price}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </article>
            ))}
          </div>

          <h2 className="mt-10 text-lg font-semibold">Past</h2>
          <div className="mt-4 grid gap-4">
            {past.map((booking) => (
              <article className="border-t border-[var(--border)] pt-4" key={booking.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="type-small text-[var(--muted)]">{booking.dates}</p>
                    <h3 className="mt-1 font-semibold">{booking.propertyName}</h3>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid gap-5 self-start">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Saved stays</h2>
            <p className="type-small mt-2 text-[var(--muted)]">Saved homes will appear here when guest accounts are connected.</p>
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Support</h2>
            <p className="type-small mt-2 text-[var(--muted)]">Need to change dates or ask about a request?</p>
            <div className="mt-4">
              <Button href="/contact" variant="secondary">
                Contact Patricia
              </Button>
            </div>
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Payment methods</h2>
            <p className="type-small mt-2 text-[var(--muted)]">Cards and receipts will appear here when checkout is connected. No payment details are stored on this page.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
