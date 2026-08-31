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
export const revalidate = 0;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Avoid raw <link> tags in the RSC tree (can break Hostinger/Next production renders).
  // Fonts + admin styles come from imported CSS above + AdminShell.
  return <AdminShell>{children}</AdminShell>;
}
