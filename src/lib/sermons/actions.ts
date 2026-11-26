"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SermonMediaType } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { extractYouTubeVideoId, isYouTubeVideoId } from "@/lib/sermons/media";
import { createStoredSermon, updateStoredSermon } from "@/lib/sermons/store";
import { getManualSermons, sermonVideoIds } from "@/lib/sermons/queries";
import { findYouTubeVideo, loadYouTubeCatalog } from "@/lib/sermons/youtube";
import { manualYouTubeId } from "@/lib/sermons/catalog";

function optionalText(formData: FormData, name: string) {
  const value = formData.get(name)?.toString().trim() ?? "";
  return value || null;
}

function isUniqueConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function sermonFormData(formData: FormData) {
  const mediaTypeRaw = formData.get("mediaType")?.toString();
  const mediaType =
    mediaTypeRaw === SermonMediaType.AUDIO
      ? SermonMediaType.AUDIO
      : SermonMediaType.VIDEO;
  const dateRaw = formData.get("date")?.toString().trim() ?? "";
  const mediaUrl = formData.get("mediaUrl")?.toString().trim() ?? "";

  return {
    title: formData.get("title")?.toString().trim() ?? "",
    speaker: optionalText(formData, "speaker"),
    series: optionalText(formData, "series"),
    scripture: optionalText(formData, "scripture"),
    date: dateRaw ? new Date(`${dateRaw}T12:00:00`) : null,
    description: optionalText(formData, "description"),
    mediaType,
    mediaUrl,
    youtubeVideoId: extractYouTubeVideoId(mediaUrl),
  };
}

function revalidateSermons() {
  revalidatePath("/admin/sermons");
  revalidatePath("/sermons");
  revalidatePath("/sermons/[id]", "page");
}

async function existingSermonForVideo(videoId: string) {
  const sermons = await getManualSermons();
  return sermons.find((sermon) => manualYouTubeId(sermon) === videoId) ?? null;
}

export async function createSermonAction(formData: FormData) {
  await requireAdmin();
  const data = sermonFormData(formData);
  if (!data.title || !data.mediaUrl || !data.date || Number.isNaN(data.date.getTime())) {
    redirect("/admin/sermons/new?error=missing-required");
  }

  const date = data.date;
  let sermonId: string;
  let schemaLimited = false;
  try {
    const created = await createStoredSermon({ ...data, date });
    sermonId = created.sermon.id;
    schemaLimited = created.schemaLimited;
  } catch (error) {
    if (isUniqueConflict(error)) {
      redirect("/admin/sermons/new?error=duplicate-video");
    }
    throw error;
  }

  revalidateSermons();
  const schema = schemaLimited ? "&schema=pending" : "";
  redirect(`/admin/sermons/${sermonId}?success=created${schema}`);
}

export async function updateSermonAction(sermonId: string, formData: FormData) {
  await requireAdmin();
  const data = sermonFormData(formData);
  if (!data.title || !data.mediaUrl || !data.date || Number.isNaN(data.date.getTime())) {
    redirect(`/admin/sermons/${sermonId}?error=missing-required`);
  }

  const date = data.date;
  let schemaLimited = false;
  try {
    const updated = await updateStoredSermon(sermonId, { ...data, date });
    schemaLimited = updated.schemaLimited;
  } catch (error) {
    if (isUniqueConflict(error)) {
      redirect(`/admin/sermons/${sermonId}?error=duplicate-video`);
    }
    throw error;
  }

  revalidateSermons();
  revalidatePath(`/admin/sermons/${sermonId}`);
  const schema = schemaLimited ? "&schema=pending" : "";
  redirect(`/admin/sermons/${sermonId}?success=updated${schema}`);
}

export async function deleteSermonAction(sermonId: string) {
  await requireAdmin();
  await prisma.sermon.delete({ where: { id: sermonId } });
  revalidateSermons();
  redirect("/admin/sermons?success=deleted");
}

export async function importYouTubeSermonAction(formData: FormData) {
  await requireAdmin();
  const videoId = formData.get("videoId")?.toString().trim() ?? "";
  if (!isYouTubeVideoId(videoId)) {
    redirect("/admin/sermons?error=unknown-video");
  }

  const existing = await existingSermonForVideo(videoId);
  if (existing) {
    redirect(`/admin/sermons/${existing.id}`);
  }

  const video = await findYouTubeVideo(videoId);
  if (!video) {
    redirect("/admin/sermons?error=unknown-video");
  }

  let sermonId: string;
  let schemaLimited = false;
  try {
    const created = await createStoredSermon({
      title: video.title,
      speaker: null,
      series: null,
      scripture: null,
      date: new Date(video.publishedAt),
      description: video.description.trim() || null,
      mediaType: SermonMediaType.VIDEO,
      mediaUrl: video.url,
      youtubeVideoId: video.id,
    });
    sermonId = created.sermon.id;
    schemaLimited = created.schemaLimited;
  } catch (error) {
    if (isUniqueConflict(error)) {
      const again = await existingSermonForVideo(videoId);
      if (again) redirect(`/admin/sermons/${again.id}`);
    }
    throw error;
  }

  revalidateSermons();
  const schema = schemaLimited ? "&schema=pending" : "";
  redirect(`/admin/sermons/${sermonId}?success=imported${schema}`);
}

export async function syncYouTubeSermonsAction() {
  await requireAdmin();
  const catalog = await loadYouTubeCatalog(null);
  if (!catalog.ok) {
    redirect("/admin/sermons?error=youtube-unavailable");
  }

  const known = sermonVideoIds(await getManualSermons());
  let imported = 0;

  for (const video of catalog.videos) {
    if (known.has(video.id)) continue;
    try {
      await createStoredSermon({
        title: video.title,
        speaker: null,
        series: null,
        scripture: null,
        date: new Date(video.publishedAt),
        description: video.description.trim() || null,
        mediaType: SermonMediaType.VIDEO,
        mediaUrl: video.url,
        youtubeVideoId: video.id,
      });
      known.add(video.id);
      imported += 1;
    } catch (error) {
      if (isUniqueConflict(error)) continue;
      throw error;
    }
  }

  revalidateSermons();
  redirect(`/admin/sermons?success=synced&count=${imported}`);
}
