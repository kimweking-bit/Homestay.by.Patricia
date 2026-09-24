import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@tanstack/react-query"],
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
    // Prefer auto quality via Cloudinary loader; keep a single numeric
    // quality for any caller that still passes a number to next/image.
    qualities: [75],
    // Measured: default deviceSizes caused ~118–218KB wasted on mobile cards
    // (w_750 for tiles displayed ~half viewport). Keep retina-capable heroes
    // without 3x–4x desktop masters on mobile lists.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
