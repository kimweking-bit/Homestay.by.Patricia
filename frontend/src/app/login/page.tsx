"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/lib/brand";

type AuthMode = "login" | "signup" | "reset";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!email) {
      setError("Enter the email you use for Sutera Stays.");
      setMessage("");
      return;
    }

    setError("");
    if (mode === "reset") {
      setMessage("Password reset will send from the account service once authentication is connected. No email has been sent yet.");
      return;
    }
    if (mode === "signup") {
      setMessage("Account creation is prepared here. No guest account has been created yet — authentication still needs the Sutera Stays service.");
      return;
    }
    setMessage("Sign-in is prepared here. Backend authentication is not connected, so no session has been started.");
  }

  return (
    <section className="mx-auto grid min-h-screen max-w-md content-center px-5 py-12">
      <BrandMark href="/" />
      <h1 className="mt-10 text-2xl font-semibold tracking-tight">
        {mode === "signup" ? "Create a guest account" : mode === "reset" ? "Reset your password" : "Sign in"}
      </h1>
      <p className="type-small mt-2 text-[var(--muted)]">
        {mode === "signup"
          ? "Accounts help returning guests review request status. Checkout still works without one."
          : mode === "reset"
            ? "Enter your email and we will prepare a reset once the account service is live."
            : `Welcome back to ${brand.name}.`}
      </p>

      <form className="mt-8 grid gap-5" onSubmit={submit}>
        <Input autoComplete="email" label="Email" name="email" required type="email" />
        {mode !== "reset" ? <Input autoComplete={mode === "signup" ? "new-password" : "current-password"} label="Password" name="password" required type="password" /> : null}
        {error ? (
          <p className="type-small text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="type-small text-[var(--accent-quiet)]" role="status">
            {message}
          </p>
        ) : null}
        <Button type="submit">{mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</Button>
      </form>

      <div className="mt-6 grid gap-2 type-small text-[var(--muted)]">
        {mode !== "login" ? (
          <button className="text-left font-semibold text-[var(--foreground)]" onClick={() => setMode("login")} type="button">
            Back to sign in
          </button>
        ) : (
          <>
            <button className="text-left font-semibold text-[var(--foreground)]" onClick={() => setMode("signup")} type="button">
              Create an account
            </button>
            <button className="text-left font-semibold text-[var(--foreground)]" onClick={() => setMode("reset")} type="button">
              Forgot password
            </button>
          </>
        )}
        <Link className="font-semibold text-[var(--foreground)]" href="/">
          Return home
        </Link>
      </div>
    </section>
  );
}
