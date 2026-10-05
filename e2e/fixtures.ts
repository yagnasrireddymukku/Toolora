import { expect, test as base } from "@playwright/test";

/**
 * Same as Playwright's `test`, but page.goto waits until React has hydrated and the
 * network is quiet, so tests never type into a form that is not yet interactive.
 */
export const test = base.extend({
  page: async ({ page }, run) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, { waitUntil: "load", ...options });
      await page.waitForLoadState("networkidle");
      // Pages that fail to render (404 etc.) still include the layout, so this always resolves.
      await page.waitForFunction(
        () => document.documentElement.dataset.hydrated === "true",
        undefined,
        { timeout: 15_000 },
      );
      return response;
    };
    await run(page);
  },
});

export { expect };
