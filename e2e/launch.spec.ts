import { expect, test } from "./fixtures";

test.describe("launch readiness", () => {
  test.skip(({ isMobile }) => isMobile, "runs once on desktop");

  test("sitemap has no duplicates, only https canonical URLs, and robots points at it", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(new Set(locs).size).toBe(locs.length);
    for (const loc of locs) {
      expect(loc).toMatch(/^https:\/\/[^/]+\/(?:[a-z0-9-]+\/)*$/);
      expect(loc).not.toMatch(/\/(404|_next|api|admin)\b/);
    }
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/^User-Agent: \*/im);
    expect(robots).toMatch(/^Allow: \/$/im);
    const robotsSitemap = /Sitemap:\s*(\S+)/i.exec(robots)?.[1];
    expect(robotsSitemap && new URL(robotsSitemap).origin).toBe(new URL(locs[0]).origin);
  });

  test("every indexable page has complete Open Graph and Twitter metadata and no missing image", async ({
    page,
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    for (const path of paths) {
      await page.goto(path);
      const tags = await page.evaluate(() => {
        const get = (sel: string) =>
          document.querySelector(sel)?.getAttribute("content") ?? null;
        return {
          ogTitle: get('meta[property="og:title"]'),
          ogDescription: get('meta[property="og:description"]'),
          ogUrl: get('meta[property="og:url"]'),
          ogType: get('meta[property="og:type"]'),
          ogImage: get('meta[property="og:image"]'),
          twCard: get('meta[name="twitter:card"]'),
          twTitle: get('meta[name="twitter:title"]'),
          twDescription: get('meta[name="twitter:description"]'),
          canonical:
            document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        };
      });
      expect(tags.ogTitle, path).toBeTruthy();
      expect(tags.ogDescription, path).toBeTruthy();
      expect(tags.ogType, path).toBe("website");
      expect(tags.twCard, path).toBe("summary");
      expect(tags.twTitle, path).toBeTruthy();
      expect(tags.twDescription, path).toBeTruthy();
      expect(tags.ogUrl, path).toBe(tags.canonical);
      // Never reference an image that does not exist.
      if (tags.ogImage) {
        expect(
          (await request.get(new URL(tags.ogImage).pathname)).ok(),
          `${path} og:image`,
        ).toBe(true);
      }
    }
  });

  test("legal pages are linked from the footer and make no claims about tracking that is not enabled", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const links = [
      ["About", "/about/"],
      ["Contact", "/contact/"],
      ["Privacy Policy", "/privacy-policy/"],
      ["Terms of Service", "/terms-of-service/"],
      ["Disclaimer", "/disclaimer/"],
    ] as const;
    for (const [name, path] of links) {
      await expect(footer.getByRole("link", { name })).toHaveAttribute("href", path);
    }
    await page.goto("/privacy-policy/");
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/If analytics is enabled/);
    expect(text).toMatch(/We may show ads/);
    expect(text).toMatch(/run entirely in your browser/);
    // No tracking scripts are present unless configured.
    expect(
      await page
        .locator('script[src*="googletagmanager"], script[src*="googlesyndication"]')
        .count(),
    ).toBe(0);
  });

  test("contact page explains the mailto behaviour or states the address is not configured", async ({
    page,
  }) => {
    await page.goto("/contact/");
    const main = page.locator("main");
    const configured =
      (await page.getByRole("button", { name: "Open in my email app" }).count()) > 0;
    if (configured) {
      await page.getByRole("button", { name: "Open in my email app" }).click();
      await expect(main.getByText("Please enter your name.")).toBeVisible();
      await expect(main.getByText(/valid email address/)).toBeVisible();
    } else {
      await expect(main.getByText("Contact address not configured")).toBeVisible();
    }
  });
});

test.describe("reset and empty states on every tool", () => {
  test.skip(({ isMobile }) => isMobile, "runs once on desktop");

  test("education tools reset clears inputs and results", async ({ page }) => {
    await page.goto("/tools/education/attendance-calculator/");
    await page.getByLabel("Total classes held so far").fill("40");
    await page.getByLabel("Classes attended").fill("30");
    await page.getByRole("button", { name: "Calculate attendance" }).click();
    await expect(page.getByRole("region", { name: "Your attendance" })).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByRole("region", { name: "Your attendance" })).toBeHidden();
    await expect(page.getByLabel("Total classes held so far")).toHaveValue("");
    await expect(page.getByLabel("Required attendance (%)")).toHaveValue("75");

    await page.goto("/tools/education/percentage-calculator/");
    const panel = page.getByRole("tabpanel");
    await panel.getByLabel("Percentage (%)").fill("10");
    await panel.getByLabel("Number").fill("50");
    await panel.getByRole("button", { name: "Calculate" }).click();
    await expect(page.getByRole("region", { name: "Result" })).toBeVisible();
    await panel.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByRole("region", { name: "Result" })).toBeHidden();
    await expect(panel.getByLabel("Number")).toHaveValue("");

    await page.goto("/tools/education/sgpa-calculator/");
    await page.getByLabel("Subject 1 credits").fill("4");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByLabel("Subject 1 credits")).toHaveValue("");
  });

  test("salary tools reset", async ({ page }) => {
    await page.goto("/tools/salary/ctc-to-inhand-calculator/");
    await page.getByLabel("Annual CTC (₹)").fill("1200000");
    await page.getByRole("button", { name: "Calculate in-hand salary" }).click();
    await expect(
      page.getByRole("region", { name: "Estimated in-hand salary" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(
      page.getByRole("region", { name: "Estimated in-hand salary" }),
    ).toBeHidden();
    await expect(page.getByLabel("Annual CTC (₹)")).toHaveValue("");
    await expect(page.getByLabel("Basic pay (% of CTC)")).toHaveValue("40");

    await page.goto("/tools/salary/salary-hike-calculator/");
    const panel = page.getByRole("tabpanel").first();
    await panel.getByLabel("Current annual salary (₹)").fill("500000");
    await panel.getByRole("button", { name: "Reset" }).click();
    await expect(panel.getByLabel("Current annual salary (₹)")).toHaveValue("");
  });

  test("career, JSON and QR tools clear", async ({ page }) => {
    await page.goto("/tools/career/job-description-analyzer/");
    await page.getByRole("button", { name: "Load example" }).click();
    await expect(page.getByRole("textbox", { name: "Job description" })).not.toHaveValue(
      "",
    );
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByRole("textbox", { name: "Job description" })).toHaveValue("");

    await page.goto("/tools/career/resume-keyword-matcher/");
    await page.getByRole("button", { name: "Load example" }).first().click();
    await page.getByRole("button", { name: "Clear" }).first().click();
    await expect(page.getByLabel("Your resume")).toHaveValue("");

    await page.goto("/tools/developer/json-formatter/");
    await page.getByLabel("JSON input").fill('{"a":1}');
    await page.getByRole("button", { name: "Format" }).click();
    await expect(page.getByLabel("Formatted output")).toBeVisible();
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByLabel("Formatted output")).toBeHidden();

    await page.goto("/tools/utility/qr-code-generator/");
    await page.getByLabel("Website address").fill("example.com");
    await page.getByRole("button", { name: "Generate QR code" }).click();
    await expect(page.getByRole("region", { name: "Your QR code" })).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).first().click();
    await expect(page.getByRole("region", { name: "Your QR code" })).toBeHidden();
  });
});

test.describe("text accuracy", () => {
  test.skip(({ isMobile }) => isMobile, "runs once on desktop");

  test("homepage never repeats the same tool card in two sections", async ({ page }) => {
    await page.goto("/");
    const names = await page.locator("main h3").allTextContents();
    expect(new Set(names).size).toBe(names.length);
  });

  test("the estimate notice appears only on tools whose results are estimates", async ({
    page,
  }) => {
    for (const path of [
      "/tools/salary/ctc-to-inhand-calculator/",
      "/tools/education/cgpa-calculator/",
      "/tools/career/ats-resume-checker/",
    ]) {
      await page.goto(path);
      await expect(
        page.getByText("Results are estimates for general guidance"),
      ).toBeVisible();
    }
    for (const path of [
      "/tools/developer/json-formatter/",
      "/tools/utility/qr-code-generator/",
    ]) {
      await page.goto(path);
      await expect(
        page.getByText("Results are estimates for general guidance"),
      ).toHaveCount(0);
    }
  });

  test("no page shows developer-only text such as environment variable names", async ({
    page,
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    for (const path of paths) {
      await page.goto(path);
      expect(await page.locator("main").innerText(), path).not.toMatch(
        /NEXT_PUBLIC_|localhost|TODO|lorem ipsum/i,
      );
    }
  });
});
