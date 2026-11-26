import { type Sermon, type SermonMediaType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isMissingColumnError } from "@/lib/sermons/schema-error";

const legacySelect = {
  id: true,
  title: true,
  speaker: true,
  date: true,
  description: true,
  mediaType: true,
  mediaUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

type LegacySermon = Omit<Sermon, "series" | "scripture" | "youtubeVideoId">;

function withEmptyYouTubeFields(row: LegacySermon): Sermon {
  return {
    ...row,
    series: null,
    scripture: null,
    youtubeVideoId: null,
  };
}

export type SermonWrite = {
  title: string;
  speaker: string | null;
  series: string | null;
  scripture: string | null;
  date: Date;
  description: string | null;
  mediaType: SermonMediaType;
  mediaUrl: string;
  youtubeVideoId: string | null;
};

function legacyWrite(data: SermonWrite) {
  return {
    title: data.title,
    speaker: data.speaker,
    date: data.date,
    description: data.description,
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl,
  };
}

export async function listStoredSermons() {
  try {
    return await prisma.sermon.findMany({ orderBy: { date: "desc" } });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    const rows = await prisma.sermon.findMany({
      orderBy: { date: "desc" },
      select: legacySelect,
    });
    return rows.map(withEmptyYouTubeFields);
  }
}

export async function findStoredSermon(id: string) {
  try {
    return await prisma.sermon.findUnique({ where: { id } });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    const row = await prisma.sermon.findUnique({
      where: { id },
      select: legacySelect,
    });
    return row ? withEmptyYouTubeFields(row) : null;
  }
}

export async function createStoredSermon(data: SermonWrite) {
  try {
    const sermon = await prisma.sermon.create({ data });
    return { sermon, schemaLimited: false };
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    const sermon = await prisma.sermon.create({ data: legacyWrite(data) });
    return { sermon: withEmptyYouTubeFields(sermon), schemaLimited: true };
  }
}

export async function updateStoredSermon(id: string, data: SermonWrite) {
  try {
    const sermon = await prisma.sermon.update({ where: { id }, data });
    return { sermon, schemaLimited: false };
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    const sermon = await prisma.sermon.update({
      where: { id },
      data: legacyWrite(data),
    });
    return { sermon: withEmptyYouTubeFields(sermon), schemaLimited: true };
  }
}
