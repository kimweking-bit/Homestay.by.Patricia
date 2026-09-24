"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/lib/brand";
import { contactDetails } from "@/lib/mock-data";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <p className="eyebrow text-[var(--accent)]">Host</p>
        <h1 className="type-h2">Settings</h1>
        <p className="type-body mt-2 text-[var(--muted)]">
          Public contact is email-only. Guests reach {brand.host} at one
          address.
        </p>
      </header>

      <form className="grid gap-5" onSubmit={onSubmit}>
        <Input
          defaultValue={contactDetails.email}
          label="Public email"
          name="email"
          type="email"
          required
        />
        <Input
          defaultValue={contactDetails.location}
          label="Location shown on site"
          name="location"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Save</Button>
          {saved ? (
            <p className="type-small text-[var(--muted)]" role="status">
              Saved locally for this demo.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
