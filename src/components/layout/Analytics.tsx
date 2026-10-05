import Script from "next/script";
import { GA_ID } from "@/lib/site";

/**
 * Google Analytics 4, loaded only when NEXT_PUBLIC_GA_ID is set. Loaded
 * afterInteractive and async, so a blocked script never affects the page.
 * IP anonymisation is on by default in GA4; no tool input is ever sent.
 */
export function Analytics() {
  if (!/^G-[A-Z0-9]+$/.test(GA_ID)) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
