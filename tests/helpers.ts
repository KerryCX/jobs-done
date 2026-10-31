import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Page } from "@playwright/test";

export const appUrl = pathToFileURL(path.resolve(__dirname, "../index.html")).href;

// 10:30 in London on a Tuesday in March (before clocks go forward).
export const NOW = new Date("2026-03-10T10:30:00Z");

type SeedJob = { id: string; text: string; ts: number };

// Gives the page the persistent key-value store that the app uses when it
// runs somewhere that provides window.storage. The data lives in
// sessionStorage so it survives a reload within the same test.
export const withStorage = async (page: Page, seed?: SeedJob[]) => {
  await page.addInitScript(
    ({ seed }) => {
      const KEY = "jobs-done-list";
      if (seed && !sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, JSON.stringify(seed));
      }
      (window as unknown as { storage: unknown }).storage = {
        get: async (key: string) => {
          const value = sessionStorage.getItem(key);
          if (value === null) throw new Error("not found");
          return { value };
        },
        set: async (key: string, value: string) => {
          sessionStorage.setItem(key, value);
        },
      };
    },
    { seed },
  );
};

export const openApp = async (page: Page) => {
  await page.clock.setFixedTime(NOW);
  await page.goto(appUrl);
};

export const addJob = async (page: Page, text: string) => {
  await page.getByPlaceholder("What did you get done?").fill(text);
  await page.getByRole("button", { name: "Add", exact: true }).press("Enter");
};
