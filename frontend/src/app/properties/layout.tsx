import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Stays",
  description: `Browse ${brand.name}'s private homes in Malaysia and request your dates directly for Patricia's review.`,
};

export default function PropertiesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
