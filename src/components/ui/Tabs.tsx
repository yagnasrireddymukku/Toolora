"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/** WAI-ARIA tabs with roving tabindex and arrow/Home/End keyboard support. */
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const [active, setActive] = useState(items[0].id);
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((i) => i.id === active);
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    setActive(items[next].id);
    refs.current[items[next].id]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[item.id] = el;
              }}
              role="tab"
              type="button"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              className={`min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold whitespace-nowrap ${
                selected
                  ? "bg-brand-700 text-white"
                  : "text-ink-soft border border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          className="mt-4"
        >
          {/* Panels stay mounted so each tab keeps its form state when switching. */}
          {item.content}
        </div>
      ))}
    </div>
  );
}
