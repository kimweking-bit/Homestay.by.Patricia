import type { Metadata } from "next";
import { AdminShell } from "@/components/shared/admin-shell";
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
  return <AdminShell>{children}</AdminShell>;
}
