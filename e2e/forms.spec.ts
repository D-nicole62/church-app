import { expect, test } from "@playwright/test";
import { login, stamp } from "./helpers";

test.describe("public forms", () => {
  test("contact form validates and saves a message", async ({ page }) => {
    const id = stamp();
    const message = `E2E contact ${id}`;
    const email = `e2e-friend-${id}@example.com`;
    await page.goto("/contact");

    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    const nameInvalid = await page.locator("#contact-name").evaluate((element) => {
      const input = element as HTMLInputElement;
      return input.validity.valueMissing;
    });
    expect(nameInvalid).toBeTruthy();

    await page.locator("#contact-name").fill("E2E Friend");
    await page.locator("#contact-email").fill("not-an-email");
    await page.locator("#contact-message").fill(message);
    await page.getByRole("button", { name: "Send message" }).click();
    const emailInvalid = await page.locator("#contact-email").evaluate((element) => {
      return (element as HTMLInputElement).validity.typeMismatch;
    });
    expect(emailInvalid).toBeTruthy();

    await page.locator("#contact-phone").fill("123");
    await page.locator("#contact-phone").blur();
    await expect(page.getByText("Enter a valid phone number")).toBeVisible();

    await page.locator("#contact-email").fill(email);
    await page.locator("#contact-phone").fill("0977123456");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Your message has been received")).toBeVisible();

    await login(page);
    await page.goto("/admin/messages");
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("visit form validates, saves a prayer request, and shows it in admin", async ({ page }) => {
    const id = stamp();
    const firstName = `Visit${id}`;
    const prayer = `Pray for the ${id} family`;

    await page.goto("/visit");
    await page.locator("#visit-first-name").fill(firstName);
    await page.locator("#visit-last-name").fill("Guest");
    await page.getByRole("button", { name: "Submit your visit" }).click();
    await expect(page.getByText("Please fill in your name and at least one way to contact you.")).toBeVisible();

    await page.locator("#visit-email").fill("bad-email");
    await page.getByRole("button", { name: "Submit your visit" }).click();
    const emailInvalid = await page.locator("#visit-email").evaluate((element) => {
      return (element as HTMLInputElement).validity.typeMismatch;
    });
    expect(emailInvalid).toBeTruthy();

    await page.locator("#visit-first-name").fill(firstName);
    await page.locator("#visit-last-name").fill("Guest");
    await page.locator("#visit-email").fill(`visit-${id}@example.com`);
    await page.locator("#visit-phone").fill("12345");
    await page.locator("#visit-phone").blur();
    await expect(page.getByText("Enter a valid phone number")).toBeVisible();

    await page.locator("#visit-first-name").fill(firstName);
    await page.locator("#visit-last-name").fill("Guest");
    await page.locator("#visit-phone").fill("0977123456");
    await page.locator("#visit-prayer").fill(prayer);
    await page.getByRole("button", { name: "Submit your visit" }).click();
    await expect(page.getByText("Thanks for planning your visit")).toBeVisible();

    await login(page);
    await page.goto("/admin/visitors");
    await page.locator("tr", { hasText: firstName }).getByRole("link", { name: "Manage" }).click();
    await page.waitForURL(/\/admin\/visitors\/[^/]+$/);
    await expect(page.getByText(prayer)).toBeVisible();
    await page.locator('select[name="status"]').selectOption("RETURNING");
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.getByText("Visitor status updated.")).toBeVisible();

    await page.locator('input[name="interactionDate"]').fill("2026-11-20");
    await page.locator('textarea[name="outcome"]').fill(`Called about ${id}`);
    await page.getByRole("button", { name: "Log interaction" }).click();
    await expect(page.getByText("Follow-up saved.")).toBeVisible();
    await expect(page.getByText(`Called about ${id}`)).toBeVisible();
  });
});
