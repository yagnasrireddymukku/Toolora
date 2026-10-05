import type { Metadata } from "next";
import Link from "@/components/ui/SiteLink";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/layout/JsonLd";
import { ToolCard } from "@/components/layout/ToolCard";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import {
  categoryPath,
  getActiveCategories,
  getToolsByCategory,
} from "@/lib/tools/registry";

export const metadata: Metadata = buildMetadata({
  title: "All Free Online Tools",
  description:
    "Browse every Toolora tool: education calculators, career and resume tools, salary calculators, developer and everyday utilities. All free and private.",
  path: "/tools/",
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools/" },
];

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
      <Breadcrumbs crumbs={CRUMBS} />
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">All tools</h1>
      <p className="text-ink-soft mt-3 max-w-2xl text-lg">
        Free tools for study, work and everyday tasks. Everything runs in your browser.
      </p>
      {getActiveCategories().map((c) => (
        <section key={c.id} aria-labelledby={`${c.id}-h`} className="mt-10">
          <h2 id={`${c.id}-h`} className="text-2xl font-bold">
            <Link
              href={categoryPath(c.id)}
              className="hover:text-brand-700 hover:underline"
            >
              {c.name}
            </Link>
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getToolsByCategory(c.id).map((t) => (
              <li key={t.slug}>
                <ToolCard tool={t} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
