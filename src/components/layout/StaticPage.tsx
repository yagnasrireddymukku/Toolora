import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

interface StaticPageProps {
  title: string;
  path: string;
  intro?: string;
  updated?: string;
  children: ReactNode;
}

/** Shared layout for About, Contact and legal pages. */
export function StaticPage({ title, path, intro, updated, children }: StaticPageProps) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: title, path },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
      {intro && <p className="text-ink-soft mt-3 text-lg">{intro}</p>}
      {updated && <p className="text-ink-muted mt-2 text-sm">Last updated: {updated}</p>}
      <div className="prose-toolora mt-6">{children}</div>
    </div>
  );
}
