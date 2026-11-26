import { expect, test } from "@playwright/test";
import { login } from "./helpers";

const widths = [390, 768, 1024, 1440] as const;

test.describe("sermons from the YouTube feed", () => {
  test("lists the mocked channel newest first", async ({ page }) => {
    await page.goto("/sermons");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Watch or listen to recent sermons",
    );
    await expect(page.getByRole("heading", { name: "Faith & Hope" })).toBeVisible();
    await expect(page.getByText("2 Nov 2026")).toBeVisible();
    await expect(page.getByText(/Lusaka & beyond/)).toBeVisible();

    const titles = await page.getByRole("heading", { level: 3 }).allTextContents();
    const channelTitles = titles.filter((title) =>
      title === "Sunday Service at TOD" || title === "God's Watchnight",
    );
    expect(channelTitles).toEqual(["Sunday Service at TOD", "God's Watchnight"]);
    await expect(page.getByText("A shorter note about the service in Lusaka.")).toBeVisible();
    await expect(page.getByText("18 Oct 2026")).toBeVisible();
    await expect(page.getByRole("link", { name: "Watch on YouTube" })).toBeVisible();
    await expect(page.locator('iframe[src*="videoseries"]')).toHaveCount(0);
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("plays the latest sermon in a lazy nocookie embed", async ({ page }) => {
    await page.goto("/sermons");
    const play = page.getByRole("link", { name: "Play Faith & Hope" });
    await expect(play).toBeVisible();
    await play.click();
    const frame = page.locator("iframe");
    await expect(frame).toHaveAttribute(
      "src",
      /https:\/\/www\.youtube-nocookie\.com\/embed\/abcd1234efg/,
    );
    await expect(frame).toHaveAttribute("title", "Faith & Hope");
    await expect(frame).toHaveAttribute("loading", "lazy");
  });

  test("a sermon page has share metadata and plays on click", async ({ page }) => {
    await page.goto("/sermons");
    await page.getByRole("link", { name: "Sunday Service at TOD" }).click();
    await expect(page).toHaveURL(/\/sermons\/zxcv0987bnm$/);
    await expect(page.getByRole("heading", { level: 1, name: "Sunday Service at TOD" })).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Sunday Service at TOD/,
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      "content",
      /A shorter note about the service in Lusaka/,
    );
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
      "content",
      /zxcv0987bnm/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/sermons\/zxcv0987bnm$/,
    );
    const jsonLd = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
      nodes.map((node) => node.textContent ?? ""),
    );
    expect(jsonLd.some((entry) => entry.includes("VideoObject"))).toBe(true);

    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("link", { name: "Play Sunday Service at TOD" }).click();
    await expect(page.locator("iframe")).toHaveAttribute(
      "src",
      /youtube-nocookie\.com\/embed\/zxcv0987bnm/,
    );
  });

  test("sermon list and detail stay within the viewport", async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/sermons", "/sermons/abcd1234efg"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(1);
      }
    }
  });

  test("unknown sermon ids show the not-found page", async ({ page }) => {
    const response = await page.goto("/sermons/not-a-real-video");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /can't find that page/ })).toBeVisible();
  });

  test("admin can add speaker, series, and scripture to a YouTube sermon", async ({ page }) => {
    await login(page);
    try {
      await page.goto("/admin/sermons");
      const youtubeRow = page
        .getByRole("table", { name: "YouTube sermons" })
        .locator("tr", { hasText: "Sunday Service at TOD" });
      const editDetails = youtubeRow.getByRole("link", { name: "Edit details" });
      if (await editDetails.count()) {
        await editDetails.click();
      } else {
        await youtubeRow.getByRole("button", { name: "Import" }).click();
      }
      await expect(page).toHaveURL(/\/admin\/sermons\/[^/]+$/);
      await page.locator('input[name="speaker"]').fill("Bishop Harrison Sakala");
      await page.locator('input[name="series"]').fill("Hebrews");
      await page.locator('input[name="scripture"]').fill("Hebrews 11:1");
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Sermon saved.")).toBeVisible();

      await page.goto("/sermons/zxcv0987bnm");
      await expect(page.getByText("Taught by Bishop Harrison Sakala")).toBeVisible();
      await expect(page.getByText("Series: Hebrews")).toBeVisible();
      await expect(page.getByText("Scripture: Hebrews 11:1")).toBeVisible();
    } finally {
      await page.goto("/admin/sermons");
      const published = page
        .getByRole("table", { name: "Published sermons" })
        .locator("tr", { hasText: "Sunday Service at TOD" });
      if (await published.count()) {
        await published.getByRole("link", { name: "Edit", exact: true }).click();
        await page.getByRole("button", { name: "Delete sermon" }).click();
        await expect(page.getByText("Sermon deleted.")).toBeVisible();
      }
      await page.goto("/sermons/zxcv0987bnm");
      await expect(page.getByText("Bishop Harrison Sakala")).toHaveCount(0);
    }
  });
});
