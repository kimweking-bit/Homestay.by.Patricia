import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8">
        <Link className="text-base font-semibold" href="/">
          Homestay.by.Patricia
        </Link>
        <nav aria-label="Primary navigation" className="flex gap-5 text-sm text-[var(--muted)]">
          <Link className="hover:text-[var(--foreground)]" href="/">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
