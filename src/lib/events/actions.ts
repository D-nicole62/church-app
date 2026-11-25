"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { parseChurchDateTimeLocal } from "@/lib/events/datetime";
import { saveUploadedImage } from "@/lib/notifications/images";
import { prisma } from "@/lib/prisma";
import { isValidEmail, isValidZambianPhone } from "@/lib/validation/contact";

function eventFormData(formData: FormData) {
  const startsAtRaw = formData.get("startsAt")?.toString().trim() ?? "";
  const endsAtRaw = formData.get("endsAt")?.toString().trim() || null;

  return {
    title: formData.get("title")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() || null,
    location: formData.get("location")?.toString().trim() || null,
    campusId: formData.get("campusId")?.toString().trim() || null,
    isFeatured: formData.get("isFeatured") === "on",
    startsAt: parseChurchDateTimeLocal(startsAtRaw),
    endsAt: endsAtRaw ? parseChurchDateTimeLocal(endsAtRaw) : null,
  };
}

async function uploadedEventImage(formData: FormData, returnPath: string) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  try {
    return await saveUploadedImage(file, "events");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload the image.";
    redirect(`${returnPath}?error=invalid-image&detail=${encodeURIComponent(message)}`);
  }
}

export async function createEventAction(formData: FormData) {
  await requireAdmin();
  const data = eventFormData(formData);
  if (!data.title || !data.startsAt) {
    redirect("/admin/events/new?error=missing-required");
  }

  const imageUrl = await uploadedEventImage(formData, "/admin/events/new");

  await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      imageUrl,
      campusId: data.campusId,
      isFeatured: data.isFeatured,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events?success=created");
}

export async function updateEventAction(eventId: string, formData: FormData) {
  await requireAdmin();
  const data = eventFormData(formData);
  if (!data.title || !data.startsAt) {
    redirect(`/admin/events/${eventId}?error=missing-required`);
  }

  const uploaded = await uploadedEventImage(formData, `/admin/events/${eventId}`);
  const removeImage = formData.get("removeImage") === "on";
  const imageUrl = uploaded ?? (removeImage ? null : undefined);

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      campusId: data.campusId,
      isFeatured: data.isFeatured,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events?success=updated");
}

export async function deleteEventAction(eventId: string) {
  await requireAdmin();
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events?success=deleted");
}

export async function rsvpToEventAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString().trim();
  const firstName = formData.get("firstName")?.toString().trim() ?? "";
  const lastName = formData.get("lastName")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() || null;
  const phone = formData.get("phone")?.toString().trim() || null;

  if (!eventId || !firstName || !lastName || (!email && !phone)) {
    redirect("/events?error=rsvp-invalid");
  }

  if (phone && !isValidZambianPhone(phone)) {
    redirect("/events?error=invalid-phone");
  }

  if (email && !isValidEmail(email)) {
    redirect("/events?error=invalid-email");
  }

  await prisma.$transaction(async (tx) => {
    const person = await tx.person.create({
      data: { firstName, lastName, email, phone },
    });

    await tx.eventRSVP.create({
      data: { eventId, personId: person.id },
    });
  });

  redirect("/events?success=rsvp");
}
