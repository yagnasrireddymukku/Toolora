import Link from "@/components/ui/SiteLink";
import { Badge } from "@/components/ui/Badge";
import { getCategory, toolPath } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

/** Whole card is one link: a single, large touch target. */
export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const category = getCategory(tool.category);
  return (
    <Link
      href={toolPath(tool)}
      className="group rounded-card border-line shadow-card hover:border-brand-600 block h-full border bg-white p-4 transition-colors"
    >
      <Badge>{category?.name ?? tool.category}</Badge>
      <h3 className="text-ink group-hover:text-brand-700 mt-2 text-lg font-semibold">
        {tool.name}
      </h3>
      <p className="text-ink-muted mt-1 text-sm">{tool.description}</p>
    </Link>
  );
}
