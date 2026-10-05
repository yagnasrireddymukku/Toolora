import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { categoryPath, getActiveCategories, toolPath, TOOLS } from "@/lib/tools/registry";
import { STATIC_PAGES } from "@/lib/pages";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/tools/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...getActiveCategories().map((c) => ({
      url: absoluteUrl(categoryPath(c.id)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...TOOLS.map((t) => ({
      url: absoluteUrl(toolPath(t)),
      lastModified: new Date(t.addedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...STATIC_PAGES.map((p) => ({
      url: absoluteUrl(p.path),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
