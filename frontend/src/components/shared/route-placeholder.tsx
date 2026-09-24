type RoutePlaceholderProps = {
  title: string;
};

export function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <section className="site-container py-16">
      <p className="type-metadata mb-3 text-[var(--accent)]">Planned route</p>
      <h1 className="type-h2 text-[var(--foreground)]">{title}</h1>
    </section>
  );
}
