import type { Metadata } from "next";
import Link from "@/components/ui/SiteLink";
import { JsonLd } from "@/components/layout/JsonLd";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { ToolCard } from "@/components/layout/ToolCard";
import { FaqList } from "@/components/tool/FaqList";
import { buildMetadata, organizationJsonLd, websiteJsonLd, faqJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import {
  categoryPath,
  getActiveCategories,
  getPopularTools,
  getRecentTools,
  getToolsByCategory,
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

export default function HomePage() {
  const categories = getActiveCategories();
  const popular = getPopularTools();
  const recent = getRecentTools(4);

  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd(), faqJsonLd(HOME_FAQS)]} />

      <section className="border-line bg-brand-50 border-b">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
          <h1 className="text-ink text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
            Free online tools for study, work and everyday tasks
          </h1>
          <p className="text-ink-soft mx-auto mt-4 max-w-2xl text-lg">
            Calculate your CGPA, check your resume, work out your take-home pay or format
            JSON. Simple tools that run in your browser, with no sign-up.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchPanel />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 pt-12">
        <section id="popular" aria-labelledby="popular-h" className="scroll-mt-20">
          <h2 id="popular-h" className="text-2xl font-bold">
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
          <h2 id="cat-h" className="text-2xl font-bold">
            Browse by category
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={categoryPath(c.id)}
                  className="rounded-card border-line shadow-card hover:border-brand-600 block h-full border bg-white p-4"
                >
                  <span className="text-lg font-semibold">{c.name}</span>
                  <span className="text-ink-muted mt-1 block text-sm">
                    {c.description}
                  </span>
                  <span className="text-brand-700 mt-2 block text-sm font-medium">
                    {getToolsByCategory(c.id).length} tools
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="recent-h">
          <h2 id="recent-h" className="text-2xl font-bold">
            Recently added
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((t) => (
              <li key={t.slug}>
                <ToolCard tool={t} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="why-h">
          <h2 id="why-h" className="text-2xl font-bold">
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
          <h2 id="faq-h" className="mb-4 text-2xl font-bold">
            Frequently asked questions
          </h2>
          <FaqList faqs={HOME_FAQS} />
        </section>
      </div>
    </>
  );
}
