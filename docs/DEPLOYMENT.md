# Deploying to Hostinger

Toolora builds to plain static files. You build on your computer (or CI), then upload the contents of `out/`. Menu names in hPanel change occasionally, so treat the paths below as a guide and check Hostinger's current help pages if something differs.

**Requirements on Hostinger:** any web hosting plan that serves static files over Apache or LiteSpeed (both read `.htaccess`). No Node.js, database or Docker needed.

## 1. Configure and build

```bash
npm ci
# Create .env.production.local (never commit it):
#   NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
#   NEXT_PUBLIC_CONTACT_EMAIL=you@yourdomain.com
npm run build:prod
```

`build:prod` builds and then runs `scripts/verify-build.mjs`, which **fails** if the sitemap or canonical URLs still use the placeholder domain, `robots.txt`/404/`.htaccess` are missing, or an `.env` file would be uploaded. Environment values are baked in at build time: rebuild after changing them.

## 2. Upload

1. hPanel → **Websites** → your site → **File Manager** (or use FTP/SFTP).
2. Open `public_html` and remove any default placeholder page.
3. Upload the **contents** of `out/` (not the folder itself) into `public_html`, so `index.html` and `.htaccess` sit directly in it. Easiest: zip the contents of `out/`, upload the zip, then **Extract**.
4. Make sure the hidden file `.htaccess` is present (File Manager → Settings → "Show hidden files").

To update later, rebuild and re-upload (overwrite). Hashed files in `_next/static` are cached for a year, so old ones can be deleted after a few days.

## 3. Domain and SSL

1. hPanel → **Domains**: point your domain at the hosting (change nameservers to Hostinger's, or add an `A` record for `@` to your server IP and a `CNAME` for `www`). DNS can take from minutes to 24 h.
2. hPanel → **Security → SSL**: install the free SSL certificate and enable **Force HTTPS**.
3. Decide on `www` vs non-`www`. Uncomment the matching block in `.htaccess`, replace `example.com`, and make `NEXT_PUBLIC_SITE_URL` use the same host. Rebuild if you changed it.
4. Verify: `http://yourdomain.com` redirects to `https://…`, `/tools/education/cgpa-calculator/` loads, a bad URL shows the Toolora 404 page, and `https://yourdomain.com/sitemap.xml` and `/robots.txt` load.

Check headers with `curl -I https://www.yourdomain.com/` (look for `content-security-policy`, `strict-transport-security`). If your plan strips them, the site still works; they are defence in depth.

## 4. Google Search Console

1. Add a **Domain** property and verify with the DNS `TXT` record Google gives you (preferred, no rebuild). Alternatively use a **URL-prefix** property and the HTML-tag method: put the token (the `content` value only) in `NEXT_PUBLIC_GSC_VERIFICATION`, rebuild and re-upload.
2. **Sitemaps** → submit `https://www.yourdomain.com/sitemap.xml`.
3. Use **URL Inspection** on the homepage and a tool page to confirm they are indexable ("Crawled / URL is on Google" may take days).

## 5. Analytics (optional)

1. Create a GA4 property and copy the measurement ID (`G-XXXXXXXXXX`).
2. Set `NEXT_PUBLIC_GA_ID`, rebuild, re-upload. The script loads after the page is interactive and the site works if it is blocked. No tool input is ever sent.
3. **Consent:** Toolora does not ship a cookie-consent banner. If you serve visitors in the EU/UK (or other regions requiring consent), add a consent mechanism before enabling GA or AdSense, and keep the Privacy Policy accurate.

## 6. AdSense (later)

Ads are off. When your site is approved: set `NEXT_PUBLIC_ADSENSE_CLIENT`, add the AdSense script and slot IDs in `src/components/layout/AdSlot.tsx`, and add a consent solution first. Do not place ads above the tool.

## Redirects and canonical URLs

- Every page's canonical URL, the sitemap, Open Graph URLs, structured data and `robots.txt` are all built from `NEXT_PUBLIC_SITE_URL`, so they always agree. Use the exact address visitors reach (including `www` or not).
- `.htaccess` redirects `http://` to `https://`. Choose one host form (www or non-www) and uncomment the matching block so the other form redirects to it, otherwise search engines may see duplicate sites.
- URLs end in `/` (for example `/tools/education/cgpa-calculator/`). Apache redirects the no-slash form to the slash form automatically.

## Contact email

The Contact page reads `NEXT_PUBLIC_CONTACT_EMAIL` at build time. The form opens the visitor's own email app with a pre-filled message (`mailto:`); nothing is sent by the website, and the page says so. If the variable is empty, the page shows a "not configured" notice instead of a form. Use a real inbox you monitor.

## Caching

- Hashed build files in `_next/static/` are cached for one year (`immutable`). HTML pages are revalidated on each visit, so a new upload shows up immediately.
- If you use a CDN (such as Cloudflare), purge its cache after each upload and do not enable a second HTTPS redirect. If a browser shows an old version, hard-refresh (Ctrl+F5).
- `sitemap.xml` and `robots.txt` are cached for an hour.

## Adding analytics or ads later (not enabled now)

Neither is active in the current build and the Privacy Policy describes them conditionally.

- **Analytics:** set `NEXT_PUBLIC_GA_ID` and rebuild. The loader is `src/components/layout/Analytics.tsx` (already wired into the layout, off when the variable is empty).
- **Ads:** set `NEXT_PUBLIC_ADSENSE_CLIENT`, then add the AdSense script and approved slot IDs in `src/components/layout/AdSlot.tsx`. `ToolPageTemplate` already places one slot below the tool and above the explanatory content. Do not put ads between the inputs and the result.
- **Before either:** add a cookie-consent mechanism if you have EU/UK (or similar) visitors, check the CSP in `public/.htaccess` allows the hosts you use (Google hosts are already listed), and update the Privacy Policy.

## Post-deployment verification

Hostinger deployment cannot be verified from the development machine, so check these on the live site:

1. `http://yourdomain.com` redirects to `https://…` and lands on the homepage.
2. Open a tool, for example `/tools/salary/ctc-to-inhand-calculator/`, and run a calculation.
3. Open a made-up URL: the Toolora 404 page appears.
4. `/sitemap.xml` and `/robots.txt` load and show your real domain, not `example.com`.
5. View page source on the homepage: the canonical link and `og:url` use your domain.
6. Upload a small PDF in the ATS checker (confirms `.mjs` files are served correctly).
7. Run `curl -I https://yourdomain.com/` and look for the security headers. If missing, see Troubleshooting.
8. Complete the post-launch part of [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

## Troubleshooting

| Symptom                               | Fix                                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Pages 404 except the homepage         | `out/` contents were uploaded in a nested folder. `index.html` must be directly in `public_html`.                           |
| Blank page / unstyled                 | Upload was partial. Re-upload including the `_next` folder.                                                                 |
| PDF upload does nothing               | `.mjs` is served with the wrong type. Confirm `.htaccess` is present (it adds `AddType text/javascript .mjs`).              |
| Redirect loop                         | A Cloudflare/"Force HTTPS" setting conflicts with the `.htaccess` HTTPS rule. Remove one.                                   |
| Canonical points to `example.com`     | `NEXT_PUBLIC_SITE_URL` was not set at build time. Rebuild with `build:prod`.                                                |
| Contact page says "not configured"    | Set `NEXT_PUBLIC_CONTACT_EMAIL` and rebuild.                                                                                |
| Security headers missing in `curl -I` | The host may not allow `mod_headers`. The site still works. Ask Hostinger support, or set the headers in hPanel if offered. |
| Old content after re-upload           | Purge any CDN cache and hard-refresh the browser.                                                                           |
