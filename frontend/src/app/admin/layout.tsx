import type { Metadata } from "next";
import { AdminShell } from "@/components/shared/admin-shell";
import { SessionGate } from "@/components/shared/session-gate";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: "Operations",
    template: `%s | ${brand.name} Operations`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGate role="ADMIN">
      <AdminShell>{children}</AdminShell>
    </SessionGate>
  );
}
