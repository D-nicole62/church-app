import { cache } from "react";
import { SermonMediaType, type Sermon } from "@/generated/prisma/client";
import { queryDatabase } from "@/lib/db";
import { listStoredSermons } from "@/lib/sermons/store";
import {
  buildCatalog,
  manualYouTubeId,
  publicSermonFromManual,
  publicSermonFromYouTube,
  type ManualSermonInput,
  type SermonCatalog,
} from "@/lib/sermons/catalog";
import { isYouTubeVideoId } from "@/lib/sermons/media";
import { findYouTubeVideo, loadYouTubeCatalog } from "@/lib/sermons/youtube";
import { sanitizePageToken } from "@/lib/sermons/youtube-api";

function toManual(sermon: Sermon): ManualSermonInput {
  return {
    id: sermon.id,
    title: sermon.title,
    speaker: sermon.speaker,
    series: sermon.series,
    scripture: sermon.scripture,
    date: sermon.date,
    description: sermon.description,
    mediaType: sermon.mediaType === SermonMediaType.AUDIO ? "AUDIO" : "VIDEO",
    mediaUrl: sermon.mediaUrl,
    youtubeVideoId: sermon.youtubeVideoId,
  };
}

export const getManualSermons = cache(async () => {
  const rows = await queryDatabase(async () => {
    try {
      return await listStoredSermons();
    } catch (error) {
      console.error("[sermons] Could not read saved sermons.");
      throw error;
    }
  }, [] as Sermon[]);
  return rows.map(toManual);
});

export const getSermonCatalog = cache(async (pageToken: string | null): Promise<SermonCatalog> => {
  const token = sanitizePageToken(pageToken);
  const [manual, youtube] = await Promise.all([
    getManualSermons(),
    loadYouTubeCatalog(token),
  ]);
  return buildCatalog(youtube, manual, token);
});

export const getSermonByPublicId = cache(async (id: string) => {
  const manual = await getManualSermons();
  const stored = manual.find((sermon) => sermon.id === id || manualYouTubeId(sermon) === id);

  if (isYouTubeVideoId(id)) {
    const video = await findYouTubeVideo(id);
    if (video) {
      const overlay = manual.find((sermon) => manualYouTubeId(sermon) === id) ?? null;
      return publicSermonFromYouTube(video, overlay);
    }
  }

  if (stored) return publicSermonFromManual(stored);
  return null;
});

export function sermonVideoIds(sermons: ManualSermonInput[]) {
  const ids = new Set<string>();
  for (const sermon of sermons) {
    const videoId = manualYouTubeId(sermon);
    if (videoId) ids.add(videoId);
  }
  return ids;
}
