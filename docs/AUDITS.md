# Audits

What was checked, how, and what is **not** covered. Everything marked "automated" re-runs with `npm test` and `npm run e2e` (after `npm run build`).

## Automated

| Area           | How                                                                                                                                                                                                                                                                 | Result                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Calculations   | 139 Vitest tests (grades, percentage, attendance, salary and tax, career engine, JSON parser, QR payloads, CSV, file extraction, search, registry, hosting config). Worked examples printed on tool pages are asserted in tests.                                    | Pass                              |
| SEO            | Every URL in `sitemap.xml`: unique title and description (length-checked), canonical equals the URL, no `noindex`, one H1, `lang`, Open Graph and Twitter tags, valid JSON-LD, FAQ schema matches visible FAQs, breadcrumb matches page.                            | Pass                              |
| Links          | Every internal link on every page is requested and must return 200.                                                                                                                                                                                                 | Pass                              |
| Accessibility  | axe-core (WCAG 2.1 A and AA) on every page, the 404 page, and interactive states (search dialog, validation errors, results for SGPA/CTC/ATS/JSON error/QR). Keyboard tests: skip link, dialog focus and focus return, tab arrow keys.                              | 0 violations                      |
| Responsive     | Every page at 320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1366, 1440, 1920 px: no horizontal overflow, all buttons/inputs/selects/summaries ≥ 44 px tall. Result states re-checked at 320 px with long content.                                             | Pass                              |
| Browsers       | Functional suites on Chromium, Chrome mobile emulation (Pixel 7), Firefox, WebKit (Safari engine) and iPhone 14 emulation.                                                                                                                                          | 182 passed (42 skipped by design) |
| Security       | Production CSP applied to the e2e server (no violations while using PDF upload and QR generation); no localhost URLs or key-like strings in shipped JS; no third-party requests from tool pages; upload type/size/magic-byte checks unit-tested.                    | Pass                              |
| Performance    | Gzipped JS per page ≈ 178–180 KB (of which ≈ 134 KB is the React and Next runtime). Tool pages load only their own tool's code. The PDF engine (≈ 1.2 MB worker) loads only when a PDF is uploaded. CLS < 0.05 and LCP < 2.5 s on a 390 px viewport (local server). | Pass                              |
| QR correctness | Generated QR images are decoded with an independent reader (jsQR) and compared with the expected payload.                                                                                                                                                           | Pass                              |

## Not covered (be aware)

- **Real devices and real Safari/Edge.** WebKit and Chromium engines were tested, but Microsoft Edge itself and physical iOS/Android devices were not.
- **Screen readers.** axe and keyboard tests catch many issues, but no manual NVDA/VoiceOver pass was done.
- **Lighthouse / field data.** Performance numbers above are local proxies. After deployment, run PageSpeed Insights and check Search Console's Core Web Vitals report.
- **Structured-data validation by Google.** The JSON-LD is schema-conformant by inspection and tests; run Google's Rich Results Test after deployment.
- **Hostinger-specific behaviour.** `.htaccess` was reviewed against standard Apache directives and its CSP is tested, but the file itself was not run on a Hostinger server. Verify headers and redirects after upload (see DEPLOYMENT.md).
- **Tax figures.** Verified in October 2026 against official documents: the Income Tax Department page for AY 2026-27 (slabs, 87A rebate), the Finance Bill 2026 explanatory memorandum (tax-year 2026-27 slabs under section 202, "no change proposed in tax rates", 4% cess), and the PIB Budget 2025-26 release (₹75,000 standard deduction). The Budget 2026-27 speech and memorandum propose no change to the rebate or standard deduction, but no FY 2026-27 official document that was read restates them. Slabs, deduction, rebate limit and cess are pinned by tests. Surcharge above ₹50 lakh and the old regime are not modelled. Review after each Budget.
- **Skills dictionary.** The ATS tools recognise ≈ 150 common skills. Niche skills appear only as repeated keywords.

## Findings fixed during the audits

- Search dialog did not focus its input (native `<dialog>` focuses the first control). Fixed.
- Collapsible "Grade point mapping" row was 32 px tall. Raised to 44 px.
- Homepage meta description was 195 characters. Shortened to 162.
- Next's link-prefetch requests returned 404 on plain file hosting. Prefetching disabled.
- Every tool page shipped every tool's JavaScript (132 KB raw). Split per tool.
- Client components imported the whole tool registry. Replaced with a slim search index.
- Typing into a form before hydration could be lost on slow devices. Tests now wait for a hydration marker. Real visitors on very slow connections may still notice this briefly.

## Dependency audit

`npm audit --omit=dev` (everything that ships to visitors): 0 vulnerabilities. `npm audit` (all) reports 5 high-severity findings in the ESLint toolchain (`eslint-config-next` → `braces`, a regex stack-exhaustion issue). It is dev-only, runs on the developer machine and is never part of `out/`. The suggested fix downgrades to an old Next config, so it is deliberately not applied; re-check when `eslint-config-next` publishes an update.
