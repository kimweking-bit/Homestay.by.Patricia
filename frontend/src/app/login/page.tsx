"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/lib/brand";
import { apiErrorMessage } from "@/services/api-client";
import { loginAccount, registerAccount, type SessionUser } from "@/services/api/auth";

type AuthMode = "login" | "signup" | "reset";

function safeRedirectPath(nextPath: string | null, role: SessionUser["role"]) {
  const fallback = role === "ADMIN" ? "/admin/dashboard" : "/account";
  if (
    !nextPath ||
    !nextPath.startsWith("/") ||
    nextPath.startsWith("//") ||
    nextPath.includes("\\") ||
    nextPath.startsWith("/login")
  ) {
    return fallback;
  }
  if (role !== "ADMIN" && nextPath.startsWith("/admin")) {
    return "/account";
  }
  return nextPath;
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!email) {
      setError("Enter the email you use for Sutera Stays.");
      setMessage("");
      return;
    }

    if (mode === "reset") {
      setError("Password reset is not available yet. Please contact Patricia for help.");
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const user =
        mode === "signup"
          ? await registerAccount({
              email,
              password: String(form.get("password") ?? ""),
              firstName: String(form.get("firstName") ?? "").trim(),
              lastName: String(form.get("lastName") ?? "").trim(),
              phone: String(form.get("phone") ?? "").trim() || undefined,
            })
          : await loginAccount({ email, password: String(form.get("password") ?? "") });
      queryClient.setQueryData(["session"], user);
      router.replace(safeRedirectPath(searchParams.get("next"), user.role));
    } catch (submitError) {
      setError(apiErrorMessage(submitError, "We could not complete sign-in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
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
        {mode === "signup" ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input autoComplete="given-name" label="First name" name="firstName" required />
              <Input autoComplete="family-name" label="Last name" name="lastName" required />
            </div>
            <Input autoComplete="tel" label="Phone (optional)" name="phone" type="tel" />
          </>
        ) : null}
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
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting
            ? "Please wait..."
            : mode === "signup"
              ? "Create account"
              : mode === "reset"
                ? "Get help"
                : "Sign in"}
        </Button>
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
