"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseChurchDateTimeLocal } from "@/lib/events/datetime";
import { prisma } from "@/lib/prisma";

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

export async function createEventAction(formData: FormData) {
  const data = eventFormData(formData);
  if (!data.title || !data.startsAt) {
    redirect("/admin/events/new?error=missing-required");
  }

  await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
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
  const data = eventFormData(formData);
  if (!data.title || !data.startsAt) {
    redirect(`/admin/events/${eventId}?error=missing-required`);
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
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
