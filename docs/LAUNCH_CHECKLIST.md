# Launch checklist

Tick these off in order. "Automated" items are covered by `npm run check` and `npm run e2e` (run `npm run build` first); the rest need you.

## Local checks

- [ ] `npm install` (or `npm ci`)
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test` (unit and component tests)
- [ ] `npm run build:prod` with your real domain set (see Deployment). Includes the production export and the pre-upload verification
- [ ] `npm run e2e` (after the build; needs `npx playwright install` once)
- [ ] `npx prettier --check .`
- [ ] `git status` is clean and `.env.production.local` is **not** tracked

## SEO (automated in `e2e/audit.spec.ts` and `e2e/launch.spec.ts`)

- [ ] Unique titles and descriptions
- [ ] Canonical URLs equal the real domain
- [ ] `sitemap.xml` has only canonical https URLs, no duplicates, no placeholder domain
- [ ] `robots.txt` allows the site and points at the sitemap on the same domain
- [ ] Structured data valid and matches visible content
- [ ] Open Graph and Twitter metadata complete (no `og:image` is set, so none can be broken)
- [ ] Internal links all resolve

## Accessibility (automated, plus manual)

- [ ] axe WCAG 2.1 A/AA: 0 violations
- [ ] Keyboard: skip link, dialogs, tabs
- [ ] Forms: labels and error messages
- [ ] Mobile navigation drawer
- [ ] **Manual:** quick screen-reader spot check (NVDA on Windows or VoiceOver on iPhone/Mac): home, one calculator, one result

## Responsive (automated: no overflow, controls ≥ 44 px)

- [ ] 320 / 360 / 375 / 390 / 414 / 480 px
- [ ] 768 / 820 / 1024 px
- [ ] 1280 / 1366 / 1440 / 1920 px

## Deployment

- [ ] `.env.production.local` has the real `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL`
- [ ] `npm run build:prod` passes ("Build verification passed")
- [ ] `out/` contains `index.html`, `404.html`, `sitemap.xml`, `robots.txt`, `.htaccess`
- [ ] Contents of `out/` uploaded directly into `public_html` (not inside an `out` folder), hidden `.htaccess` included
- [ ] Domain points to the hosting
- [ ] SSL installed and HTTPS forced
- [ ] `www` / non-`www` choice made in `.htaccess` and matches `NEXT_PUBLIC_SITE_URL`
- [ ] `http://` redirects to `https://`
- [ ] A made-up URL shows the Toolora 404 page
- [ ] `/sitemap.xml` and `/robots.txt` load on the real domain
- [ ] `curl -I https://yourdomain/` shows `content-security-policy` and `strict-transport-security`
- [ ] Contact page shows the form (not "address not configured") and opens your email app
- [ ] Upload a small PDF to the ATS checker on the live site (confirms `.mjs` is served correctly)

## Post-launch

- [ ] Google Search Console property verified
- [ ] `sitemap.xml` submitted
- [ ] URL Inspection on the homepage and one tool page
- [ ] PageSpeed Insights (mobile) on the homepage and two tool pages
- [ ] Rich Results Test on one tool page (FAQ and breadcrumb)
- [ ] Test on a real phone (iPhone Safari and Android Chrome)
- [ ] Test in Microsoft Edge (not run in automated tests; the Chromium engine is covered)
- [ ] Re-check the tax slabs in `src/lib/calculators/tax-config.ts` after each Budget
- [ ] Before enabling analytics or ads: add a consent banner if you serve EU/UK visitors, then update the Privacy Policy
