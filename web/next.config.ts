import type { NextConfig } from "next";

/**
 * Architecture (Hostinger Node.js / Next standalone):
 * - Marketing pages: vanilla HTML in public/legacy, exposed as clean routes
 * - React App Router: /events (public) + /admin/*
 *
 * HTML nav must use absolute paths (/menu, /about, …). Relative "about.html"
 * breaks when the browser URL is /menu (resolves to /about.html → 404).
 *
 * CSS/JS: HTML requests /css and /js. sync-public-assets copies legacy → public.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old / broken relative targets when landing on clean routes
      { source: "/menu.html", destination: "/menu", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/catering.html", destination: "/catering", permanent: true },
      { source: "/events.html", destination: "/events", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      // Events stubs / legacy paths
      { source: "/pages/events.html", destination: "/events", permanent: true },
      { source: "/legacy/events.html", destination: "/events", permanent: true },
      { source: "/legacy/events", destination: "/events", permanent: true },
      { source: "/legacy/events/", destination: "/events", permanent: true },
      { source: "/legacy/pages/events.html", destination: "/events", permanent: true },
      // Optional: send /pages/*.html to clean URLs (except keep file available)
      { source: "/pages/menu.html", destination: "/menu", permanent: false },
      { source: "/pages/about.html", destination: "/about", permanent: false },
      { source: "/pages/contact.html", destination: "/contact", permanent: false },
      { source: "/pages/catering.html", destination: "/catering", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/", destination: "/legacy/index.html" },
      { source: "/about", destination: "/legacy/pages/about.html" },
      { source: "/about/", destination: "/legacy/pages/about.html" },
      { source: "/contact", destination: "/legacy/pages/contact.html" },
      { source: "/contact/", destination: "/legacy/pages/contact.html" },
      { source: "/menu", destination: "/legacy/pages/menu.html" },
      { source: "/menu/", destination: "/legacy/pages/menu.html" },
      { source: "/catering", destination: "/legacy/pages/catering.html" },
      { source: "/catering/", destination: "/legacy/pages/catering.html" },
      // Fallback if public/css|js copies are missing on a host
      { source: "/css/:path*", destination: "/legacy/css/:path*" },
      { source: "/js/:path*", destination: "/legacy/js/:path*" },
      { source: "/assets/:path*", destination: "/legacy/assets/:path*" },
      { source: "/events/", destination: "/events" },
    ];
  },
};

export default nextConfig;
