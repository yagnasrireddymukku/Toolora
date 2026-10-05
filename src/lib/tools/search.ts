/**
 * Search runs in the browser over a slim index (no article content), so the full tool
 * registry is never shipped to visitors. Build the index on the server with getSearchIndex().
 */
export interface SearchEntry {
  slug: string;
  category: string;
  categoryName: string;
  name: string;
  description: string;
  keywords: string[];
  path: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function scoreEntry(entry: SearchEntry, terms: string[]): number {
  const name = entry.name.toLowerCase();
  const category = entry.categoryName.toLowerCase();
  const keywords = entry.keywords.join(" ").toLowerCase();
  const description = entry.description.toLowerCase();
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
  entries: readonly SearchEntry[],
  query: string,
): SearchEntry[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .map((r) => r.entry);
}
