export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" className="text-ink-muted inline-flex items-center gap-2 text-sm">
      <span
        aria-hidden="true"
        className="border-t-brand-700 inline-block size-4 animate-spin rounded-full border-2 border-slate-300"
      />
      {label}…
    </span>
  );
}
