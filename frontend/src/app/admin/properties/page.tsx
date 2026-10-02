"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/services/api-client";
import { archiveProperty, listAdminProperties } from "@/services/api/properties";

export default function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const properties = useQuery({ queryKey: ["admin-properties"], queryFn: listAdminProperties });
  const archive = useMutation({
    mutationFn: archiveProperty,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
          <p className="type-small mt-1 text-[var(--muted)]">Property records currently stored by the stay service.</p>
        </div>
        <Button disabled type="button">Add property</Button>
      </div>
      <p className="type-small mt-3 text-[var(--muted)]">Property creation and editing are not available in this interface yet.</p>
      {archive.isError ? (
        <p className="mt-4 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(archive.error, "The property could not be archived.")}
        </p>
      ) : null}
      {properties.isPending ? <p className="mt-8" role="status">Loading properties...</p> : null}
      {properties.isError ? (
        <p className="mt-8 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(properties.error, "Properties could not be loaded.")}
        </p>
      ) : null}
      {properties.isSuccess && properties.data.items.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">No property records found.</p>
      ) : null}

      {properties.isSuccess ? (
        <div className="mt-8 grid gap-4">
          {properties.data.items.map((property) => (
            <article className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[160px_1fr_auto]" key={property.id}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-image)]">
                {property.heroImage ? (
                  <AppImage alt={property.imageAlt} className="image-cover" fill sizes="160px" src={property.heroImage} />
                ) : <div aria-label="No property image" className="h-full w-full bg-[var(--surface-muted)]" role="img" />}
              </div>
              <div>
                <p className="type-small text-[var(--muted)]">{property.location} · {property.status ?? "PUBLISHED"}</p>
                <h2 className="text-xl font-semibold">{property.name}</h2>
                <p className="type-small mt-2 text-[var(--muted)]">{property.propertyType} · {property.guests}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button href={`/properties/${property.slug}`} variant="secondary">View</Button>
                {property.status !== "ARCHIVED" ? (
                  <Button
                    disabled={archive.isPending}
                    onClick={() => {
                      if (window.confirm(`Archive ${property.name}?`)) {
                        archive.mutate(property.slug);
                      }
                    }}
                    type="button"
                    variant="destructive"
                  >
                    Archive
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
