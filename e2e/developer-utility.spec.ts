import { expect, test, type Page } from "@playwright/test";

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

/** Decodes the displayed QR image with an independent QR reader (jsQR) inside the page. */
async function decodeQr(page: Page): Promise<string | null> {
  await page.addScriptTag({ path: require.resolve("jsqr") });
  return page.evaluate(async () => {
    const img = document.querySelector<HTMLImageElement>(
      '[role="tabpanel"]:not([hidden]) img[alt^="QR code"]',
    );
    if (!img) return null;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (window as any).jsQR(data.data, data.width, data.height);
    return result ? (result.data as string) : null;
  });
}

test.describe("JSON formatter", () => {
  test("formats, minifies, copies and downloads", async ({
    page,
    context,
    browserName,
  }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/developer/json-formatter/");
    await page
      .getByLabel("JSON input")
      .fill('{"b":[1,2],"a":{"c":true},"id":12345678901234567890}');
    await page.getByRole("button", { name: "Format" }).click();
    const out = page.getByLabel("Formatted output");
    await expect(out).toHaveValue(/"id": 12345678901234567890/);
    await expect(out).toHaveValue(/^\{\n {2}"b": \[/);
    await expect(page.getByText(/Formatted/).first()).toBeVisible();

    await page.getByRole("button", { name: "Minify" }).click();
    await expect(page.getByLabel("Minified output")).toHaveValue(
      '{"b":[1,2],"a":{"c":true},"id":12345678901234567890}',
    );

    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.getByRole("button", { name: "Copy output" }).click();
      await expect(page.getByText("Copied to clipboard")).toBeVisible();
    }

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download .json" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("minified.json");
    expect(errors).toEqual([]);
  });

  test("shows the error location and jumps to it", async ({ page }) => {
    await page.goto("/tools/developer/json-formatter/");
    await page.getByLabel("JSON input").fill('{\n  "a": 1\n  "b": 2\n}');
    await page.getByRole("button", { name: "Validate" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "Invalid JSON" });
    await expect(alert).toContainText("Line 3, column 3");
    await expect(alert).toContainText("comma may be missing");
    await alert.getByRole("button", { name: "Go to error" }).click();
    const selection = await page
      .getByLabel("JSON input")
      .evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd]);
    expect(selection).toEqual([13, 14]);
  });

  test("validate reports stats and clear resets", async ({ page }) => {
    await page.goto("/tools/developer/json-formatter/");
    await page.getByRole("button", { name: "Load example" }).click();
    await page.getByRole("button", { name: "Validate" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Valid JSON" }),
    ).toContainText("object root");
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByLabel("JSON input")).toHaveValue("");
    await page.getByRole("button", { name: "Format" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "input is empty" }),
    ).toBeVisible();
  });
});

test.describe("QR code generator", () => {
  test("website QR decodes to the right address and downloads as PNG", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/utility/qr-code-generator/");
    await page.getByRole("button", { name: "Generate QR code" }).click();
    await expect(page.getByText(/Enter a web address/)).toBeVisible();

    await page.getByLabel("Website address").fill("example.com/menu");
    await page.getByRole("button", { name: "Generate QR code" }).click();
    await expect(page.getByRole("region", { name: "Your QR code" })).toContainText(
      "https://example.com/menu",
    );
    expect(await decodeQr(page)).toBe("https://example.com/menu");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download PNG" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("qr-code-url.png");
    expect(errors).toEqual([]);
  });

  test("Wi-Fi QR encodes the standard format", async ({ page }) => {
    await page.goto("/tools/utility/qr-code-generator/");
    await page.getByRole("tab", { name: "Wi-Fi" }).click();
    const panel = page.getByRole("tabpanel");
    await panel.getByLabel("Network name (SSID)").fill("Cafe;Guest");
    await panel.getByLabel("Password").fill("abc12345");
    await panel.getByRole("button", { name: "Generate QR code" }).click();
    expect(await decodeQr(page)).toBe("WIFI:T:WPA;S:Cafe\\;Guest;P:abc12345;;");
  });

  test("rejects unsafe addresses and bad input with clear messages", async ({ page }) => {
    await page.goto("/tools/utility/qr-code-generator/");
    await page.getByLabel("Website address").fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Generate QR code" }).click();
    await expect(page.getByText(/Only http and https/)).toBeVisible();

    await page.getByRole("tab", { name: "Phone" }).click();
    const panel = page.getByRole("tabpanel");
    await panel.getByLabel("Phone number").fill("abc");
    await panel.getByRole("button", { name: "Generate QR code" }).click();
    await expect(panel.getByText(/5 to 15 digits/)).toBeVisible();
  });

  test("text, email and phone QR codes decode correctly", async ({ page }) => {
    await page.goto("/tools/utility/qr-code-generator/");
    await page.getByRole("tab", { name: "Text" }).click();
    let panel = page.getByRole("tabpanel");
    await panel.getByLabel("Text", { exact: true }).fill("Hello Toolora");
    await panel.getByRole("button", { name: "Generate QR code" }).click();
    expect(await decodeQr(page)).toBe("Hello Toolora");

    await page.getByRole("tab", { name: "Phone" }).click();
    panel = page.getByRole("tabpanel");
    await panel.getByLabel("Phone number").fill("+91 98765 43210");
    await panel.getByRole("button", { name: "Generate QR code" }).click();
    expect(await decodeQr(page)).toBe("tel:+919876543210");
  });
});
