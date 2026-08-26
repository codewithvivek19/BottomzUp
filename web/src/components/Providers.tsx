'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Relative /api/auth/* — works on localhost and any Vercel domain.
 * Do not pass a hardcoded base URL here.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
      {children}
    </SessionProvider>
  );
}
