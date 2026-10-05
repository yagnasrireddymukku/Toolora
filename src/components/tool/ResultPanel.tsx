import type { ReactNode } from "react";

interface ResultPanelProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}

/** Container for calculator results. aria-live so updates are announced to screen readers. */
export function ResultPanel({ title = "Result", children, actions }: ResultPanelProps) {
  return (
    <section
      aria-live="polite"
      aria-label={title}
      className="rounded-card border-brand-200 bg-brand-50 border p-4 sm:p-6"
    >
      <h2 className="text-brand-900 text-lg font-bold">{title}</h2>
      <div className="mt-3">{children}</div>
      {actions && <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>}
    </section>
  );
}

export function BigNumber({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ink-muted text-sm font-medium">{label}</p>
      <p className="text-brand-900 text-3xl font-bold break-words sm:text-4xl">{value}</p>
    </div>
  );
}

export function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-white p-3">
          <dt className="text-ink-muted text-sm">{item.label}</dt>
          <dd className="text-ink text-lg font-semibold break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
