"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountProfilePage() {
  const [status, setStatus] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Profile details are ready on this page. They will persist when guest accounts are connected.");
  }

  return (
    <section className="site-container py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      <p className="type-small mt-2 max-w-xl text-[var(--muted)]">Guest details used for booking requests.</p>
      <form className="mt-8 grid max-w-xl gap-5 border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6" onSubmit={save}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input defaultValue="Sarah" label="First name" name="firstName" />
          <Input defaultValue="Lim" label="Last name" name="lastName" />
        </div>
        <Input defaultValue="sarah@example.com" label="Email" name="email" type="email" />
        <Input defaultValue="+60 12-222 8899" label="Phone" name="phone" />
        {status ? (
          <p className="type-small text-[var(--accent-quiet)]" role="status">
            {status}
          </p>
        ) : null}
        <Button type="submit">Save profile</Button>
      </form>
    </section>
  );
}
