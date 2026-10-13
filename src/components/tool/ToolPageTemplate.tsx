import type { ReactNode } from "react";
import Link from "@/components/ui/SiteLink";
import { AdSlot } from "@/components/layout/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/layout/JsonLd";
import { ToolCard } from "@/components/layout/ToolCard";
import { FaqList } from "@/components/tool/FaqList";
import { breadcrumbJsonLd, faqJsonLd, toolCrumbs, webApplicationJsonLd } from "@/lib/seo";
import { categoryStyle } from "@/lib/tools/categoryStyle";
import { categoryPath, getCategory, getRelatedTools } from "@/lib/tools/registry";
import { CategoryIcon } from "@/components/layout/CategoryIcon";
import type { ToolDefinition } from "@/lib/tools/types";

/** Categories whose results are estimates. Exact tools (JSON, QR) do not get the estimate notice. */
const ESTIMATE_CATEGORIES = new Set<string>(["education", "career", "salary"]);

/**
 * Reusable tool page: breadcrumbs, H1, description, interactive tool (children),
 * then how it works, formula, example, tips, limitations, FAQ and related tools.
 */
export function ToolPageTemplate({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children: ReactNode;
}) {
  const crumbs = toolCrumbs(tool);
  const related = getRelatedTools(tool);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          webApplicationJsonLd(tool),
          faqJsonLd(tool.faqs),
        ]}
      />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mt-4 flex items-center gap-3">
        <CategoryIcon id={tool.category} size="lg" />
        <Link
          href={categoryPath(tool.category)}
          className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${categoryStyle(tool.category).chip}`}
        >
          {getCategory(tool.category)?.name ?? tool.category}
        </Link>
      </div>
      <h1 className="mt-4 text-3xl leading-tight font-bold sm:text-4xl">{tool.h1}</h1>
      <p className="text-ink-soft mt-3 max-w-3xl text-lg">{tool.intro}</p>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm font-medium">
        {["Free to use", "No sign-up", "Runs in your browser"].map((t) => (
          <li
            key={t}
            className="text-brand-900 border-brand-200 bg-brand-50 rounded-full border px-3 py-1"
          >
            <span aria-hidden="true">✓ </span>
            {t}
          </li>
        ))}
      </ul>

      <section aria-label={`${tool.name} tool`} className="mt-8">
        {children}
      </section>

      <AdSlot />

      <div className="prose-toolora mt-12">
        <h2>How it works</h2>
        <ol>
          {tool.howItWorks.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        {tool.formula && (
          <>
            <h2>{tool.formula.title}</h2>
            {tool.formula.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </>
        )}

        <h2>{tool.example.title}</h2>
        {tool.example.body.map((p) => (
          <p key={p}>{p}</p>
        ))}

        <h2>Tips</h2>
        <ul>
          {tool.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        {tool.limitations && tool.limitations.length > 0 && (
          <>
            <h2>Limitations and assumptions</h2>
            <ul>
              {tool.limitations.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <section aria-labelledby="faq-h" className="mt-12">
        <h2 id="faq-h" className="mb-4 text-2xl font-bold">
          Frequently asked questions
        </h2>
        <FaqList faqs={tool.faqs} />
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="mt-12">
          <h2 id="related-h" className="mb-4 text-2xl font-bold">
            Related tools
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {related.map((t) => (
              <li key={t.slug}>
                <ToolCard tool={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {ESTIMATE_CATEGORIES.has(tool.category) && (
        <p className="text-ink-muted mt-10 text-sm">
          Results are estimates for general guidance. See our{" "}
          <Link href="/disclaimer/" className="underline">
            disclaimer
          </Link>
          .
        </p>
      )}
    </div>
  );
}
