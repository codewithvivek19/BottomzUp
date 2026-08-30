'use client';

/** Root providers. Auth is Supabase cookie sessions — no NextAuth wrapper. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
