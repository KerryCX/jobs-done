import { expect, test } from "@playwright/test";
import { NOW, addJob, openApp, withStorage } from "./helpers";

const input = (page: import("@playwright/test").Page) =>
  page.getByPlaceholder("What did you get done?");
const jobs = (page: import("@playwright/test").Page) => page.locator("li.job");

test.describe("empty state", () => {
  test("invites you to add a first job and disables the actions", async ({ page }) => {
    await openApp(page);
    await expect(page.getByText("Nothing yet", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: /Email my jobs list/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Copy list to clipboard/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Clear list/ })).toBeDisabled();
    await expect(page.locator("#countLine")).toHaveText("");
  });
});

test.describe("adding jobs", () => {
  test("adds a job with the Enter key, clears and refocuses the input", async ({ page }) => {
    await openApp(page);
    await input(page).fill("Walk the dog");
    await input(page).press("Enter");

    await expect(jobs(page)).toHaveCount(1);
    await expect(jobs(page).first()).toContainText("Walk the dog");
    await expect(jobs(page).first()).toContainText("10:30");
    await expect(input(page)).toHaveValue("");
    await expect(input(page)).toBeFocused();
  });

  test("adds a job with the Add button", async ({ page }) => {
    await openApp(page);
    await input(page).fill("Hang out the washing");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(jobs(page)).toHaveCount(1);
  });

  test("trims whitespace and ignores empty entries", async ({ page }) => {
    await openApp(page);
    await input(page).fill("   ");
    await input(page).press("Enter");
    await expect(jobs(page)).toHaveCount(0);

    await input(page).fill("  Empty the dishwasher  ");
    await input(page).press("Enter");
    await expect(jobs(page).first().locator(".text")).toHaveText("Empty the dishwasher");
  });

  test("limits a job to 200 characters", async ({ page }) => {
    await openApp(page);
    await expect(input(page)).toHaveAttribute("maxlength", "200");
  });

  test("shows the job count, singular then plural", async ({ page }) => {
    await openApp(page);
    await addJob(page, "One");
    await expect(page.locator("#countLine")).toHaveText("1 job done — nice work");
    await addJob(page, "Two");
    await expect(page.locator("#countLine")).toHaveText("2 jobs done — nice work");
  });

  test("shows text as plain text, not HTML", async ({ page }) => {
    await openApp(page);
    await addJob(page, "<b>bold</b> <img src=x onerror=alert(1)>");
    await expect(jobs(page).first().locator(".text")).toHaveText(
      "<b>bold</b> <img src=x onerror=alert(1)>",
    );
    await expect(page.locator("li.job b, li.job img")).toHaveCount(0);
  });
});

test.describe("deleting and clearing", () => {
  test("deletes a single job", async ({ page }) => {
    await openApp(page);
    await addJob(page, "Keep me");
    await addJob(page, "Delete me");
    await page
      .locator("li.job", { hasText: "Delete me" })
      .getByRole("button", { name: "Delete this job" })
      .click();
    await expect(jobs(page)).toHaveCount(1);
    await expect(jobs(page).first()).toContainText("Keep me");
  });

  test("clears the list after confirming", async ({ page }) => {
    await openApp(page);
    await addJob(page, "Something");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /Clear list/ }).click();
    await expect(jobs(page)).toHaveCount(0);
    await expect(page.locator("#toast")).toContainText("Fresh start");
    await expect(page.getByRole("button", { name: /Clear list/ })).toBeDisabled();
  });

  test("keeps the list when the confirmation is cancelled", async ({ page }) => {
    await openApp(page);
    await addJob(page, "Something");
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: /Clear list/ }).click();
    await expect(jobs(page)).toHaveCount(1);
  });
});

test.describe("grouping by day", () => {
  test("groups jobs under Today, Yesterday and a dated heading, newest day first", async ({ page }) => {
    const day = 24 * 60 * 60 * 1000;
    await withStorage(page, [
      { id: "a", text: "Old job", ts: NOW.getTime() - 5 * day },
      { id: "b", text: "Yesterday job", ts: NOW.getTime() - day },
      { id: "c", text: "Today job", ts: NOW.getTime() - 60 * 1000 },
    ]);
    await openApp(page);

    await expect(page.locator(".day-label")).toHaveText([
      "Today",
      "Yesterday",
      "Thursday 5 March",
    ]);
    await expect(page.locator("#countLine")).toHaveText("3 jobs done — nice work");
  });

  test("lists jobs oldest first within a day", async ({ page }) => {
    const hour = 60 * 60 * 1000;
    await withStorage(page, [
      { id: "a", text: "Later", ts: NOW.getTime() - hour },
      { id: "b", text: "Earlier", ts: NOW.getTime() - 3 * hour },
    ]);
    await openApp(page);
    await expect(jobs(page).locator(".text")).toHaveText(["Earlier", "Later"]);
  });
});

test.describe("copying the list", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("copies a formatted list and confirms with a message", async ({ page }) => {
    const day = 24 * 60 * 60 * 1000;
    await withStorage(page, [
      { id: "a", text: "Washed the car", ts: NOW.getTime() - day },
    ]);
    await openApp(page);
    await addJob(page, "Walk the dog");
    await page.getByRole("button", { name: /Copy list to clipboard/ }).click();

    await expect(page.locator("#toast")).toHaveText("Copied! Paste it anywhere");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(
      [
        "Yesterday:",
        "  ✓ Washed the car (10:30)",
        "",
        "Today:",
        "  ✓ Walk the dog (10:30)",
        "",
        "— 2 jobs done in total 🎉",
      ].join("\n"),
    );
  });

  test("uses the singular for one job", async ({ page }) => {
    await openApp(page);
    await addJob(page, "Just one");
    await page.getByRole("button", { name: /Copy list to clipboard/ }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("1 job done in total");
  });
});

test.describe("storage", () => {
  test("keeps the list across a reload when a store is available", async ({ page }) => {
    await withStorage(page);
    await openApp(page);
    await addJob(page, "Survive a reload");
    await page.reload();
    await expect(jobs(page)).toHaveCount(1);
    await expect(jobs(page).first()).toContainText("Survive a reload");
  });

  test("starts empty and still works in a plain browser tab", async ({ page }) => {
    await openApp(page);
    await addJob(page, "In memory only");
    await expect(jobs(page)).toHaveCount(1);
    await page.reload();
    await expect(jobs(page)).toHaveCount(0);
  });

  test("tells you when saving fails", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { storage: unknown }).storage = {
        get: async () => {
          throw new Error("not found");
        },
        set: async () => {
          throw new Error("quota");
        },
      };
    });
    await openApp(page);
    await addJob(page, "Will not save");
    await expect(page.locator("#toast")).toContainText("save");
  });
});

test.describe("closing the tab", () => {
  test("warns before closing when there are unsent jobs", async ({ page }) => {
    await openApp(page);
    await addJob(page, "Unsent");

    const dialogType = new Promise<string>((resolve) =>
      page.once("dialog", async (dialog) => {
        resolve(dialog.type());
        await dialog.dismiss();
      }),
    );
    await page.close({ runBeforeUnload: true });
    expect(await dialogType).toBe("beforeunload");
  });
});
