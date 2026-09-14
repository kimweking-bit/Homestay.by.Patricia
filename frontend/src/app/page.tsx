import { Button } from "@/components/ui/button";

const principles = [
  "Explicit API contracts",
  "Server-side authority for business rules",
  "Accessible responsive interface",
  "Independent frontend and backend ownership",
];

export default function HomePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-136px)] w-full max-w-6xl content-center gap-10 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
          Homestay.by.Patricia
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)] md:text-6xl">
          Accommodation platform foundation
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)] md:text-lg">
          A production-minded starting point for discovery, stays, and future booking workflows.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/api-boundary">API boundary</Button>
          <Button href="/engineering" variant="secondary">
            Engineering notes
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Foundation</h2>
        <ul className="mt-5 space-y-4">
          {principles.map((principle) => (
            <li className="flex gap-3 text-sm leading-6 text-[var(--muted)]" key={principle}>
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
