import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import { SiteFrame } from "@/components/layout/site-frame";
import { brand } from "@/lib/brand";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${brand.name} | ${brand.tagline.replace(/\.$/, "")}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  openGraph: {
    title: `${brand.name} | ${brand.tagline.replace(/\.$/, "")}`,
    description: brand.description,
    locale: "en_MY",
    type: "website",
    siteName: brand.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable}`}>
        <Providers>
          <SiteFrame>{children}</SiteFrame>
        </Providers>
      </body>
    </html>
  );
}
