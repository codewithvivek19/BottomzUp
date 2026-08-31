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
      <link rel="stylesheet" href="/legacy/css/base.css?v=34" />
      <link rel="stylesheet" href="/legacy/css/home.css?v=34" />
      <link rel="stylesheet" href="/legacy/css/nav.css?v=34" />
      <link rel="stylesheet" href="/legacy/css/extras.css?v=34" />
      <link rel="stylesheet" href="/legacy/css/atmosphere.css?v=34" />
      <link rel="stylesheet" href="/legacy/css/footer-impact.css?v=34" />
      <link rel="stylesheet" href="/legacy/css/sizzle.css?v=34" />
      <link rel="stylesheet" href="/legacy/css/site-polish.css?v=34" />
      <link rel="stylesheet" href="/legacy/css/forms-lead.css?v=34" />
      <LegacyChrome>{children}</LegacyChrome>
    </>
  );
}
