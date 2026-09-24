import { EmptyState } from "@/components/shared/empty-state";
import { reviews } from "@/lib/mock-data";

export default function AdminReviewsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
      <p className="type-small mt-1 text-[var(--muted)]">Verified guest notes that can appear on the stay page.</p>

      {reviews.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {reviews.map((review) => (
            <article className="border border-[var(--border)] bg-[var(--surface)] p-4" key={review.id}>
              <p className="type-small text-[var(--muted)]">{review.location}</p>
              <h2 className="text-lg font-semibold">{review.name}</h2>
              <p className="type-body mt-3 max-w-2xl text-[var(--muted)]">{review.text}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          text="No verified guest notes are ready to publish. Reviews will appear here after Patricia approves which comments should be public."
          title="Nothing to moderate yet."
        />
      )}
    </div>
  );
}
