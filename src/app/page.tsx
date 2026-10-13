import type { Metadata } from "next";
import Link from "@/components/ui/SiteLink";
import { JsonLd } from "@/components/layout/JsonLd";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { CategoryIcon } from "@/components/layout/CategoryIcon";
import { ToolCard } from "@/components/layout/ToolCard";
import { BoltIcon, LockIcon, SparkIcon } from "@/components/ui/icons";
import { categoryStyle } from "@/lib/tools/categoryStyle";
import { FaqList } from "@/components/tool/FaqList";
import { buildMetadata, organizationJsonLd, websiteJsonLd, faqJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import {
  categoryPath,
  getActiveCategories,
  getPopularTools,
  getRecentTools,
  getSearchIndex,
  getTool,
  getToolsByCategory,
  toolPath,
} from "@/lib/tools/registry";
import type { Faq } from "@/lib/tools/types";

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${SITE_NAME}: ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: {
    absolute: `${SITE_NAME}: Free Online Tools for Study, Work and Everyday Tasks`,
  },
};

const HOME_FAQS: Faq[] = [
  {
    q: "Are Toolora tools really free?",
    a: "Yes. Every tool is free to use with no account, no sign-up and no usage limits.",
  },
  {
    q: "Is my data private?",
    a: "The tools run in your browser, so what you type (marks, salary figures, resumes, JSON, QR content) is processed on your device and is not uploaded to a Toolora server.",
  },
  {
    q: "Are the results accurate?",
    a: "Calculators use standard, documented formulas that are shown on each tool page. Tools that depend on institution or employer rules, such as grading scales or salary structures, let you configure those rules and state their assumptions. Always confirm important figures with your university or employer.",
  },
  {
    q: "Does the ATS resume checker use a real company's ATS?",
    a: "No. Applicant tracking systems are proprietary. The checker gives an estimated analysis based on keyword overlap and common formatting guidance, and is labelled as an estimate.",
  },
];

/** Shortcuts under the search box. Entries whose tool does not exist are skipped. */
const QUICK_LINKS = [
  { category: "education", slug: "cgpa-calculator", label: "CGPA calculator" },
  { category: "career", slug: "ats-resume-checker", label: "Resume checker" },
  { category: "salary", slug: "ctc-to-inhand-calculator", label: "In-hand salary" },
  { category: "developer", slug: "json-formatter", label: "JSON formatter" },
  { category: "utility", slug: "qr-code-generator", label: "QR code" },
];

/** Look at every tool when choosing "Recently added", then drop the ones already popular. */
const TOOL_LIMIT = 100;

export default function HomePage() {
  const categories = getActiveCategories();
  const popular = getPopularTools();
  // Never repeat cards already shown under "Popular tools".
  const popularSlugs = new Set(popular.map((t) => t.slug));
  const recent = getRecentTools(TOOL_LIMIT)
    .filter((t) => !popularSlugs.has(t.slug))
    .slice(0, 4);

  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd(), faqJsonLd(HOME_FAQS)]} />

      <section className="hero-bg border-line relative overflow-hidden border-b">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-20">
          <p className="text-brand-900 border-brand-200 mx-auto inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-sm font-semibold">
            <SparkIcon className="size-4" />
            Free · Private · No sign-up
          </p>
          <h1 className="text-ink mt-5 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Free online tools for <span className="text-brand-700">study, work</span> and
            everyday tasks
          </h1>
          <p className="text-ink-soft mx-auto mt-5 max-w-2xl text-lg">
            Calculate your CGPA, check your resume, work out your take-home pay or format
            JSON. Simple tools that run in your browser, with no sign-up.
          </p>
          <div className="mx-auto mt-8 max-w-xl text-left">
            <SearchPanel index={getSearchIndex()} />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-ink-muted text-sm">Popular:</span>
            {QUICK_LINKS.map((q) => {
              const tool = getTool(q.category, q.slug);
              if (!tool) return null;
              return (
                <Link
                  key={tool.slug}
                  href={toolPath(tool)}
                  className="text-ink-soft hover:border-brand-600 hover:text-brand-700 inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium transition-colors"
                >
                  {q.label}
                </Link>
              );
            })}
          </div>
          <ul className="text-ink-soft mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <li className="flex items-center justify-center gap-2">
              <BoltIcon className="text-brand-700 size-5" />
              <span>
                <strong className="text-ink">{getSearchIndex().length}</strong> free tools
              </span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <LockIcon className="text-brand-700 size-5" />
              <span>Runs in your browser</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <SparkIcon className="text-brand-700 size-5" />
              <span>No account needed</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 pt-12">
        <section id="popular" aria-labelledby="popular-h" className="scroll-mt-20">
          <h2 id="popular-h" className="section-title text-2xl font-bold">
            Popular tools
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((t) => (
              <li key={t.slug}>
                <ToolCard tool={t} />
              </li>
            ))}
          </ul>
        </section>

        <section id="categories" aria-labelledby="cat-h" className="scroll-mt-20">
          <h2 id="cat-h" className="section-title text-2xl font-bold">
            Browse by category
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={categoryPath(c.id)}
                  className="group card-lift rounded-card border-line shadow-card hover:border-brand-600 relative block h-full overflow-hidden border bg-white p-5"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 ${categoryStyle(c.id).bar}`}
                  />
                  <CategoryIcon id={c.id} size="lg" />
                  <span className="mt-3 block text-lg font-semibold">{c.name}</span>
                  <span className="text-ink-muted mt-1 block text-sm">
                    {c.description}
                  </span>
                  <span className="text-brand-700 mt-3 block text-sm font-semibold">
                    {getToolsByCategory(c.id).length}{" "}
                    {getToolsByCategory(c.id).length === 1 ? "tool" : "tools"} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {recent.length > 0 && (
          <section aria-labelledby="recent-h">
            <h2 id="recent-h" className="section-title text-2xl font-bold">
              Recently added
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((t) => (
                <li key={t.slug}>
                  <ToolCard tool={t} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="why-h">
          <h2 id="why-h" className="section-title text-2xl font-bold">
            Why {SITE_NAME}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            <li className="rounded-card border-line border p-4">
              <h3 className="font-semibold">Private by design</h3>
              <p className="text-ink-muted mt-1 text-sm">
                Tools run in your browser. Your marks, salary and resume are not uploaded
                to us.
              </p>
            </li>
            <li className="rounded-card border-line border p-4">
              <h3 className="font-semibold">Transparent results</h3>
              <p className="text-ink-muted mt-1 text-sm">
                Every calculator shows its formula, a worked example and its assumptions.
              </p>
            </li>
            <li className="rounded-card border-line border p-4">
              <h3 className="font-semibold">Fast and simple</h3>
              <p className="text-ink-muted mt-1 text-sm">
                Lightweight pages that work on any phone, tablet or computer. No sign-up.
              </p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="faq-h" className="max-w-3xl">
          <h2 id="faq-h" className="section-title mb-4 text-2xl font-bold">
            Frequently asked questions
          </h2>
          <FaqList faqs={HOME_FAQS} />
        </section>
      </div>
    </>
  );
}
