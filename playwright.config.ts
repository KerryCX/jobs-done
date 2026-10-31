import { defineConfig, devices } from "@playwright/test";

// Jobs Done is one HTML file, so the tests open it straight from disk.
// No dev server is needed.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    // The app formats times for en-GB, so pin the locale and timezone.
    locale: "en-GB",
    timezoneId: "Europe/London",
    reducedMotion: "reduce",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
