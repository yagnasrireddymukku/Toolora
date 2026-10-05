import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/layout/JsonLd";
import { ToolCard } from "@/components/layout/ToolCard";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import {
  categoryPath,
  getActiveCategories,
  getCategory,
  getToolsByCategory,
} from "@/lib/tools/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return getActiveCategories().map((c) => ({ category: c.id }));
}

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const category = getCategory((await params).category);
  if (!category) return {};
  return buildMetadata({
    title: `${category.name} Tools`,
    description: `${category.description} Free ${category.name.toLowerCase()} tools that run privately in your browser.`,
    path: categoryPath(category.id),
  });
}

export default async function CategoryPage({ params }: Params) {
  const category = getCategory((await params).category);
  if (!category) notFound();
  const tools = getToolsByCategory(category.id);
  if (tools.length === 0) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools/" },
    { name: category.name, path: categoryPath(category.id) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{category.name} tools</h1>
      <p className="text-ink-soft mt-3 max-w-2xl text-lg">{category.description}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <li key={t.slug}>
            <ToolCard tool={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}
