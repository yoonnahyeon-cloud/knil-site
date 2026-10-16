import type { NextConfig } from "next";

// Preview build: a static export that runs entirely in the browser, hosted
// next to the brand site on GitHub Pages under /app. Creator pages
// (/@handle) are resolved in the browser by not-found.tsx. Once a backend is
// connected, drop `output: "export"` and deploy as a regular Next.js app.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};

export default nextConfig;
