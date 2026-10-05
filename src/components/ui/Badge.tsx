import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="bg-brand-100 text-brand-900 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold">
      {children}
    </span>
  );
}
