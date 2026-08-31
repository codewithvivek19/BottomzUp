import { AdminShell } from '@/components/admin/AdminShell';
import '@/styles/tokens.css';
import '@/styles/admin.css';
import '@/styles/datepicker.css';

/**
 * Manager surfaces only — no public LegacyChrome / marketing nav.
 * Access by URL: /admin/login (no public site link).
 * Auth: Supabase cookie sessions (see middleware + lib/admin-auth).
 */
export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/legacy/css/fonts.css" />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
