import { expect, test } from "@playwright/test";
import { adminEmail, login, replacementAdminPassword, stamp } from "./helpers";

test.describe("admin access and email settings", () => {
  test("super admin can manage staff and cannot remove the last super admin", async ({ page, browser }) => {
    const id = stamp();
    const email = `officer-${id}@example.com`;
    const temporary = "TempOfficer!2026";

    await login(page);
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Admin users" })).toBeVisible();
    await page.getByRole("link", { name: "New admin" }).click();
    await page.locator("#admin-name").fill(`Officer ${id}`);
    await page.locator("#admin-email").fill(email);
    await page.locator("#admin-role").selectOption("FOLLOW_UP_OFFICER");
    await page.locator("#admin-password").fill(temporary);
    await page.locator("#admin-confirm").fill(temporary);
    await page.getByRole("button", { name: "Create admin" }).click();
    await expect(page.getByText("Admin created.")).toBeVisible();

    await page.locator("#user-role").selectOption("CAMPUS_ADMIN");
    await page.getByRole("button", { name: "Save role" }).click();
    await expect(page.getByText("Role saved.")).toBeVisible();

    await page.locator("#reset-password").fill("ResetOfficer!2026");
    await page.locator("#reset-confirm").fill("ResetOfficer!2026");
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.getByText("Password reset.")).toBeVisible();

    await page.goto("/admin/users");
    await page.locator("tr", { hasText: adminEmail }).getByRole("link", { name: "Manage" }).click();
    await page.locator("#user-role").selectOption("FOLLOW_UP_OFFICER");
    await page.getByRole("button", { name: "Save role" }).click();
    await expect(page.getByText(/at least one active super admin|change your role/i)).toBeVisible();

    await page.goto("/admin/users");
    await page.locator("tr", { hasText: email }).getByRole("link", { name: "Manage" }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Deactivate account" }).click();
    await expect(page.getByText("Account deactivated.")).toBeVisible();

    const officer = await browser.newContext();
    const officerPage = await officer.newPage();
    await officerPage.goto("/admin/login");
    await officerPage.getByLabel("Email").fill(email);
    await officerPage.getByLabel("Password").fill("ResetOfficer!2026");
    await officerPage.locator("form").evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect(officerPage.getByText("deactivated")).toBeVisible();
    await officer.close();
  });

  test("email settings show the provider without secrets and report a failed test send", async ({ page }) => {
    await login(page);
    await page.goto("/admin/email");
    await expect(page.getByRole("heading", { name: "Email settings" })).toBeVisible();
    await expect(page.locator("dd", { hasText: "Not configured" })).toBeVisible();
    await expect(page.getByText("Not set").first()).toBeVisible();
    await page.locator("#test-email").fill("test-recipient@example.com");
    await page.getByRole("button", { name: "Send test" }).click();
    await expect(page.locator(".border-red-200")).toContainText(/not configured|EMAIL_FROM|was not sent/i);
  });

  test("a signed-in admin can open change password", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Change password" }).first().click();
    await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
    await page.getByLabel("Current password").fill("not-the-password");
    await page.getByLabel("New password", { exact: true }).fill(replacementAdminPassword);
    await page.getByLabel("Confirm new password").fill(replacementAdminPassword);
    await page
      .locator("form")
      .filter({ has: page.locator("#new-password") })
      .evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect(page.getByText("The current password is not correct.")).toBeVisible();
  });
});
