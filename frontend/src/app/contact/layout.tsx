import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Patricia",
  description:
    "Email Patricia at Sutera Stays about dates, guest details, or a stay request.",
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
