import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ actionHref, actionLabel, eyebrow, text, title }: EmptyStateProps) {
  return (
    <div className="border-t border-[var(--border)] py-10">
      {eyebrow ? <p className="eyebrow mb-3 text-[var(--accent)]">{eyebrow}</p> : null}
      <h2 className="type-h3 max-w-2xl text-pretty text-[var(--foreground)]">{title}</h2>
      <p className="type-body mt-4 max-w-2xl text-[var(--muted)]">{text}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Button href={actionHref} variant="secondary">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
