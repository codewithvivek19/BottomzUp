import { LegacyChrome } from '@/components/LegacyChrome';
import '@/styles/events.css';
import '@/styles/datepicker.css';

/**
 * React app surfaces only (events + admin).
 * Loads the SAME CSS files as the vanilla site so chrome matches exactly.
 * Do not invent a new design system here.
 */
export default function AppSurfaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/legacy/css/base.css" />
      <link rel="stylesheet" href="/legacy/css/home.css?v=15" />
      <link rel="stylesheet" href="/legacy/css/nav.css?v=4" />
      <link rel="stylesheet" href="/legacy/css/extras.css?v=5" />
      <link rel="stylesheet" href="/legacy/css/atmosphere.css?v=3" />
      <link rel="stylesheet" href="/legacy/css/footer-impact.css?v=7" />
      <link rel="stylesheet" href="/legacy/css/sizzle.css?v=2" />
      <link rel="stylesheet" href="/legacy/css/site-polish.css?v=8" />
      <link rel="stylesheet" href="/legacy/css/forms-lead.css?v=7" />
      <LegacyChrome>{children}</LegacyChrome>
    </>
  );
}
