import type { Faq } from "@/lib/tools/types";

/** Native disclosure widgets: keyboard accessible, no JavaScript, and content stays crawlable. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-line rounded-card border-line divide-y border bg-white">
      {faqs.map((f) => (
        <details key={f.q} className="group p-4">
          <summary className="text-ink flex min-h-11 cursor-pointer items-center justify-between gap-3 font-semibold">
            {f.q}
            <span aria-hidden="true" className="text-brand-700 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="text-ink-soft mt-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
