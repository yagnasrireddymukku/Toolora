import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  // Serves the real static export with the same security headers (CSP etc.) as production .htaccess.
  webServer: {
    command: `npx serve out -l ${PORT} --no-clipboard -c ../e2e/serve.json`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    // Cross-browser: functional suites also run on Firefox and Safari's engine (WebKit).
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testIgnore: /audit/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /audit/ },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] }, testIgnore: /audit/ },
  ],
});
