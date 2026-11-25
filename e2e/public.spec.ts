import { expect, test } from "@playwright/test";
import { PUBLIC_PAGES } from "./helpers";

test.describe("public site", () => {
  for (const pageInfo of PUBLIC_PAGES) {
    test(`${pageInfo.path} renders`, async ({ page }) => {
      const response = await page.goto(pageInfo.path);
      expect(response?.ok()).toBeTruthy();
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        pageInfo.heading,
      );
      const footer = page.locator("footer");
      await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
      await expect(footer.getByRole("link", { name: "church@todassembly.com" })).toBeVisible();
    });
  }

  test("primary nav links and group menus reach real pages", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const direct = [
      ["Home", "/"],
      ["About", "/about"],
      ["Plan Your Visit", "/visit"],
      ["Events", "/events"],
      ["Sermons", "/sermons"],
      ["Children's Church", "/children"],
      ["Missions", "/missions"],
      ["Give", "/give"],
      ["Contact", "/contact"],
    ] as const;

    for (const [label, path] of direct) {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path === "/" ? "/$" : path}`));
    }

    await page.goto("/");
    await page.getByRole("button", { name: "Ministry clusters" }).click();
    await page.getByRole("link", { name: "Church Operations" }).click();
    await expect(page).toHaveURL(/\/groups#/);
    await expect(page.locator("#ministry-clusters")).toBeVisible();

    await page.goto("/");
    await page.getByRole("button", { name: "Cell church regions" }).click();
    await expect(page.getByRole("link", { name: "Central" })).toBeVisible();
    await page.getByRole("link", { name: "Central" }).click();
    await expect(page).toHaveURL(/\/groups#/);
  });

  test("mobile menu reaches Contact", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("footer social and phone links are present", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", /facebook\.com/);
    await expect(footer.getByRole("link", { name: "YouTube" })).toHaveAttribute("href", /youtube\.com/);
    await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    await expect(footer.getByRole("link", { name: /0977 819404/ })).toHaveAttribute("href", "tel:+260977819404");
  });

  test("legacy paths redirect to the current pages", async ({ request }) => {
    const redirects = [
      ["/giving", "/give"],
      ["/donate", "/give"],
      ["/plan-your-visit", "/visit"],
      ["/live", "/sermons"],
    ] as const;

    for (const [from, to] of redirects) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect([301, 308]).toContain(response.status());
      const location = response.headers().location ?? "";
      expect(location.endsWith(to)).toBeTruthy();
    }
  });

  test("unknown paths show the not-found page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /can't find that page/ })).toBeVisible();
    await page.getByRole("link", { name: "Go home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("sitemap and robots list the public site and hide admin", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapBody = await sitemap.text();
    for (const path of ["/about", "/visit", "/events", "/sermons", "/groups", "/give", "/contact", "/privacy"]) {
      expect(sitemapBody).toContain(path);
    }

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Disallow: /admin");
    expect(robotsBody).toContain("Disallow: /api/");
    expect(robotsBody).toContain("Sitemap:");
  });

  test("sermons page embeds the church YouTube uploads", async ({ page }) => {
    await page.goto("/sermons");
    const frame = page.locator('iframe[title*="YouTube"]');
    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/videoseries/);
    await expect(page.getByRole("link", { name: "Watch on YouTube" })).toBeVisible();
  });

  test("events page lists gatherings or a clear empty state", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Upcoming", exact: true })).toBeVisible();
    const empty = await page.getByText(/no upcoming events/i).count();
    const forms = await page.locator('input[name="eventId"]').count();
    expect(empty + forms).toBeGreaterThan(0);
  });
});
