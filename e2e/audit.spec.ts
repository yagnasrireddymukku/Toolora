import AxeBuilder from "@axe-core/playwright";
import { type APIRequestContext, type Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME } from "../src/lib/career/samples";

/** Audits run once, on desktop Chromium, across every URL listed in the sitemap. */
test.skip(({ isMobile }) => isMobile, "audits run on the desktop project");
/** Site-wide crawls visit every page (some at nine widths), so allow extra time under parallel load. */
test.setTimeout(150_000);

async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

async function meta(page: Page) {
  return page.evaluate(() => {
    const get = (sel: string, attr = "content") =>
      document.querySelector(sel)?.getAttribute(attr) ?? null;
    return {
      title: document.title,
      description: get('meta[name="description"]'),
      canonical: get('link[rel="canonical"]', "href"),
      robots: get('meta[name="robots"]'),
      lang: document.documentElement.lang,
      h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent?.trim()),
      ogTitle: get('meta[property="og:title"]'),
      ogDescription: get('meta[property="og:description"]'),
      ogUrl: get('meta[property="og:url"]'),
      twitterCard: get('meta[name="twitter:card"]'),
      jsonLd: Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      ).map((s) => s.textContent ?? ""),
      imgsWithoutAlt: Array.from(document.querySelectorAll("img:not([alt])")).length,
      links: Array.from(document.querySelectorAll("a[href]")).map(
        (a) => a.getAttribute("href") ?? "",
      ),
    };
  });
}

test.describe("SEO audit", () => {
  test("every page has unique, complete, indexable metadata and valid structured data", async ({
    page,
    request,
  }) => {
    const paths = await sitemapPaths(request);
    expect(paths.length).toBeGreaterThanOrEqual(23);

    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    const problems: string[] = [];

    for (const path of paths) {
      await page.goto(path);
      const m = await meta(page);
      const note = (msg: string) => problems.push(`${path}: ${msg}`);

      if (!m.title || m.title.length < 10 || m.title.length > 70)
        note(`title length ${m.title?.length} ("${m.title}")`);
      if (!m.description || m.description.length < 50 || m.description.length > 175)
        note(`description length ${m.description?.length}`);
      if (titles.has(m.title)) note(`duplicate title also on ${titles.get(m.title)}`);
      if (m.description && descriptions.has(m.description))
        note(`duplicate description also on ${descriptions.get(m.description)}`);
      titles.set(m.title, path);
      if (m.description) descriptions.set(m.description, path);

      if (!m.canonical || new URL(m.canonical).pathname !== path)
        note(`canonical ${m.canonical}`);
      if (m.robots && /noindex/i.test(m.robots)) note(`noindex: ${m.robots}`);
      if (m.lang !== "en") note(`lang=${m.lang}`);
      if (m.h1.length !== 1) note(`expected exactly one h1, found ${m.h1.length}`);
      if (!m.ogTitle || !m.ogDescription || !m.ogUrl) note("missing Open Graph tags");
      if (!m.twitterCard) note("missing twitter:card");
      if (m.imgsWithoutAlt > 0) note(`${m.imgsWithoutAlt} images without alt`);

      for (const raw of m.jsonLd) {
        try {
          const data = JSON.parse(raw);
          for (const item of Array.isArray(data) ? data : [data]) {
            if (item["@context"] !== "https://schema.org")
              note("JSON-LD missing schema.org context");
            if (item["@type"] === "FAQPage") {
              // FAQ schema must mirror visible questions.
              for (const q of item.mainEntity) {
                const visible = await page
                  .locator("summary", { hasText: q.name })
                  .count();
                if (visible === 0)
                  note(`FAQ schema question not visible on page: ${q.name}`);
              }
            }
            if (item["@type"] === "BreadcrumbList") {
              const last = item.itemListElement.at(-1);
              if (new URL(last.item).pathname !== path)
                note("breadcrumb last item does not match page");
            }
          }
        } catch {
          note("invalid JSON-LD");
        }
      }
    }
    expect(problems).toEqual([]);
  });

  test("tool pages follow the template: one H1, how it works, example, tips, FAQ, related", async ({
    page,
    request,
  }) => {
    const toolPaths = (await sitemapPaths(request)).filter(
      (p) => /^\/tools\/[a-z]+\/[a-z0-9-]+\/$/.test(p) && p.split("/").length === 5,
    );
    expect(toolPaths.length).toBeGreaterThanOrEqual(11);
    for (const path of toolPaths) {
      await page.goto(path);
      for (const heading of ["How it works", "Tips", "Frequently asked questions"]) {
        await expect(
          page.getByRole("heading", { name: heading, level: 2 }),
          `${path} / ${heading}`,
        ).toBeVisible();
      }
      await expect(
        page.getByRole("navigation", { name: "Breadcrumb" }),
        path,
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: /^(Worked example|Worked examples)$/,
          level: 2,
        }),
        path,
      ).toBeVisible();
    }
  });

  test("every internal link on every page resolves (no broken links)", async ({
    page,
    request,
  }) => {
    const paths = await sitemapPaths(request);
    const targets = new Set<string>();
    for (const path of paths) {
      await page.goto(path);
      for (const href of (await meta(page)).links) {
        if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
          continue;
        if (/^https?:\/\//.test(href)) continue;
        targets.add(href.split("#")[0] || path);
      }
    }
    expect(targets.size).toBeGreaterThan(20);
    const broken: string[] = [];
    for (const target of targets) {
      const res = await request.get(target);
      if (!res.ok()) broken.push(`${target} -> ${res.status()}`);
    }
    expect(broken).toEqual([]);
  });

  test("404 page is noindex and unknown URLs are not in the sitemap", async ({
    page,
    request,
  }) => {
    const paths = await sitemapPaths(request);
    expect(paths).not.toContain("/404/");
    await page.goto("/no-such-page/");
    const robots = await page
      .locator('meta[name="robots"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("content")));
    expect(robots.length).toBeGreaterThan(0);
    for (const content of robots) expect(content).toMatch(/noindex/);
  });

  test("no page links to a tool category that is empty", async ({ request }) => {
    for (const empty of ["pdf", "image"]) {
      const res = await request.get(`/tools/${empty}/`);
      expect(res.status(), empty).toBe(404);
    }
  });
});

test.describe("accessibility audit (axe, WCAG 2.1 A and AA)", () => {
  const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

  test("every page has no detectable violations", async ({ page, request }) => {
    const paths = [...(await sitemapPaths(request)), "/no-such-page/"];
    const violations: string[] = [];
    for (const path of paths) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const v of results.violations)
        violations.push(
          `${path}: ${v.id} (${v.nodes.length}) ${v.help} -> ${v.nodes[0]?.target.join(" ")}`,
        );
    }
    expect(violations).toEqual([]);
  });

  test("interactive states have no violations: results, errors, dialogs", async ({
    page,
  }) => {
    const violations: string[] = [];
    const scan = async (label: string) => {
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const v of results.violations)
        violations.push(`${label}: ${v.id} ${v.help} -> ${v.nodes[0]?.target.join(" ")}`);
    };

    await page.goto("/");
    await page.getByRole("button", { name: "Search tools" }).click();
    await page.getByRole("dialog").getByRole("searchbox").fill("cgpa");
    await scan("search dialog");

    await page.goto("/tools/education/sgpa-calculator/");
    await page.getByRole("button", { name: "Calculate SGPA" }).click();
    await page.getByLabel("Subject 1 credits").fill("3");
    await page.getByRole("button", { name: "Calculate SGPA" }).click();
    await scan("sgpa errors");
    await page.getByLabel("Subject 1 grade").selectOption("A");
    await page.getByRole("button", { name: "Calculate SGPA" }).click();
    await scan("sgpa result");

    await page.goto("/tools/salary/ctc-to-inhand-calculator/");
    await page.getByLabel("Annual CTC (₹)").fill("2500000");
    await page.getByRole("button", { name: "Calculate in-hand salary" }).click();
    await scan("ctc result");

    await page.goto("/tools/career/ats-resume-checker/");
    await page.getByLabel("Your resume").fill(SAMPLE_RESUME);
    await page.getByLabel("Job description (optional)").fill(SAMPLE_JOB_DESCRIPTION);
    await page.getByRole("button", { name: "Check my resume" }).click();
    await scan("ats result");

    await page.goto("/tools/developer/json-formatter/");
    await page.getByLabel("JSON input").fill('{"a":1,}');
    await page.getByRole("button", { name: "Format" }).click();
    await scan("json error");

    await page.goto("/tools/utility/qr-code-generator/");
    await page.getByLabel("Website address").fill("example.com");
    await page.getByRole("button", { name: "Generate QR code" }).click();
    await expect(page.getByRole("region", { name: "Your QR code" })).toBeVisible();
    await scan("qr result");

    expect(violations).toEqual([]);
  });

  test("keyboard: skip link, focus visible, dialog traps and restores focus", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    const opener = page.getByRole("button", { name: "Search tools" });
    await opener.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Search tools" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("searchbox")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("tabs support arrow-key navigation", async ({ page }) => {
    await page.goto("/tools/education/percentage-calculator/");
    const first = page.getByRole("tab", { name: "% of a number" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Increase by %" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Marks %" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

test.describe("responsive audit", () => {
  const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];
  const MIN_TARGET = 43.5; // 44px with sub-pixel rounding

  async function overflow(page: Page): Promise<number> {
    return page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
  }

  async function smallControls(page: Page): Promise<string[]> {
    return page.evaluate((min) => {
      const small: string[] = [];
      const controls = document.querySelectorAll<HTMLElement>(
        'button, select, textarea, summary, input:not([type="checkbox"]):not([type="file"]):not([type="hidden"])',
      );
      controls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (
          rect.width === 0 ||
          rect.height === 0 ||
          style.visibility === "hidden" ||
          style.display === "none"
        )
          return;
        if (el.closest("[hidden]")) return;
        if (rect.height < min)
          small.push(
            `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30)}" h=${Math.round(rect.height)}`,
          );
        if (
          (el.tagName === "BUTTON" && rect.width < min) ||
          (el.tagName === "SELECT" && rect.width < min)
        )
          small.push(`${el.tagName.toLowerCase()} w=${Math.round(rect.width)}`);
      });
      return small;
    }, MIN_TARGET);
  }

  test("no horizontal overflow and no tiny touch targets on any page at any width", async ({
    page,
    request,
  }) => {
    const paths = ["/", ...(await sitemapPaths(request)).filter((p) => p !== "/")];
    const problems: string[] = [];
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      for (const path of paths) {
        await page.goto(path);
        const o = await overflow(page);
        if (o > 0) problems.push(`${path} @${width}: horizontal overflow ${o}px`);
        for (const s of await smallControls(page))
          problems.push(`${path} @${width}: ${s}`);
      }
    }
    expect(problems).toEqual([]);
  });

  test("result states do not overflow on the smallest phone", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    const check = async (label: string) =>
      expect(await overflow(page), label).toBeLessThanOrEqual(0);

    await page.goto("/tools/education/sgpa-calculator/");
    for (let i = 1; i <= 4; i++) {
      await page
        .getByLabel(`Subject ${i} name (optional)`)
        .fill("A very long subject name that keeps going");
      await page.getByLabel(`Subject ${i} credits`).fill("4");
      await page.getByLabel(`Subject ${i} grade`).selectOption("A");
    }
    await page.getByRole("button", { name: "Calculate SGPA" }).click();
    await check("sgpa");

    await page.goto("/tools/salary/ctc-to-inhand-calculator/");
    await page.getByLabel("Annual CTC (₹)").fill("99999999999");
    await page.getByRole("button", { name: "Calculate in-hand salary" }).click();
    await check("ctc");

    await page.goto("/tools/career/resume-keyword-matcher/");
    await page.getByRole("button", { name: "Load example" }).first().click();
    await page.getByRole("button", { name: "Load example" }).nth(1).click();
    await page.getByRole("button", { name: "Match keywords" }).click();
    await check("matcher");

    await page.goto("/tools/developer/json-formatter/");
    await page.getByLabel("JSON input").fill(`{"k":"${"x".repeat(400)}",\n"a":1,}`);
    await page.getByRole("button", { name: "Format" }).click();
    await check("json error");

    await page.goto("/tools/utility/qr-code-generator/");
    await page.getByLabel("Website address").fill("example.com");
    await page.getByRole("button", { name: "Generate QR code" }).click();
    await expect(page.getByRole("region", { name: "Your QR code" })).toBeVisible();
    await check("qr");
  });

  test("navigation switches between desktop bar and mobile drawer at the md breakpoint", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 767, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await page.setViewportSize({ width: 768, height: 800 });
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  });
});

test.describe("security hygiene", () => {
  test("no secrets or server URLs leak into the shipped client code", async ({
    request,
  }) => {
    const home = await (await request.get("/")).text();
    const scripts = [...home.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map(
      (m) => m[1],
    );
    expect(scripts.length).toBeGreaterThan(0);
    for (const src of scripts) {
      const body = await (await request.get(src)).text();
      expect(body, src).not.toMatch(/localhost:\d{4}/);
      expect(body, src).not.toMatch(
        /(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/,
      );
    }
  });

  test("tool pages make no third-party requests", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (
        !["localhost", "127.0.0.1"].includes(u.hostname) &&
        u.protocol.startsWith("http")
      )
        external.push(r.url());
    });
    for (const path of [
      "/",
      "/tools/career/ats-resume-checker/",
      "/tools/utility/qr-code-generator/",
      "/tools/developer/json-formatter/",
    ]) {
      await page.goto(path);
    }
    expect(external).toEqual([]);
  });
});

test.describe("performance and CSP", () => {
  test("pages are served with the production CSP and trigger no violations", async ({
    page,
    request,
  }) => {
    const res = await request.get("/tools/utility/qr-code-generator/");
    expect(res.headers()["content-security-policy"]).toContain("default-src 'self'");
    const violations: string[] = [];
    page.on("console", (m) => {
      if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
    });
    await page.goto("/tools/utility/qr-code-generator/");
    await page.getByLabel("Website address").fill("example.com");
    await page.getByRole("button", { name: "Generate QR code" }).click();
    await expect(page.getByRole("region", { name: "Your QR code" })).toBeVisible();
    expect(violations).toEqual([]);
  });

  test("Core Web Vitals proxies: low layout shift and fast largest paint", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of [
      "/",
      "/tools/education/cgpa-calculator/",
      "/tools/career/ats-resume-checker/",
    ]) {
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number; __lcp: number };
        w.__cls = 0;
        w.__lcp = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as {
            value: number;
            hadRecentInput: boolean;
          }[]) {
            if (!e.hadRecentInput) w.__cls += e.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((list) => {
          const last = list.getEntries().at(-1);
          if (last) w.__lcp = last.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
      });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const { cls, lcp } = await page.evaluate(() => {
        const w = window as unknown as { __cls: number; __lcp: number };
        return { cls: w.__cls, lcp: w.__lcp };
      });
      expect(cls, `${path} CLS`).toBeLessThan(0.05);
      expect(lcp, `${path} LCP`).toBeLessThan(2500);
    }
  });

  test("tool pages download only their own tool code (no PDF engine unless a PDF is uploaded)", async ({
    page,
  }) => {
    const scripts: string[] = [];
    page.on("response", (r) => {
      if (/\.m?js(\?|$)/.test(r.url())) scripts.push(r.url());
    });
    await page.goto("/tools/developer/json-formatter/");
    await page.waitForLoadState("networkidle");
    expect(scripts.some((u) => /pdf\.worker/.test(u))).toBe(false);
    const bytes = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((e) => /\.js/.test(e.name))
        .reduce((s, e) => s + ((e as PerformanceResourceTiming).encodedBodySize || 0), 0),
    );
    expect(bytes).toBeLessThan(300 * 1024);
  });
});
