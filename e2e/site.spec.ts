import { type Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** Collect console errors and uncaught exceptions so tests fail on them. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("homepage and navigation", () => {
  test("renders hero, sections and has no console errors", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Free online tools",
    );
    await expect(page.getByRole("heading", { name: "Popular tools" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Browse by category" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Frequently asked questions" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test("hero search finds a tool and navigates to it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Search tools" }).fill("cgpa");
    await page
      .getByRole("link", { name: /CGPA Calculator/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/tools\/education\/cgpa-calculator/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("CGPA Calculator");
  });

  test("header search dialog works and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search tools" }).click();
    const dialog = page.getByRole("dialog", { name: "Search tools" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("searchbox").fill("attendance");
    await expect(
      dialog.getByRole("link", { name: /Attendance Calculator/ }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("shows a helpful message when search has no results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Search tools" }).fill("qqqqzzzz");
    await expect(page.getByText("No tools found")).toBeVisible();
  });

  test("desktop nav links go to real pages", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation");
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Tools" })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("All tools");
  });

  test("mobile drawer opens, links work and it closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile navigation");
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    await drawer.getByRole("link", { name: "Education" }).click();
    await expect(page).toHaveURL(/\/tools\/education/);
    await expect(drawer).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });

  test("unknown URLs show the 404 page", async ({ page }) => {
    await page.goto("/definitely-not-a-page/");
    await expect(
      page.getByRole("heading", { name: /couldn.t find that page/i }),
    ).toBeVisible();
  });
});

test.describe("SEO endpoints", () => {
  test("sitemap and robots are served and consistent", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/tools/education/cgpa-calculator/");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
  });

  test("tool pages have unique title, canonical and structured data", async ({
    page,
  }) => {
    await page.goto("/tools/education/sgpa-calculator/");
    await expect(page).toHaveTitle(/SGPA Calculator \| Toolora/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/tools\/education\/sgpa-calculator\/$/,
    );
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.join("")).toContain("BreadcrumbList");
    expect(ld.join("")).toContain("FAQPage");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index/);
  });
});

test.describe("education calculators", () => {
  test("SGPA calculator", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/education/sgpa-calculator/");
    const grades = [
      ["4", "O"],
      ["3", "A+"],
      ["3", "B"],
      ["2", "A"],
    ];
    for (const [i, [credits, grade]] of grades.entries()) {
      await page.getByLabel(`Subject ${i + 1} credits`).fill(credits);
      await page.getByLabel(`Subject ${i + 1} grade`).selectOption(grade);
    }
    await page.getByRole("button", { name: "Calculate SGPA" }).click();
    await expect(page.getByRole("region", { name: "Your SGPA" })).toContainText("8.42");
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test("CGPA calculator from semesters", async ({ page }) => {
    await page.goto("/tools/education/cgpa-calculator/");
    await page.getByRole("tab", { name: "From semester SGPAs" }).click();
    await page.getByLabel("Semester 1 SGPA").fill("8.2");
    await page.getByLabel("Semester 1 credits").fill("22");
    await page.getByLabel("Semester 2 SGPA").fill("8.8");
    await page.getByLabel("Semester 2 credits").fill("24");
    await page.getByRole("button", { name: "Calculate CGPA" }).click();
    await expect(page.getByRole("region", { name: "Your CGPA" })).toContainText("8.51");
  });

  test("attendance calculator", async ({ page }) => {
    await page.goto("/tools/education/attendance-calculator/");
    await page.getByLabel("Total classes held so far").fill("40");
    await page.getByLabel("Classes attended").fill("24");
    await page.getByRole("button", { name: "Calculate attendance" }).click();
    const result = page.getByRole("region", { name: "Your attendance" });
    await expect(result).toContainText("60%");
    await expect(result).toContainText("24");
  });

  test("percentage calculator", async ({ page }) => {
    await page.goto("/tools/education/percentage-calculator/");
    const panel = page.getByRole("tabpanel");
    await panel.getByLabel("Percentage (%)").fill("15");
    await panel.getByLabel("Number").fill("200");
    await panel.getByRole("button", { name: "Calculate" }).click();
    await expect(page.getByRole("region", { name: "Result" })).toContainText("30");
  });

  test("copy button gives feedback", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are Chromium specific");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/tools/education/percentage-calculator/");
    const panel = page.getByRole("tabpanel");
    await panel.getByLabel("Percentage (%)").fill("10");
    await panel.getByLabel("Number").fill("50");
    await panel.getByRole("button", { name: "Calculate" }).click();
    await page.getByRole("button", { name: "Copy result" }).click();
    await expect(page.getByText("Copied to clipboard")).toBeVisible();
  });
});
