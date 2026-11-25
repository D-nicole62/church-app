"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { SermonMediaType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function sermonFormData(formData: FormData) {
  const mediaTypeRaw = formData.get("mediaType")?.toString();
  const mediaType =
    mediaTypeRaw === SermonMediaType.AUDIO
      ? SermonMediaType.AUDIO
      : SermonMediaType.VIDEO;
  const dateRaw = formData.get("date")?.toString().trim() ?? "";

  return {
    title: formData.get("title")?.toString().trim() ?? "",
    speaker: formData.get("speaker")?.toString().trim() || null,
    date: dateRaw ? new Date(`${dateRaw}T12:00:00`) : null,
    description: formData.get("description")?.toString().trim() || null,
    mediaType,
    mediaUrl: formData.get("mediaUrl")?.toString().trim() ?? "",
  };
}

export async function createSermonAction(formData: FormData) {
  await requireAdmin();
  const data = sermonFormData(formData);
  if (!data.title || !data.mediaUrl || !data.date || Number.isNaN(data.date.getTime())) {
    redirect("/admin/sermons/new?error=missing-required");
  }

  const sermon = await prisma.sermon.create({
    data: {
      title: data.title,
      speaker: data.speaker,
      date: data.date,
      description: data.description,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
    },
  });

  revalidatePath("/admin/sermons");
  revalidatePath("/sermons");
  redirect(`/admin/sermons/${sermon.id}?success=created`);
}

export async function updateSermonAction(sermonId: string, formData: FormData) {
  await requireAdmin();
  const data = sermonFormData(formData);
  if (!data.title || !data.mediaUrl || !data.date || Number.isNaN(data.date.getTime())) {
    redirect(`/admin/sermons/${sermonId}?error=missing-required`);
  }

  await prisma.sermon.update({
    where: { id: sermonId },
    data: {
      title: data.title,
      speaker: data.speaker,
      date: data.date,
      description: data.description,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
    },
  });

  revalidatePath("/admin/sermons");
  revalidatePath(`/admin/sermons/${sermonId}`);
  revalidatePath("/sermons");
  redirect(`/admin/sermons/${sermonId}?success=updated`);
}

export async function deleteSermonAction(sermonId: string) {
  await requireAdmin();
  await prisma.sermon.delete({ where: { id: sermonId } });
  revalidatePath("/admin/sermons");
  revalidatePath("/sermons");
  redirect("/admin/sermons?success=deleted");
}
