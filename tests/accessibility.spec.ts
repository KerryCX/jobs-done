import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { addJob, openApp } from "./helpers";

// WCAG 2.2 AA is the target, with zero violations.
const scan = (page: import("@playwright/test").Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

test("has no accessibility violations when empty", async ({ page }) => {
  await openApp(page);
  expect((await scan(page)).violations).toEqual([]);
});

test("has no accessibility violations with jobs on the list", async ({ page }) => {
  await openApp(page);
  await addJob(page, "Walk the dog");
  await addJob(page, "Hang out the washing");
  expect((await scan(page)).violations).toEqual([]);
});

test("the page can be used with the keyboard alone", async ({ page }) => {
  await openApp(page);
  await page.keyboard.press("Tab");
  await expect(page.getByPlaceholder("What did you get done?")).toBeFocused();
  await page.keyboard.type("Keyboard only");
  await page.keyboard.press("Enter");
  await expect(page.locator("li.job")).toHaveCount(1);
});

test("has a page title, language and a single h1", async ({ page }) => {
  await openApp(page);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});
