export const SITE_NAME = "Toolora";
export const SITE_TAGLINE = "Useful tools. One simple place.";
export const SITE_DESCRIPTION =
  "Free online tools for study, work and everyday tasks: CGPA and SGPA calculators, ATS resume checker, salary calculators, JSON formatter, QR code generator and more. Private by design, no sign-up.";

const FALLBACK_URL = "https://www.example.com";

/** Public origin without trailing slash, configured via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL).replace(
  /\/+$/,
  "",
);

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "";

/** Absolute URL for a site path. Paths always end with a slash (trailingSlash export). */
export function absoluteUrl(path: string): string {
  const clean = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return `${SITE_URL}${clean}`;
}
