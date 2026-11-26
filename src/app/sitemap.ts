import type { MetadataRoute } from "next";
import { getSermonCatalog } from "@/lib/sermons/queries";
import { SITE_URL } from "@/lib/site";

const paths = [
  "/",
  "/about",
  "/visit",
  "/events",
  "/sermons",
  "/groups",
  "/children",
  "/missions",
  "/give",
  "/contact",
  "/privacy",
] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticEntries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  try {
    const catalog = await getSermonCatalog(null);
    const sermons = [catalog.featured, ...catalog.rest].flatMap((sermon) =>
      sermon
        ? [
            {
              url: `${SITE_URL}/sermons/${sermon.id}`,
              lastModified: sermon.date,
              changeFrequency: "monthly" as const,
              priority: 0.6,
            },
          ]
        : [],
    );
    return [...staticEntries, ...sermons];
  } catch {
    return staticEntries;
  }
}
