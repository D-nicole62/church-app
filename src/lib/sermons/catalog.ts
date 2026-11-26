import {
  extractYouTubeVideoId,
  isYouTubeVideoId,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/sermons/media";
import type { LiveStream } from "@/lib/sermons/youtube-api";
import type { YouTubeVideo } from "@/lib/sermons/youtube-feed";

export type ManualSermonInput = {
  id: string;
  title: string;
  speaker: string | null;
  series: string | null;
  scripture: string | null;
  date: Date;
  description: string | null;
  mediaType: "AUDIO" | "VIDEO";
  mediaUrl: string;
  youtubeVideoId: string | null;
};

export type PublicSermon = {
  id: string;
  dbId: string | null;
  youtubeId: string | null;
  title: string;
  speaker: string | null;
  series: string | null;
  scripture: string | null;
  date: Date;
  description: string | null;
  mediaType: "AUDIO" | "VIDEO";
  mediaUrl: string;
  thumbnailUrl: string | null;
};

export type SermonCatalog = {
  status: "ready" | "fallback" | "page-unavailable";
  isFirstPage: boolean;
  featured: PublicSermon | null;
  rest: PublicSermon[];
  live: LiveStream | null;
  nextPageToken: string | null;
};

export function manualYouTubeId(sermon: Pick<ManualSermonInput, "youtubeVideoId" | "mediaUrl">) {
  if (isYouTubeVideoId(sermon.youtubeVideoId)) return sermon.youtubeVideoId;
  return extractYouTubeVideoId(sermon.mediaUrl);
}

function blankToNull(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function publicSermonFromYouTube(
  video: YouTubeVideo,
  manual: ManualSermonInput | null,
): PublicSermon {
  const manualDescription = blankToNull(manual?.description);
  const manualTitle = blankToNull(manual?.title);
  return {
    id: video.id,
    dbId: manual?.id ?? null,
    youtubeId: video.id,
    title: manualTitle ?? video.title,
    speaker: blankToNull(manual?.speaker),
    series: blankToNull(manual?.series),
    scripture: blankToNull(manual?.scripture),
    date: manual?.date ?? new Date(video.publishedAt),
    description: manualDescription ?? blankToNull(video.description),
    mediaType: "VIDEO",
    mediaUrl: blankToNull(manual?.mediaUrl) ?? video.url,
    thumbnailUrl: youtubeThumbnailUrl(video.id),
  };
}

export function publicSermonFromManual(sermon: ManualSermonInput): PublicSermon {
  const youtubeId = manualYouTubeId(sermon);
  return {
    id: youtubeId ?? sermon.id,
    dbId: sermon.id,
    youtubeId,
    title: sermon.title,
    speaker: blankToNull(sermon.speaker),
    series: blankToNull(sermon.series),
    scripture: blankToNull(sermon.scripture),
    date: sermon.date,
    description: blankToNull(sermon.description),
    mediaType: sermon.mediaType,
    mediaUrl: sermon.mediaUrl,
    thumbnailUrl: youtubeId ? youtubeThumbnailUrl(youtubeId) : null,
  };
}

export function mergeSermons(
  videos: YouTubeVideo[],
  manual: ManualSermonInput[],
  options?: { includeUnmatchedManual?: boolean; hideManualMatches?: boolean },
) {
  const includeUnmatchedManual = options?.includeUnmatchedManual !== false;
  const manualByVideo = new Map<string, ManualSermonInput>();
  const withoutVideo: ManualSermonInput[] = [];

  for (const sermon of manual) {
    const videoId = manualYouTubeId(sermon);
    if (!videoId) {
      withoutVideo.push(sermon);
      continue;
    }
    const current = manualByVideo.get(videoId);
    if (!current || sermon.date.getTime() > current.date.getTime()) {
      manualByVideo.set(videoId, sermon);
    }
  }

  const seen = new Set<string>();
  const items: PublicSermon[] = [];
  for (const video of videos) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    if (options?.hideManualMatches && manualByVideo.has(video.id)) continue;
    items.push(publicSermonFromYouTube(video, manualByVideo.get(video.id) ?? null));
  }

  if (includeUnmatchedManual) {
    for (const sermon of withoutVideo) {
      items.push(publicSermonFromManual(sermon));
    }
    for (const [videoId, sermon] of manualByVideo) {
      if (seen.has(videoId)) continue;
      items.push(publicSermonFromManual(sermon));
    }
  }

  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items;
}

export function buildCatalog(
  youtube:
    | { ok: true; videos: YouTubeVideo[]; nextPageToken: string | null; live: LiveStream | null }
    | { ok: false },
  manual: ManualSermonInput[],
  pageToken: string | null,
): SermonCatalog {
  if (!youtube.ok) {
    if (pageToken) {
      return {
        status: "page-unavailable",
        isFirstPage: false,
        featured: null,
        rest: [],
        live: null,
        nextPageToken: null,
      };
    }
    return {
      status: "fallback",
      isFirstPage: true,
      featured: null,
      rest: mergeSermons([], manual),
      live: null,
      nextPageToken: null,
    };
  }

  const isFirstPage = !pageToken;
  const sermons = mergeSermons(youtube.videos, manual, {
    includeUnmatchedManual: isFirstPage,
    hideManualMatches: !isFirstPage,
  });

  if (!isFirstPage) {
    return {
      status: "ready",
      isFirstPage: false,
      featured: null,
      rest: sermons,
      live: null,
      nextPageToken: youtube.nextPageToken,
    };
  }

  return {
    status: "ready",
    isFirstPage: true,
    featured: sermons[0] ?? null,
    rest: sermons.slice(1),
    live: youtube.live,
    nextPageToken: youtube.nextPageToken,
  };
}

export function watchUrlFor(sermon: Pick<PublicSermon, "youtubeId" | "mediaUrl">) {
  return sermon.youtubeId ? youtubeWatchUrl(sermon.youtubeId) : sermon.mediaUrl;
}
