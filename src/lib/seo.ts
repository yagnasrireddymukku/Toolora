import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, absoluteUrl, GSC_VERIFICATION } from "./site";
import type { Faq, ToolDefinition } from "./tools/types";
import { categoryPath, getCategory, toolPath } from "./tools/registry";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
}

/** Unique title/description/canonical + Open Graph + Twitter for any page. */
export function buildMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en",
    },
    twitter: { card: "summary", title, description },
  };
}

export function toolMetadata(tool: ToolDefinition): Metadata {
  // The root layout's title template appends "| Toolora".
  return buildMetadata({
    title: tool.h1,
    description: tool.description,
    path: toolPath(tool),
  });
}

export function rootVerification(): Metadata["verification"] | undefined {
  return GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined;
}

export const DEFAULT_DESCRIPTION = SITE_DESCRIPTION;

type JsonLd = Record<string, unknown>;

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function toolCrumbs(tool: ToolDefinition): Crumb[] {
  const category = getCategory(tool.category);
  return [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools/" },
    { name: category?.name ?? tool.category, path: categoryPath(tool.category) },
    { name: tool.name, path: toolPath(tool) },
  ];
}

export function faqJsonLd(faqs: Faq[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function webApplicationJsonLd(tool: ToolDefinition): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: absoluteUrl(toolPath(tool)),
    description: tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

/** Serialises JSON-LD safely for inline <script> (prevents `</script>` injection). */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
