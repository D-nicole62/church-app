import { NextResponse } from "next/server";
import { SermonMediaType } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function parseSermonBody(body: {
  title?: string;
  speaker?: string | null;
  date?: string;
  description?: string | null;
  mediaType?: string;
  mediaUrl?: string;
}) {
  const title = body.title?.trim() ?? "";
  const mediaUrl = body.mediaUrl?.trim() ?? "";
  const date = body.date ? new Date(body.date) : null;
  const mediaType =
    body.mediaType === SermonMediaType.AUDIO
      ? SermonMediaType.AUDIO
      : body.mediaType === SermonMediaType.VIDEO
        ? SermonMediaType.VIDEO
        : null;

  if (!title || !mediaUrl || !date || Number.isNaN(date.getTime()) || !mediaType) {
    return null;
  }

  return {
    title,
    speaker: body.speaker?.trim() || null,
    date,
    description: body.description?.trim() || null,
    mediaType,
    mediaUrl,
  };
}

export async function GET() {
  const sermons = await prisma.sermon.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(sermons);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Parameters<typeof parseSermonBody>[0];
  try {
    body = (await request.json()) as Parameters<typeof parseSermonBody>[0];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = parseSermonBody(body);
  if (!data) {
    return NextResponse.json(
      { error: "Title, date, media type, and media URL are required." },
      { status: 400 },
    );
  }

  const sermon = await prisma.sermon.create({ data });
  return NextResponse.json(sermon, { status: 201 });
}
