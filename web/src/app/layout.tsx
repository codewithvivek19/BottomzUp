import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bottomz Up Bar & Grill",
    template: "%s | Bottomz Up",
  },
  description:
    "Bar & grill in South Boston, VA - burgers, wings, full bar, catering, and live events.",
};

/** Root layout is minimal — legacy HTML pages bypass this via rewrites. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
