import { expect, test } from "@playwright/test";

const PAYMENT_ROUTES = [
  ["POST", "/api/giving"],
  ["GET", "/api/giving"],
  ["PUT", "/api/giving"],
  ["PATCH", "/api/giving"],
  ["DELETE", "/api/giving"],
  ["GET", "/api/giving/status?referenceId=test"],
  ["POST", "/api/giving/status"],
  ["POST", "/api/giving/outcome"],
  ["GET", "/api/giving/outcome"],
] as const;

test.describe("online payments disabled", () => {
  test("Give page explains that online giving is coming soon", async ({ page }) => {
    await page.goto("/give");
    await expect(page.getByTestId("online-giving-paused")).toBeVisible();
    await expect(page.getByText("Online giving is coming soon")).toBeVisible();
    await expect(page.getByText(/give in person during Sunday services/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact the church" }).first()).toBeVisible();
    await expect(page.getByText("Lipila")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /payment/i })).toHaveCount(0);
    await expect(page.locator('input[name="amount"]')).toHaveCount(0);
  });

  test("payment API routes return 503 and do not start a charge", async ({ request }) => {
    for (const [method, path] of PAYMENT_ROUTES) {
      const response = await request.fetch(path, {
        method,
        data: { type: "momo", data: { amount: 10 } },
        headers: { "content-type": "application/json" },
      });
      expect(response.status(), `${method} ${path}`).toBe(503);
      const body = (await response.json()) as { code?: string; enabled?: boolean; error?: string };
      expect(body.code).toBe("PAYMENTS_DISABLED");
      expect(body.enabled).toBe(false);
      expect(body.error).toMatch(/turned off/i);
    }
  });
});
