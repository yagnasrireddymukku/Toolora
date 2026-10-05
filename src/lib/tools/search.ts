import type { ToolDefinition } from "./types";
import { getCategory } from "./registry";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function scoreTool(tool: ToolDefinition, terms: string[]): number {
  const name = tool.name.toLowerCase();
  const category = (getCategory(tool.category)?.name ?? tool.category).toLowerCase();
  const keywords = tool.keywords.join(" ").toLowerCase();
  const description = tool.description.toLowerCase();
  let total = 0;
  for (const term of terms) {
    let s = 0;
    if (name.includes(term)) s += 10;
    if (keywords.includes(term)) s += 6;
    if (category.includes(term)) s += 3;
    if (description.includes(term)) s += 1;
    if (s === 0) return 0; // every term must match something
    total += s;
  }
  return total;
}

/** Case-insensitive, multi-term search over name, keywords, category and description. */
export function searchTools(
  tools: readonly ToolDefinition[],
  query: string,
): ToolDefinition[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  return tools
    .map((tool) => ({ tool, score: scoreTool(tool, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .map((r) => r.tool);
}
