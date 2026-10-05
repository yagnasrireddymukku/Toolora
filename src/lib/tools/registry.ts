import { CATEGORIES } from "./categories";
import type { Category, CategoryId, ToolDefinition } from "./types";
import { TOOL_DEFINITIONS } from "@/tools/definitions";

/**
 * Single source of truth for every live tool. Navigation, homepage, search,
 * sitemap, breadcrumbs and structured data are all derived from this list, so a
 * tool can never be linked without actually existing.
 */
export const TOOLS: readonly ToolDefinition[] = TOOL_DEFINITIONS;

export function toolPath(tool: Pick<ToolDefinition, "category" | "slug">): string {
  return `/tools/${tool.category}/${tool.slug}/`;
}

export function categoryPath(id: CategoryId): string {
  return `/tools/${id}/`;
}

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getTool(category: string, slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.category === category && t.slug === slug);
}

export function getToolsByCategory(id: CategoryId): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === id);
}

/** Categories that currently contain at least one live tool (empty ones are never linked). */
export function getActiveCategories(): Category[] {
  return CATEGORIES.filter((c) => getToolsByCategory(c.id).length > 0);
}

export function getPopularTools(): ToolDefinition[] {
  return TOOLS.filter((t) => t.popular);
}

export function getRecentTools(limit = 4): ToolDefinition[] {
  return [...TOOLS].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, limit);
}

export function getRelatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.related
    .map((slug) => TOOLS.find((t) => t.slug === slug))
    .filter((t): t is ToolDefinition => Boolean(t));
}
