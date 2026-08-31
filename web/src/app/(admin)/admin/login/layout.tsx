/** Keep login out of the static CDN cache (was s-maxage=1y on Hostinger). */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
