import { expect, test } from "@playwright/test";
import { ADMIN_ROUTES, adminEmail, login, logout } from "./helpers";

test.describe("admin authentication", () => {
  test("rejects a wrong password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click({ noWaitAfter: true });
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });

  test("login and logout", async ({ page }) => {
    await login(page);
    await logout(page);
    await page.goto("/admin/events");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("every admin page redirects when signed out", async ({ page }) => {
    for (const path of ADMIN_ROUTES) {
      await page.goto(path);
      await expect(page, path).toHaveURL(/\/admin\/login/);
    }
  });

  test("admin APIs reject anonymous writes", async ({ request }) => {
    for (const path of ADMIN_ROUTES) {
      const response = await request.post(path, {
        maxRedirects: 0,
        form: { title: "should-not-save" },
      });
      expect([302, 303, 307, 308], path).toContain(response.status());
      expect(response.headers().location ?? "").toContain("/admin/login");
    }

    const createSermon = await request.post("/api/sermons", {
      data: { title: "Nope", date: "2026-01-01", mediaType: "VIDEO", mediaUrl: "https://example.com/a.mp4" },
    });
    expect(createSermon.status()).toBe(401);

    const patchSermon = await request.patch("/api/sermons/does-not-exist", {
      data: { title: "Nope" },
    });
    expect(patchSermon.status()).toBe(401);

    const deleteSermon = await request.delete("/api/sermons/does-not-exist");
    expect(deleteSermon.status()).toBe(401);

    const publicList = await request.get("/api/sermons");
    expect(publicList.ok()).toBeTruthy();

    const cron = await request.get("/api/cron/visitor-reminders");
    expect(cron.status()).toBe(401);

    const cronOk = await request.get("/api/cron/visitor-reminders", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET || "local-cron-secret"}` },
    });
    expect(cronOk.ok()).toBeTruthy();
  });
});
