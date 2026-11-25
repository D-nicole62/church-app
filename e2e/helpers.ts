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
  "/admin/email",
  "/admin/users",
  "/admin/users/new",
  "/admin/account/password",
] as const;

export const replacementAdminPassword = "E2eAdmin!2026";

async function submitLogin(page: Page, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(password);
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
  });
}

export async function login(page: Page) {
  await submitLogin(page, adminPassword);
  const changePassword = page.getByRole("heading", { name: "Choose a new password" });
  const invalid = page.getByText("Invalid email or password.");
  const dashboard = page.getByRole("heading", { name: "TOD church operations" });
  await expect(changePassword.or(invalid).or(dashboard)).toBeVisible();

  if (await changePassword.isVisible()) {
    await page.getByLabel("Current password").fill(adminPassword);
    await page.getByLabel("New password", { exact: true }).fill(replacementAdminPassword);
    await page.getByLabel("Confirm new password").fill(replacementAdminPassword);
    await page
      .locator("form")
      .filter({ has: page.locator("#new-password") })
      .evaluate((form: HTMLFormElement) => {
        form.requestSubmit();
      });
    await expect(page.getByText("Password updated.")).toBeVisible();
    await submitLogin(page, replacementAdminPassword);
  } else if (await invalid.isVisible()) {
    await submitLogin(page, replacementAdminPassword);
  }

  await expect(dashboard).toBeVisible();
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
