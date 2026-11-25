import { expect, test } from "@playwright/test";
import { PUBLIC_PAGES } from "./helpers";

const WIDTHS = [390, 768, 1024, 1440] as const;

test.describe("responsive layout", () => {
  for (const width of WIDTHS) {
    test(`public pages do not overflow horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const pageInfo of PUBLIC_PAGES) {
        await page.goto(pageInfo.path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          return root.scrollWidth - root.clientWidth;
        });
        expect(overflow, pageInfo.path).toBeLessThanOrEqual(1);
      }
    });
  }

  test("admin navigation is usable on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(process.env.ADMIN_SEED_EMAIL || "admin@todassembly.com");
    await page.getByLabel("Password").fill(process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!");
    await page.getByRole("button", { name: "Sign in" }).click({ noWaitAfter: true });
    await expect(page.getByRole("heading", { name: "TOD church operations" })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Admin" });
    await expect(nav.getByRole("link", { name: "Events" })).toBeVisible();
    await nav.getByRole("link", { name: "Finance" }).click();
    await expect(page).toHaveURL(/\/admin\/finance/);
    await expect(page.getByText("Online giving is turned off")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
