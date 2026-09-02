"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  FollowUpChannel,
  VisitorStatus,
} from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

function optionalId(value: string | null) {
  return value && value.length > 0 ? value : null;
}

function parseOptionalDate(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function visitorIntakeFromForm(formData: FormData) {
  const numberOfChildrenRaw = formData.get("numberOfChildren")?.toString().trim();
  const numberOfChildren = numberOfChildrenRaw
    ? Number.parseInt(numberOfChildrenRaw, 10)
    : null;

  return {
    firstName: formData.get("firstName")?.toString().trim() ?? "",
    lastName: formData.get("lastName")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() || null,
    phone: formData.get("phone")?.toString().trim() || null,
    gender: formData.get("gender")?.toString().trim() || null,
    dateOfBirthRaw: formData.get("dateOfBirth")?.toString().trim() || null,
    residentialArea: formData.get("residentialArea")?.toString().trim() || null,
    campusId: optionalId(formData.get("campusId")?.toString().trim() || null),
    invitedBy: formData.get("invitedBy")?.toString().trim() || null,
    serviceTime: formData.get("serviceTime")?.toString().trim() || null,
    prayerRequest: formData.get("prayerRequest")?.toString().trim() || null,
    interestedMinistry:
      formData.get("interestedMinistry")?.toString().trim() || null,
    attendingWithChildren: formData.get("attendingWithChildren") === "on",
    numberOfChildren: Number.isNaN(numberOfChildren)
      ? null
      : numberOfChildren,
    howDidYouHear: formData.get("howDidYouHear")?.toString().trim() || null,
    notes: formData.get("notes")?.toString().trim() || null,
  };
}

async function saveVisitorToLegacySupabase(
  data: ReturnType<typeof visitorIntakeFromForm>,
) {
  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from("visitors").insert({
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    service_time: data.serviceTime,
    attending_with_children: data.attendingWithChildren,
    number_of_children: data.numberOfChildren,
    how_did_you_hear: data.howDidYouHear,
    notes: data.notes,
  });

  return !error;
}

async function createVisitorRecord(
  data: ReturnType<typeof visitorIntakeFromForm>,
  dateOfBirth: Date | null,
) {
  // Avoid prisma.$transaction — Supabase poolers can time out starting transactions (P2028).
  const person = await prisma.person.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      dateOfBirth,
      campusId: data.campusId,
    },
  });

  try {
    await prisma.visitor.create({
      data: {
        personId: person.id,
        residentialArea: data.residentialArea,
        invitedBy: data.invitedBy,
        firstVisitDate: new Date(),
        serviceAttended: data.serviceTime,
        prayerRequest: data.prayerRequest,
        interestedMinistry: data.interestedMinistry,
        attendingWithChildren: data.attendingWithChildren,
        numberOfChildren: data.numberOfChildren,
        howDidYouHear: data.howDidYouHear,
        notes: data.notes,
      },
    });
  } catch (error) {
    await prisma.person.delete({ where: { id: person.id } }).catch(() => {});
    throw error;
  }
}

export async function registerVisitorAction(formData: FormData) {
  const data = visitorIntakeFromForm(formData);

  if (!data.firstName || !data.lastName || (!data.email && !data.phone)) {
    redirect("/visit?error=missing-required");
  }

  const dateOfBirth = parseOptionalDate(data.dateOfBirthRaw);

  if (!isDatabaseConfigured()) {
    const saved = await saveVisitorToLegacySupabase(data);
    redirect(saved ? "/visit?success=1" : "/visit?error=save-failed");
  }

  try {
    await createVisitorRecord(data, dateOfBirth);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[registerVisitorAction]", error);
    }
    redirect("/visit?error=save-failed");
  }

  revalidatePath("/admin/visitors");
  revalidatePath("/visit");
  redirect("/visit?success=1");
}

export async function updateVisitorStatusAction(
  visitorId: string,
  formData: FormData,
) {
  const statusRaw = formData.get("status")?.toString();
  const assignedOfficerId =
    formData.get("assignedOfficerId")?.toString().trim() || null;

  if (!statusRaw || !Object.values(VisitorStatus).includes(statusRaw as VisitorStatus)) {
    redirect(`/admin/visitors/${visitorId}?error=invalid-status`);
  }

  await prisma.visitor.update({
    where: { id: visitorId },
    data: {
      status: statusRaw as VisitorStatus,
      assignedOfficerId: assignedOfficerId || null,
    },
  });

  revalidatePath("/admin/visitors");
  revalidatePath(`/admin/visitors/${visitorId}`);
  redirect(`/admin/visitors/${visitorId}?success=updated`);
}

export async function addFollowUpAction(visitorId: string, formData: FormData) {
  const channelRaw = formData.get("channel")?.toString();
  const interactionDateRaw = formData.get("interactionDate")?.toString().trim();
  const outcome = formData.get("outcome")?.toString().trim() || null;
  const nextFollowUpRaw = formData.get("nextFollowUpDate")?.toString().trim();
  const officerId = formData.get("officerId")?.toString().trim() || null;

  if (
    !channelRaw ||
    !Object.values(FollowUpChannel).includes(channelRaw as FollowUpChannel) ||
    !interactionDateRaw
  ) {
    redirect(`/admin/visitors/${visitorId}?error=invalid-follow-up`);
  }

  await prisma.followUpInteraction.create({
    data: {
      visitorId,
      channel: channelRaw as FollowUpChannel,
      interactionDate: new Date(interactionDateRaw),
      outcome,
      nextFollowUpDate: nextFollowUpRaw ? new Date(nextFollowUpRaw) : null,
      officerId: officerId || null,
    },
  });

  await prisma.visitor.update({
    where: { id: visitorId },
    data: { status: VisitorStatus.IN_PROGRESS },
  });

  revalidatePath(`/admin/visitors/${visitorId}`);
  redirect(`/admin/visitors/${visitorId}?success=follow-up-added`);
}
