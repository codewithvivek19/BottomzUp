import type { NextConfig } from "next";

/**
 * Architecture:
 * - Vanilla HTML in /public/legacy for most marketing pages (rewritten).
 * - React App Router ONLY for /events (public calendar) and /admin/*.
 *
 * Events source of truth: web/src/app/(app)/events/page.tsx
 * Legacy static Events HTML under public/legacy is redirect stubs only.
 * Do not reintroduce a second calendar implementation.
 */
const nextConfig: NextConfig = {
  async redirects() {
    // Redirects run before public/ files, so stubs cannot win.
    return [
      { source: "/events.html", destination: "/events", permanent: true },
      { source: "/pages/events.html", destination: "/events", permanent: true },
      { source: "/legacy/events.html", destination: "/events", permanent: true },
      { source: "/legacy/events", destination: "/events", permanent: true },
      { source: "/legacy/events/", destination: "/events", permanent: true },
      { source: "/legacy/pages/events.html", destination: "/events", permanent: true },
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
      // Legacy HTML uses ./css ./js (→ /css /js). Files live under /legacy/*.
      // Symlinks in public/ cover static serving; these rewrites are the fallback.
      { source: "/css/:path*", destination: "/legacy/css/:path*" },
      { source: "/js/:path*", destination: "/legacy/js/:path*" },
      { source: "/assets/:path*", destination: "/legacy/assets/:path*" },
      { source: "/pages/:path*", destination: "/legacy/pages/:path*" },
      // Normalize trailing slash to the App Router page (no second calendar).
      { source: "/events/", destination: "/events" },
    ];
  },
};

export default nextConfig;
