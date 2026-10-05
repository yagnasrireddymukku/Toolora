# Toolora

**Useful tools. One simple place.**

Toolora is a fast, SEO-first collection of free online tools for students, job seekers, professionals and developers. Every tool runs in the visitor's browser: nothing they type is uploaded.

The site is a **static export** of a Next.js app, so it runs on any Hostinger plan (including shared hosting) with no Node.js process, database or paid service.

## Tools (v1)

| Category  | Tool                                                                                  |
| --------- | ------------------------------------------------------------------------------------- |
| Education | CGPA calculator, SGPA calculator, percentage calculator, attendance calculator        |
| Career    | ATS resume checker (paste, PDF, DOCX, TXT), job description analyzer, keyword matcher |
| Salary    | CTC to in-hand salary calculator, salary hike calculator                              |
| Developer | JSON formatter / validator                                                            |
| Utility   | QR code generator (URL, text, email, phone, Wi-Fi)                                    |

PDF and Image categories exist in the data model but are hidden until they contain a tool. The Blog is not built yet (see [Not included](#not-included-yet)).

## Quick start

Requires Node.js 20.19+ (developed on 24) and npm.

```bash
npm install
cp .env.example .env.local     # set NEXT_PUBLIC_SITE_URL at minimum
npm run dev                    # http://localhost:3000
```

## Scripts

| Command                | What it does                                                    |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Development server                                              |
| `npm run build`        | Production static export into `out/`                            |
| `npm run build:prod`   | Build, then verify `out/` is safe to upload                     |
| `npm run verify:build` | Verify an existing `out/` (placeholder domain, robots, 404 …)   |
| `npm run lint`         | ESLint                                                          |
| `npm run typecheck`    | TypeScript (strict)                                             |
| `npm test`             | Vitest unit and component tests                                 |
| `npm run e2e`          | Playwright end-to-end and audit suites against the built `out/` |
| `npm run check`        | lint + typecheck + unit tests + build                           |
| `npm run format`       | Prettier                                                        |

First time running e2e: `npx playwright install` (downloads Chromium, Firefox, WebKit). Run `npm run build` before `npm run e2e`; the tests serve the real export with the production security headers.

## Environment variables

All values are optional except the site URL, and all are **public** (embedded in the static build). Changing one requires rebuilding. Never put secrets in `NEXT_PUBLIC_*` variables.

| Variable                       | Purpose                                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Canonical origin, e.g. `https://www.yourdomain.com` (no trailing slash). Drives canonical URLs, sitemap, Open Graph. |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | Address used by the Contact page. Blank shows a "not configured" notice.                                             |
| `NEXT_PUBLIC_GA_ID`            | GA4 measurement ID (`G-…`). Blank = analytics off.                                                                   |
| `NEXT_PUBLIC_ADSENSE_CLIENT`   | AdSense publisher ID. Blank = no ad containers rendered.                                                             |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Search Console HTML-tag verification token.                                                                          |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): structure, decisions, how to add a tool, SEO and testing approach
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): Hostinger deployment, domain, SSL, Search Console, analytics
- [docs/AUDITS.md](docs/AUDITS.md): what was audited, how, results and known limitations

## Not included yet

Documented rather than faked:

- **Blog** (no posts yet, so no thin pages).
- **PDF and Image tools**, **AI features**, **accounts and database**: the architecture has room for them (see ARCHITECTURE.md) but nothing is built.
- **Cookie-consent banner**: required before enabling GA or AdSense for EU/UK visitors (see DEPLOYMENT.md).
- **Old tax regime** in the CTC calculator (manual tax entry covers it).
