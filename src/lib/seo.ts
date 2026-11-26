import type { Metadata } from "next";
import { CHURCH_NAME, SITE_URL } from "@/lib/site";

const SHARE_IMAGE = "/icons/og.png";

export function pageMetadata({
  title,
  description,
  path,
  image,
  openGraphType = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string; width?: number; height?: number };
  openGraphType?: "website" | "article" | "video.other";
}): Metadata {
  const absolute = title === CHURCH_NAME;
  const fullTitle = absolute ? CHURCH_NAME : `${title} | ${CHURCH_NAME}`;
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;

  return {
    title: absolute ? { absolute: CHURCH_NAME } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: CHURCH_NAME,
      type: openGraphType,
      images: [
        image
          ? {
              url: image.url,
              width: image.width,
              height: image.height,
              alt: image.alt,
            }
          : {
              url: SHARE_IMAGE,
              width: 1200,
              height: 630,
              alt: CHURCH_NAME,
            },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image?.url ?? SHARE_IMAGE],
    },
  };
}
