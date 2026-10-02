"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/services/api/auth";

export function SessionGate({ children, role }: { children: ReactNode; role?: "ADMIN" }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    retry: false,
  });

  useEffect(() => {
    if (!session.isPending && !session.isError && !session.data) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (role && session.data && session.data.role !== role) {
      router.replace("/account");
    }
  }, [pathname, role, router, session.data, session.isError, session.isPending]);

  if (session.isPending) {
    return <section className="site-container py-16" role="status">Checking your session...</section>;
  }
  if (session.isError) {
    return (
      <section className="site-container py-16">
        <p className="type-body text-[var(--color-danger)]" role="alert">
          Your session could not be checked. Refresh the page or sign in again.
        </p>
      </section>
    );
  }
  if (!session.data || (role && session.data.role !== role)) {
    return <section className="site-container py-16" role="status">Redirecting...</section>;
  }

  return children;
}
