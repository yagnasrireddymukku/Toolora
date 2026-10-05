import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { toolMetadata } from "@/lib/seo";
import { getTool, TOOLS } from "@/lib/tools/registry";
import { TOOL_COMPONENTS } from "@/tools/components";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ category: t.category, slug: t.slug }));
}

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, slug } = await params;
  const tool = getTool(category, slug);
  return tool ? toolMetadata(tool) : {};
}

export default async function ToolPage({ params }: Params) {
  const { category, slug } = await params;
  const tool = getTool(category, slug);
  const Component = TOOL_COMPONENTS[`${category}/${slug}`];
  if (!tool || !Component) notFound();

  return (
    <ToolPageTemplate tool={tool}>
      <Component />
    </ToolPageTemplate>
  );
}
