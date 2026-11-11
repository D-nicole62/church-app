import { NextResponse } from "next/server";
import { SermonMediaType } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const sermon = await prisma.sermon.findUnique({ where: { id } });
  if (!sermon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(sermon);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: {
    title?: string;
    speaker?: string | null;
    date?: string;
    description?: string | null;
    mediaType?: string;
    mediaUrl?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await prisma.sermon.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const date = body.date ? new Date(body.date) : existing.date;
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const mediaType =
    body.mediaType === SermonMediaType.AUDIO || body.mediaType === SermonMediaType.VIDEO
      ? body.mediaType
      : existing.mediaType;

  const sermon = await prisma.sermon.update({
    where: { id },
    data: {
      title: body.title?.trim() || existing.title,
      speaker: body.speaker === undefined ? existing.speaker : body.speaker?.trim() || null,
      date,
      description:
        body.description === undefined
          ? existing.description
          : body.description?.trim() || null,
      mediaType,
      mediaUrl: body.mediaUrl?.trim() || existing.mediaUrl,
    },
  });

  return NextResponse.json(sermon);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    await prisma.sermon.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
