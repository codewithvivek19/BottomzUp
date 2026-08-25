import type { NextConfig } from "next";

/**
 * Exact design: vanilla HTML/CSS/JS for existing pages.
 * React only for /events and /admin.
 *
 * Events routing rule: every legacy/static Events URL must land on the
 * React calendar. Use redirects (run before public/) so the Antigravity
 * static clone in public/legacy cannot win.
 */
const nextConfig: NextConfig = {
  async redirects() {
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
      { source: "/events/", destination: "/events" },
    ];
  },
};

export default nextConfig;
