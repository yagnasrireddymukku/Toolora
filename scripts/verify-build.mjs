// Run after `npm run build`, before uploading `out/` to Hostinger.
// Fails loudly on the mistakes that silently hurt SEO or break a deployment.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const out = "out";
const problems = [];
const need = (cond, msg) => {
  if (!cond) problems.push(msg);
};

need(existsSync(out), "out/ does not exist. Run `npm run build` first.");
if (problems.length === 0) {
  for (const f of [
    "index.html",
    "404.html",
    "sitemap.xml",
    "robots.txt",
    ".htaccess",
    "manifest.webmanifest",
  ]) {
    need(existsSync(join(out, f)), `out/${f} is missing.`);
  }
  const sitemap = existsSync(join(out, "sitemap.xml"))
    ? readFileSync(join(out, "sitemap.xml"), "utf8")
    : "";
  const robots = existsSync(join(out, "robots.txt"))
    ? readFileSync(join(out, "robots.txt"), "utf8")
    : "";
  const home = existsSync(join(out, "index.html"))
    ? readFileSync(join(out, "index.html"), "utf8")
    : "";

  need(
    !/example\.com/.test(sitemap),
    "sitemap.xml still uses the placeholder https://www.example.com. Set NEXT_PUBLIC_SITE_URL before building.",
  );
  need(
    !/example\.com/.test(home.match(/<link rel="canonical"[^>]*>/)?.[0] ?? ""),
    "Canonical URLs use the placeholder domain. Set NEXT_PUBLIC_SITE_URL before building.",
  );
  need(
    /^https:\/\//.test(sitemap.match(/<loc>([^<]+)/)?.[1] ?? ""),
    "Sitemap URLs are not https.",
  );
  need(
    /Sitemap:/i.test(robots) && !/Disallow:\s*\/\s*$/m.test(robots),
    "robots.txt must reference the sitemap and must not block the whole site.",
  );
  need(!/noindex/i.test(home), "The homepage contains a noindex tag.");

  const walk = (dir) =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
  const files = walk(out);
  need(
    !files.some((f) => /(^|[\/])\.env/.test(f)),
    "An .env file is inside out/. Remove it.",
  );
  need(
    !files.some((f) => /\.map$/.test(f) && !/_next[\/]static/.test(f)),
    "Unexpected source maps in out/.",
  );
  console.log(`Checked ${files.length} files in out/.`);
}

if (problems.length) {
  console.error(
    "\nBuild verification FAILED:\n" + problems.map((p) => ` - ${p}`).join("\n") + "\n",
  );
  process.exit(1);
}
console.log("Build verification passed: ready to upload the contents of out/.");
