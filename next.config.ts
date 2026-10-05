import type { NextConfig } from "next";

// Static export: every tool runs in the browser, so the site is plain HTML/CSS/JS
// that any Hostinger plan can serve (no Node process required).
// Security headers for static hosting live in public/.htaccess.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
