import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { YOUTUBE_CHANNEL_ID } from "@/lib/site";
import { isYouTubeVideoId } from "@/lib/sermons/media";
import {
  liveSearchUrl,
  mapLiveBroadcast,
  mapPlaylistItems,
  mapVideoList,
  playlistItemsUrl,
  videoListUrl,
  type LiveStream,
} from "@/lib/sermons/youtube-api";
import { parseYouTubeRss, type YouTubeVideo } from "@/lib/sermons/youtube-feed";

const LIST_REVALIDATE_SECONDS = 60 * 60;
const LIVE_REVALIDATE_SECONDS = 15 * 60;
const FEED_MODE = process.env.YOUTUBE_FEED_FIXTURE?.trim() === "e2e" ? "e2e" : "live";

type Cached<T> = { ok: true; value: T } | { ok: false };

function youtubeApiKey() {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  return key || null;
}

async function fetchText(url: string, accept: string) {
  const response = await fetch(url, {
    headers: { accept },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`YouTube request failed (${response.status})`);
  }
  return response.text();
}

async function loadRssUncached(): Promise<Cached<YouTubeVideo[]>> {
  try {
    const xml =
      process.env.YOUTUBE_FEED_FIXTURE?.trim() === "e2e"
        ? await readFile(
            path.join(process.cwd(), "src/lib/sermons/fixtures/youtube-feed.xml"),
            "utf8",
          )
        : await fetchText(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(YOUTUBE_CHANNEL_ID)}`,
            "application/atom+xml, application/xml, text/xml, */*",
          );
    return { ok: true, value: parseYouTubeRss(xml) };
  } catch (error) {
    console.error("[youtube] Could not read the channel feed.");
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return { ok: false };
  }
}

async function loadApiPageUncached(pageToken: string): Promise<Cached<{ videos: YouTubeVideo[]; nextPageToken: string | null }>> {
  const apiKey = youtubeApiKey();
  if (!apiKey) return { ok: false };
  try {
    const json = await fetchText(
      playlistItemsUrl(apiKey, pageToken || null),
      "application/json",
    );
    return { ok: true, value: mapPlaylistItems(JSON.parse(json) as unknown) };
  } catch (error) {
    console.error("[youtube] Data API video list failed.");
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return { ok: false };
  }
}

async function loadLiveUncached(): Promise<Cached<LiveStream | null>> {
  const apiKey = youtubeApiKey();
  if (!apiKey) return { ok: true, value: null };
  try {
    const json = await fetchText(liveSearchUrl(apiKey), "application/json");
    return { ok: true, value: mapLiveBroadcast(JSON.parse(json) as unknown) };
  } catch (error) {
    console.error("[youtube] Live check failed.");
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return { ok: false };
  }
}

async function loadVideoUncached(videoId: string): Promise<Cached<YouTubeVideo | null>> {
  const apiKey = youtubeApiKey();
  if (!apiKey || !isYouTubeVideoId(videoId)) return { ok: false };
  try {
    const json = await fetchText(videoListUrl(apiKey, videoId), "application/json");
    return { ok: true, value: mapVideoList(JSON.parse(json) as unknown) };
  } catch (error) {
    console.error("[youtube] Could not load a video.");
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return { ok: false };
  }
}

const readCachedRss = unstable_cache(
  loadRssUncached,
  ["youtube-rss", YOUTUBE_CHANNEL_ID, FEED_MODE],
  { revalidate: LIST_REVALIDATE_SECONDS },
);

const readCachedApiPage = unstable_cache(
  loadApiPageUncached,
  ["youtube-api-page", YOUTUBE_CHANNEL_ID],
  { revalidate: LIST_REVALIDATE_SECONDS },
);

const readCachedLive = unstable_cache(loadLiveUncached, ["youtube-live", YOUTUBE_CHANNEL_ID], {
  revalidate: LIVE_REVALIDATE_SECONDS,
});

const readCachedVideo = unstable_cache(loadVideoUncached, ["youtube-video", YOUTUBE_CHANNEL_ID], {
  revalidate: LIST_REVALIDATE_SECONDS,
});

export type YouTubeCatalogResult =
  | {
      ok: true;
      videos: YouTubeVideo[];
      nextPageToken: string | null;
      live: LiveStream | null;
      source: "rss" | "api";
    }
  | { ok: false };

export async function loadYouTubeCatalog(pageToken: string | null): Promise<YouTubeCatalogResult> {
  if (youtubeApiKey()) {
    const page = await readCachedApiPage(pageToken ?? "");
    if (page.ok) {
      let live: LiveStream | null = null;
      if (!pageToken) {
        const cachedLive = await readCachedLive();
        if (cachedLive.ok) live = cachedLive.value;
      }
      return {
        ok: true,
        videos: page.value.videos,
        nextPageToken: page.value.nextPageToken,
        live,
        source: "api",
      };
    }
    if (pageToken) return { ok: false };
  } else if (pageToken) {
    return { ok: false };
  }

  const rss = await readCachedRss();
  if (!rss.ok) return { ok: false };
  return {
    ok: true,
    videos: rss.value,
    nextPageToken: null,
    live: null,
    source: "rss",
  };
}

export async function findYouTubeVideo(videoId: string): Promise<YouTubeVideo | null> {
  if (!isYouTubeVideoId(videoId)) return null;
  const rss = await readCachedRss();
  if (rss.ok) {
    const fromFeed = rss.value.find((video) => video.id === videoId);
    if (fromFeed) return fromFeed;
  }
  if (!youtubeApiKey()) return null;
  const video = await readCachedVideo(videoId);
  return video.ok ? video.value : null;
}
