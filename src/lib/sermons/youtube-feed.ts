import { isYouTubeVideoId, youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/sermons/media";

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  url: string;
};

function decodeXml(value: string) {
  const cdata = value.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  if (cdata) return cdata[1].trim();
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number.parseInt(digits, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function tagText(block: string, tag: string) {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(pattern);
  if (!match) return null;
  const text = decodeXml(match[1]);
  return text || null;
}

function tagAttribute(block: string, tag: string, attribute: string) {
  const pattern = new RegExp(`<${tag}\\b[^>]*\\b${attribute}="([^"]*)"`, "i");
  const match = block.match(pattern);
  if (!match) return null;
  const value = decodeXml(match[1]);
  return value || null;
}

function entryVideoId(entry: string) {
  const explicit = tagText(entry, "yt:videoId");
  if (isYouTubeVideoId(explicit)) return explicit;
  const atomId = tagText(entry, "id");
  const fromAtom = atomId?.match(/^yt:video:([A-Za-z0-9_-]{11})$/);
  return fromAtom && isYouTubeVideoId(fromAtom[1]) ? fromAtom[1] : null;
}

export function parseYouTubeRss(xml: string): YouTubeVideo[] {
  if (!xml.includes("<feed") || !xml.includes("</feed>")) {
    throw new Error("YouTube feed was not a channel feed");
  }

  const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/g) ?? [];
  const videos: YouTubeVideo[] = [];

  for (const entry of entries) {
    const id = entryVideoId(entry);
    const title = tagText(entry, "title");
    const publishedRaw = tagText(entry, "published");
    if (!id || !title || !publishedRaw) continue;

    const published = new Date(publishedRaw);
    if (Number.isNaN(published.getTime())) continue;

    const description = tagText(entry, "media:description") ?? "";
    const thumbnail = tagAttribute(entry, "media:thumbnail", "url");

    videos.push({
      id,
      title,
      description,
      publishedAt: published.toISOString(),
      thumbnailUrl: thumbnail?.includes("i.ytimg.com") ? thumbnail : youtubeThumbnailUrl(id),
      url: youtubeWatchUrl(id),
    });
  }

  return videos;
}
