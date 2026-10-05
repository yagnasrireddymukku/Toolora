import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="bg-surface rounded-lg border border-dashed border-slate-300 p-6 text-center">
      <p className="text-ink font-semibold">{title}</p>
      {children && <div className="text-ink-muted mt-1 text-sm">{children}</div>}
    </div>
  );
}
