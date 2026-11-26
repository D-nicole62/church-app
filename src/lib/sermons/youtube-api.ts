import { YOUTUBE_CHANNEL_ID, YOUTUBE_UPLOADS_PLAYLIST_ID } from "@/lib/site";
import { isYouTubeVideoId, youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/sermons/media";
import type { YouTubeVideo } from "@/lib/sermons/youtube-feed";

export const YOUTUBE_PAGE_SIZE = 24;

export type LiveStream = {
  id: string;
  title: string;
};

export type YouTubePage = {
  videos: YouTubeVideo[];
  nextPageToken: string | null;
};

const PAGE_TOKEN = /^[A-Za-z0-9_\-=]{1,400}$/;

export function sanitizePageToken(value: string | undefined | null) {
  if (!value) return null;
  const token = value.trim();
  return PAGE_TOKEN.test(token) ? token : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function thumbnailFromSnippet(snippet: Record<string, unknown> | null, videoId: string) {
  const thumbs = asRecord(snippet?.thumbnails);
  const high = asString(asRecord(thumbs?.high)?.url);
  const medium = asString(asRecord(thumbs?.medium)?.url);
  const standard = asString(asRecord(thumbs?.standard)?.url);
  const candidate = high || medium || standard;
  if (candidate.startsWith("https://i.ytimg.com/") || candidate.startsWith("https://img.youtube.com/")) {
    return candidate;
  }
  return youtubeThumbnailUrl(videoId);
}

function videoFromSnippet(
  videoId: string,
  snippet: Record<string, unknown> | null,
  publishedAt: string,
): YouTubeVideo | null {
  if (!isYouTubeVideoId(videoId) || !snippet) return null;
  const title = asString(snippet.title);
  const published = new Date(publishedAt);
  if (!title || title === "Private video" || title === "Deleted video") return null;
  if (Number.isNaN(published.getTime())) return null;
  return {
    id: videoId,
    title,
    description: asString(snippet.description),
    publishedAt: published.toISOString(),
    thumbnailUrl: thumbnailFromSnippet(snippet, videoId),
    url: youtubeWatchUrl(videoId),
  };
}

export function playlistItemsUrl(apiKey: string, pageToken: string | null) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", YOUTUBE_UPLOADS_PLAYLIST_ID);
  url.searchParams.set("maxResults", String(YOUTUBE_PAGE_SIZE));
  if (pageToken) url.searchParams.set("pageToken", pageToken);
  url.searchParams.set("key", apiKey);
  return url.toString();
}

export function liveSearchUrl(apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", YOUTUBE_CHANNEL_ID);
  url.searchParams.set("eventType", "live");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", apiKey);
  return url.toString();
}

export function videoListUrl(apiKey: string, videoId: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);
  return url.toString();
}

export function mapPlaylistItems(payload: unknown): YouTubePage {
  const body = asRecord(payload);
  const items = Array.isArray(body?.items) ? body.items : [];
  const videos: YouTubeVideo[] = [];

  for (const item of items) {
    const record = asRecord(item);
    const snippet = asRecord(record?.snippet);
    const content = asRecord(record?.contentDetails);
    const resource = asRecord(snippet?.resourceId);
    const videoId = asString(content?.videoId) || asString(resource?.videoId);
    const publishedAt = asString(content?.videoPublishedAt) || asString(snippet?.publishedAt);
    const video = videoFromSnippet(videoId, snippet, publishedAt);
    if (video) videos.push(video);
  }

  const nextPageToken = asString(body?.nextPageToken);
  return {
    videos,
    nextPageToken: sanitizePageToken(nextPageToken),
  };
}

export function mapVideoList(payload: unknown): YouTubeVideo | null {
  const body = asRecord(payload);
  const items = Array.isArray(body?.items) ? body.items : [];
  const first = asRecord(items[0]);
  if (!first) return null;
  const snippet = asRecord(first.snippet);
  return videoFromSnippet(asString(first.id), snippet, asString(snippet?.publishedAt));
}

export function mapLiveBroadcast(payload: unknown): LiveStream | null {
  const body = asRecord(payload);
  const items = Array.isArray(body?.items) ? body.items : [];
  for (const item of items) {
    const record = asRecord(item);
    const snippet = asRecord(record?.snippet);
    const id = asRecord(record?.id);
    const videoId = asString(id?.videoId);
    if (asString(snippet?.liveBroadcastContent) !== "live" || !isYouTubeVideoId(videoId)) {
      continue;
    }
    const title = asString(snippet?.title) || "Live service";
    return { id: videoId, title };
  }
  return null;
}
