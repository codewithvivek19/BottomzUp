import type { NextConfig } from "next";

/**
 * Exact design: vanilla HTML/CSS/JS for existing pages.
 * React only for /events and /admin.
 */
const nextConfig: NextConfig = {
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
      { source: "/events.html", destination: "/events" },
      { source: "/pages/events.html", destination: "/events" },
    ];
  },
};

export default nextConfig;
