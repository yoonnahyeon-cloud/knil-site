import type { NextConfig } from "next";

// Static export: the brand site ships as plain HTML/CSS/JS.
// When the KNIL service (auth, link pages) is added, drop `output: "export"`
// and deploy as a regular Next.js app.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Set when hosted under a sub-path, e.g. GitHub Pages at /knil-site.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  assetPrefix: process.env.RELATIVE_ASSETS ? "." : undefined,
};

export default nextConfig;
