import Link from "@/components/ui/SiteLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { categoryStyle } from "@/lib/tools/categoryStyle";
import { getCategory, toolPath } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";
import { CategoryIcon } from "./CategoryIcon";

/** Whole card is one link: a single, large touch target. */
export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const category = getCategory(tool.category);
  const style = categoryStyle(tool.category);
  return (
    <Link
      href={toolPath(tool)}
      className="group card-lift rounded-card border-line shadow-card hover:border-brand-600 relative flex h-full flex-col overflow-hidden border bg-white p-5"
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${style.bar}`} />
      <div className="flex items-center gap-3">
        <CategoryIcon id={tool.category} />
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.chip}`}
        >
          {category?.name ?? tool.category}
        </span>
      </div>
      <h3 className="text-ink group-hover:text-brand-700 mt-3 text-lg font-semibold">
        {tool.name}
      </h3>
      <p className="text-ink-muted mt-1 flex-1 text-sm">{tool.description}</p>
      <span className="text-brand-700 mt-4 inline-flex items-center gap-1 text-sm font-semibold">
        Open tool
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
