# Architecture

## Decisions

| Decision                                      | Why                                                                                                                                                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 16 App Router, **`output: "export"`** | Every tool is client-side, so a static site is the simplest, cheapest and most reliable thing to host on Hostinger. No Node process, no server errors, no cold starts. |
| `trailingSlash: true`                         | Produces `/tools/x/index.html`, which Apache serves natively. Canonical URLs all end in `/`.                                                                           |
| System font stack, no images                  | Zero font requests, no layout shift, fast LCP.                                                                                                                         |
| Tailwind v4 with tokens in `globals.css`      | One design system (colours, radius, shadow, focus ring).                                                                                                               |
| All processing in the browser                 | Privacy (resumes, salaries, JSON), and no server to secure or scale.                                                                                                   |
| Contact form = `mailto:`                      | A static site has no mail server. Documented limitation.                                                                                                               |
| No database, no AI, no Docker                 | Not needed for v1. See "Future" below.                                                                                                                                 |
| Link prefetching off (`SiteLink`)             | Next's prefetch payload URLs do not map onto plain file hosting and produced 404s in the console. Navigation still works.                                              |

## Layout

```
src/
  app/                    routes: /, /tools, /tools/[category], /tools/[category]/[slug],
                          about, contact, privacy-policy, terms-of-service, disclaimer,
                          sitemap.ts, robots.ts, manifest.ts, not-found, error, global-error
  components/
    ui/                   design system: Button, Field, Alert, Card, Badge, Tabs, Modal, Spinner, EmptyState, icons, SiteLink
    layout/               Header (drawer + search dialog), Footer, Breadcrumbs, SearchPanel, ToolCard, JsonLd, AdSlot, Analytics, StaticPage
    tool/                 ToolPageTemplate, ResultPanel, ActionButtons (copy/share/download), FaqList
  lib/
    tools/                types, categories, registry (single source of truth), search
    calculators/          pure logic: grades, percentage, attendance, salary, tax-config
    career/               text analysis: skills dictionary, job profile, resume analysis, matching, scoring, file extraction
    json.ts, qr.ts, csv.ts, format.ts, browser.ts, seo.ts, site.ts, contact.ts
  tools/                  per tool group: definitions.ts (content + metadata) and components
    ToolLoader.tsx        client-side lazy map: "category/slug" -> component
public/.htaccess          Apache config for Hostinger (HTTPS, CSP, caching)
e2e/                      Playwright specs + serve.json (production headers for the test server)
scripts/verify-build.mjs  pre-upload checks
```

## The registry drives everything

`src/lib/tools/registry.ts` exposes `TOOLS`. The homepage, tools index, category pages, header/footer navigation, search index, sitemap, breadcrumbs, JSON-LD and static params are all derived from it. A tool can't be linked unless it exists, and empty categories (PDF, Image) are never linked. A unit test checks slugs are unique, every tool has a loader, related tools exist, descriptions are unique and well-sized.

Business logic is pure TypeScript in `src/lib/**` (tested without a browser). Components only handle state, validation messages and presentation.

## Adding a tool

1. Write pure logic in `src/lib/…` with unit tests.
2. Build the component in `src/tools/<group>/`. Reuse `TextField`, `SelectField`, `Button`, `ResultPanel`, `CopyButton`, `ShareButton`, `Alert`, `Tabs`. Every tool needs empty, validation, error and success states.
3. Add a `ToolDefinition` to the group's `definitions.ts`: name, H1, description (≈ 50–170 chars, unique), intro, keywords, how it works, formula, **worked example whose numbers are verified by a test**, tips, limitations, FAQs, related slugs.
4. Register the component in `src/tools/ToolLoader.tsx` (this keeps each page's JavaScript limited to its own tool).
5. Add a new group to `src/tools/definitions.ts` if needed, add an e2e test, run `npm run check` and `npm run e2e`.

The sitemap, search, nav, metadata and structured data update automatically.

## SEO

- Every page: unique `<title>` (`%s | Toolora`), description, canonical, Open Graph, Twitter card, one H1, breadcrumbs.
- JSON-LD: `WebSite` + `Organization` (home), `BreadcrumbList` (all but home), `WebApplication` and `FAQPage` (tools). FAQ schema is only emitted from FAQs that are visible on the page; an e2e test verifies this.
- `sitemap.xml`, `robots.txt` and `manifest.webmanifest` are generated at build time. The 404 page is `noindex` and excluded from the sitemap.
- Content is written per tool (formulas, examples, limitations). There are no auto-generated or thin pages.
- Search Console verification is supported through an env var.

## Security and privacy

- No backend, so no server-side attack surface. No secrets exist in the client.
- Inputs are validated (numbers, ranges, lengths). Uploaded files: 5 MB limit, extension **and** magic-byte check, DOCX zip-bomb guard, 12-page PDF limit, 60,000-character analysis limit.
- JSON-LD is serialised with `<` escaped. CSV export neutralises spreadsheet formulas. `mailto:` text has line breaks stripped.
- `public/.htaccess` sets a CSP (no `unsafe-eval`), `nosniff`, frame denial, referrer, permissions and HSTS. `e2e/serve.json` mirrors the CSP and a unit test enforces they match, so the e2e suite proves the app works under the production policy.
- Analytics and ads are off unless configured, and never receive tool input.

## Accessibility

Semantic landmarks, skip link, visible focus ring, labels and described-by for every field, `role="alert"`/`status` messages (never colour alone), native `<dialog>` for the drawer and search (focus trap, Escape, focus return), WAI-ARIA tabs with arrow keys, 44 px minimum targets, reduced-motion support. axe-core (WCAG 2.1 A/AA) runs in e2e over every page and over interactive states.

## Future

- **AI features**: add a server runtime (Hostinger Node.js plan or a separate small API), put provider keys in server-only env vars, add authentication and per-user usage limits **before** exposing any paid call, and clearly label any tool that sends text to an AI provider. Keep calls behind `src/lib/ai` (not created yet).
- **Accounts / history / premium**: introduce a database only then (not needed for calculators).
- **University grade scales**: add entries to `GRADE_SCALES` in `src/lib/calculators/grades.ts`.
- **Tax rules**: update `src/lib/calculators/tax-config.ts` each Budget.
- **Many more tools**: the search index is embedded in every page. Beyond a few hundred tools, load it from a JSON file instead.
