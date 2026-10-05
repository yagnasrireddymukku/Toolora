import { expect, test, type Page } from "@playwright/test";
import { strToU8, zipSync } from "fflate";
import { SAMPLE_RESUME } from "../src/lib/career/samples";

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

test.describe("salary tools", () => {
  test("CTC to in-hand calculator gives the documented example", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/salary/ctc-to-inhand-calculator/");
    await page.getByLabel("Annual CTC (₹)").fill("12,00,000");
    await page.getByRole("button", { name: "Calculate in-hand salary" }).click();
    const result = page.getByRole("region", { name: "Estimated in-hand salary" });
    await expect(result).toContainText("₹90,200");
    await expect(result).toContainText("Estimate, not tax advice");
    await expect(result.getByRole("table", { name: "Earnings" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("CTC calculator validates input and explains the problem", async ({ page }) => {
    await page.goto("/tools/salary/ctc-to-inhand-calculator/");
    await page.getByRole("button", { name: "Calculate in-hand salary" }).click();
    await expect(page.getByText("Please enter a valid number.").first()).toBeVisible();
    await page.getByLabel("Annual CTC (₹)").fill("1200000");
    await page.getByLabel("Basic pay (% of CTC)").fill("100");
    await page.getByLabel("HRA (% of basic)").fill("50");
    await page.getByRole("button", { name: "Calculate in-hand salary" }).click();
    await expect(page.getByText(/Lower the basic/)).toBeVisible();
  });

  test("CTC calculator CSV download works", async ({ page }) => {
    await page.goto("/tools/salary/ctc-to-inhand-calculator/");
    await page.getByLabel("Annual CTC (₹)").fill("1200000");
    await page.getByRole("button", { name: "Calculate in-hand salary" }).click();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download CSV" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("ctc-to-inhand-salary.csv");
  });

  test("salary hike calculator", async ({ page }) => {
    await page.goto("/tools/salary/salary-hike-calculator/");
    const panel = page.getByRole("tabpanel");
    await panel.getByLabel("Current annual salary (₹)").fill("1000000");
    await panel.getByLabel("Hike (%)").fill("12");
    await panel.getByRole("button", { name: "Calculate" }).click();
    const result = page.getByRole("region", { name: "Result" });
    await expect(result).toContainText("₹11,20,000");
    await expect(result).toContainText("₹10,000");
  });
});

test.describe("career tools", () => {
  test("job description analyzer", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/career/job-description-analyzer/");
    await page.getByRole("button", { name: "Analyze job description" }).click();
    await expect(page.getByText(/at least a couple of sentences/)).toBeVisible();
    await page.getByRole("button", { name: "Load example" }).click();
    await page.getByRole("button", { name: "Analyze job description" }).click();
    const result = page.getByRole("region", { name: "Job description analysis" });
    await expect(result.getByRole("heading", { name: "Required skills" })).toBeVisible();
    await expect(result).toContainText("TypeScript");
    await expect(result).toContainText("4+ years");
    await expect(result).toContainText("GraphQL");
    expect(errors).toEqual([]);
  });

  test("resume keyword matcher", async ({ page }) => {
    await page.goto("/tools/career/resume-keyword-matcher/");
    await page.getByRole("button", { name: "Load example" }).first().click();
    await page.getByRole("button", { name: "Load example" }).nth(1).click();
    await page.getByRole("button", { name: "Match keywords" }).click();
    const result = page.getByRole("region", { name: "Keyword match", exact: true });
    await expect(result).toContainText("Weighted keyword match");
    await expect(result.getByRole("heading", { name: "Missing keywords" })).toBeVisible();
    await expect(result).toContainText("Next.js");
  });

  test("ATS checker with pasted text is labelled as an estimate", async ({ page }) => {
    await page.goto("/tools/career/ats-resume-checker/");
    await page.getByRole("button", { name: "Check my resume" }).click();
    await expect(page.getByText("Paste or upload your resume text first.")).toBeVisible();
    await page.getByLabel("Your resume").fill(SAMPLE_RESUME);
    await page.getByRole("button", { name: "Check my resume" }).click();
    const result = page.getByRole("region", { name: "Estimated ATS analysis" });
    await expect(result).toContainText(
      "not the result of any real company's applicant tracking system",
    );
    await expect(result).toContainText(/\d+ \/ 100/);
    await expect(result.getByRole("heading", { name: "Issues to review" })).toBeVisible();
  });

  test("ATS checker reads an uploaded DOCX", async ({ page }) => {
    const paragraphs = SAMPLE_RESUME.split("\n");
    const xml =
      `<?xml version="1.0"?><w:document xmlns:w="x"><w:body>` +
      paragraphs
        .map(
          (p) =>
            `<w:p><w:r><w:t>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</w:t></w:r></w:p>`,
        )
        .join("") +
      `</w:body></w:document>`;
    const buffer = Buffer.from(zipSync({ "word/document.xml": strToU8(xml) }));
    await page.goto("/tools/career/ats-resume-checker/");
    await page.locator('input[type="file"]').setInputFiles({
      name: "resume.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer,
    });
    await expect(page.getByText(/Read resume\.docx in your browser/)).toBeVisible();
    await expect(page.getByLabel("Your resume")).toHaveValue(/Asha Verma/);
  });

  test("ATS checker reads an uploaded PDF", async ({ page, browser, browserName }) => {
    test.skip(browserName !== "chromium", "PDF fixture is generated with Chromium");
    const maker = await browser.newPage();
    await maker.setContent(
      `<html><body style="font-family:Arial"><h1>Priya Nair</h1><p>priya@example.com</p><h2>Experience</h2><ul><li>Built React dashboards</li></ul></body></html>`,
    );
    const pdf = await maker.pdf();
    await maker.close();

    const errors = trackErrors(page);
    await page.goto("/tools/career/ats-resume-checker/");
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: "resume.pdf", mimeType: "application/pdf", buffer: pdf });
    await expect(page.getByText(/Read resume\.pdf in your browser/)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByLabel("Your resume")).toHaveValue(/Priya Nair/);
    await expect(page.getByLabel("Your resume")).toHaveValue(/React dashboards/);
    expect(errors).toEqual([]);
  });

  test("rejects an unsupported or fake file with a clear message", async ({ page }) => {
    await page.goto("/tools/career/ats-resume-checker/");
    await page.locator('input[type="file"]').setInputFiles({
      name: "photo.png",
      mimeType: "image/png",
      buffer: Buffer.from("x"),
    });
    await expect(
      page.getByRole("alert").filter({ hasText: "Unsupported file type" }),
    ).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({
      name: "fake.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not really a pdf"),
    });
    await expect(page.getByRole("alert").filter({ hasText: "valid PDF" })).toBeVisible();
  });
});
