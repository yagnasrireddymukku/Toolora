import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@/components/layout/Analytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HydrationMarker } from "@/components/layout/HydrationMarker";
import { rootVerification } from "@/lib/seo";
import { getNavCategories, getSearchIndex } from "@/lib/tools/registry";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  verification: rootVerification(),
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header categories={getNavCategories()} searchIndex={getSearchIndex()} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
        <HydrationMarker />
      </body>
    </html>
  );
}
