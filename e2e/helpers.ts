import { expect, type Page } from "@playwright/test";

export const adminEmail =
  process.env.ADMIN_SEED_EMAIL || "admin@todassembly.com";
export const adminPassword =
  process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!";

export const PUBLIC_PAGES = [
  { path: "/", heading: /Welcome to Tabernacle of David/ },
  { path: "/about", heading: /Tabernacle of David Assembly/ },
  { path: "/visit", heading: /We're saving a seat for you/ },
  { path: "/events", heading: /Upcoming gatherings at TOD/ },
  { path: "/sermons", heading: /Watch or listen to recent sermons/ },
  { path: "/groups", heading: /Cell church & ministry clusters/ },
  { path: "/children", heading: /A safe, joyful place for kids/ },
  { path: "/missions", heading: /Fulfilling the Great Commission/ },
  { path: "/give", heading: /Practice generosity together/ },
  { path: "/contact", heading: /We'd love to hear from you/ },
  { path: "/privacy", heading: /Privacy policy/ },
] as const;

export const ADMIN_ROUTES = [
  "/admin",
  "/admin/groups",
  "/admin/groups/new",
  "/admin/members",
  "/admin/members/new",
  "/admin/households",
  "/admin/households/new",
  "/admin/visitors",
  "/admin/attendance",
  "/admin/events",
  "/admin/events/new",
  "/admin/sermons",
  "/admin/sermons/new",
  "/admin/finance",
  "/admin/finance/new",
  "/admin/notifications",
  "/admin/reports",
  "/admin/reports/groups",
  "/admin/reports/visitors",
  "/admin/messages",
] as const;

export async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  // A normal click waits on the server-action redirect and can time out
  // after the dashboard has already rendered.
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
  });
  await expect(
    page.getByRole("heading", { name: "TOD church operations" }),
  ).toBeVisible();
}

export async function logout(page: Page) {
  await page
    .getByRole("button", { name: "Sign out" })
    .first()
    .evaluate((button: HTMLButtonElement) => {
      button.form?.requestSubmit();
    });
  await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
}

export function stamp() {
  return `${Date.now()}`;
}

export const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
