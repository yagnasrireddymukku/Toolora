"use client";

import Link from "@/components/ui/SiteLink";
import { useId, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchIcon } from "@/components/ui/icons";
import { getCategory, toolPath, TOOLS } from "@/lib/tools/registry";
import { searchTools } from "@/lib/tools/search";

interface SearchPanelProps {
  autoFocus?: boolean;
  /** Called when a result is chosen (lets a parent dialog close itself). */
  onNavigate?: () => void;
}

export function SearchPanel({ autoFocus, onNavigate }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const resultsId = useId();
  const results = useMemo(() => searchTools(TOOLS, query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        Search tools
      </label>
      <div className="relative">
        <SearchIcon className="text-ink-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
        <input
          id={inputId}
          type="text"
          role="searchbox"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Search tools, e.g. CGPA, resume, JSON"
          aria-controls={resultsId}
          className="text-ink block min-h-12 w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-10 text-base placeholder:text-slate-500"
        />
      </div>
      <div id={resultsId} aria-live="polite" className="mt-3">
        {hasQuery && results.length === 0 && (
          <EmptyState title="No tools found">
            Try a different word, such as &ldquo;salary&rdquo; or &ldquo;resume&rdquo;.
          </EmptyState>
        )}
        {results.length > 0 && (
          <>
            <p className="sr-only">
              {results.length} {results.length === 1 ? "tool" : "tools"} found
            </p>
            <ul className="divide-line border-line divide-y rounded-lg border bg-white text-left">
              {results.map((tool) => (
                <li key={`${tool.category}/${tool.slug}`}>
                  <Link
                    href={toolPath(tool)}
                    onClick={onNavigate}
                    className="hover:bg-brand-50 block px-4 py-3"
                  >
                    <span className="text-ink font-semibold">{tool.name}</span>
                    <span className="text-brand-800 ml-2 text-xs font-semibold">
                      {getCategory(tool.category)?.name}
                    </span>
                    <span className="text-ink-muted mt-0.5 block text-sm">
                      {tool.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
