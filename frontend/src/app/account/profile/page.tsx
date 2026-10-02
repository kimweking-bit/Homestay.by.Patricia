"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/services/api-client";
import { getSession, updateProfile } from "@/services/api/auth";

export default function AccountProfilePage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const session = useQuery({ queryKey: ["session"], queryFn: getSession, retry: false });
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(["session"], user);
      setStatus("Your profile was updated.");
    },
  });

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("");
    mutation.mutate({
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
    });
  }

  if (session.isPending) {
    return <section className="site-container py-12" role="status">Loading your profile...</section>;
  }
  if (session.isError || !session.data) {
    return (
      <section className="site-container py-12">
        <p className="text-[var(--color-danger)]" role="alert">Your profile could not be loaded. Please sign in again.</p>
      </section>
    );
  }

  return (
    <section className="site-container py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      <p className="type-small mt-2 max-w-xl text-[var(--muted)]">Guest details used for booking requests.</p>
      <form className="mt-8 grid max-w-xl gap-5 border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6" onSubmit={save}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input defaultValue={session.data.firstName} label="First name" name="firstName" required />
          <Input defaultValue={session.data.lastName} label="Last name" name="lastName" required />
        </div>
        <Input defaultValue={session.data.email} label="Email" name="email" required type="email" />
        <Input defaultValue={session.data.phone ?? ""} label="Phone" name="phone" />
        {status ? <p className="type-small text-[var(--accent-quiet)]" role="status">{status}</p> : null}
        {mutation.isError ? (
          <p className="type-small text-[var(--color-danger)]" role="alert">
            {apiErrorMessage(mutation.error, "Your profile could not be saved.")}
          </p>
        ) : null}
        <Button disabled={mutation.isPending} type="submit">{mutation.isPending ? "Saving..." : "Save profile"}</Button>
      </form>
    </section>
  );
}
