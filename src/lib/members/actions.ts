"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { queueSageSync } from "@/lib/integrations/sage";
import { generateMembershipNumber } from "@/lib/members/numbers";

function memberFormData(formData: FormData) {
  return {
    firstName: formData.get("firstName")?.toString().trim() ?? "",
    lastName: formData.get("lastName")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() || null,
    phone: formData.get("phone")?.toString().trim() || null,
    gender: formData.get("gender")?.toString().trim() || null,
    campusId: formData.get("campusId")?.toString().trim() || null,
    householdId: formData.get("householdId")?.toString().trim() || null,
    cellGroupId: formData.get("cellGroupId")?.toString().trim() || null,
    ministryGroupId: formData.get("ministryGroupId")?.toString().trim() || null,
    dateOfBirthRaw: formData.get("dateOfBirth")?.toString().trim() || null,
  };
}

export async function createMemberAction(formData: FormData) {
  const data = memberFormData(formData);

  if (!data.firstName || !data.lastName || !data.campusId) {
    redirect("/admin/members/new?error=missing-required");
  }

  const membershipNumber = await generateMembershipNumber();
  const dateOfBirth = data.dateOfBirthRaw ? new Date(data.dateOfBirthRaw) : null;

  const member = await prisma.$transaction(async (tx) => {
    const person = await tx.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth,
        campusId: data.campusId,
        householdId: data.householdId,
      },
    });

    return tx.member.create({
      data: {
        personId: person.id,
        membershipNumber,
        cellGroupId: data.cellGroupId,
        ministryGroupId: data.ministryGroupId,
      },
      include: { person: true },
    });
  });

  await queueSageSync("member", member.id, {
    membershipNumber: member.membershipNumber,
    firstName: member.person.firstName,
    lastName: member.person.lastName,
    email: member.person.email,
    phone: member.person.phone,
    campusId: member.person.campusId,
  });

  revalidatePath("/admin/members");
  redirect(`/admin/members/${member.id}?success=created`);
}

export async function updateMemberAction(memberId: string, formData: FormData) {
  const data = memberFormData(formData);

  if (!data.firstName || !data.lastName || !data.campusId) {
    redirect(`/admin/members/${memberId}?error=missing-required`);
  }

  const dateOfBirth = data.dateOfBirthRaw ? new Date(data.dateOfBirthRaw) : null;

  const member = await prisma.$transaction(async (tx) => {
    const existing = await tx.member.findUniqueOrThrow({
      where: { id: memberId },
      select: { personId: true },
    });

    await tx.person.update({
      where: { id: existing.personId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth,
        campusId: data.campusId,
        householdId: data.householdId,
      },
    });

    return tx.member.update({
      where: { id: memberId },
      data: {
        cellGroupId: data.cellGroupId,
        ministryGroupId: data.ministryGroupId,
      },
    });
  });

  await queueSageSync("member", member.id, {
    action: "update",
    membershipNumber: member.membershipNumber,
  });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  redirect(`/admin/members/${memberId}?success=updated`);
}

export async function convertVisitorToMemberAction(visitorId: string) {
  const visitor = await prisma.visitor.findUnique({
    where: { id: visitorId },
    include: { person: { include: { member: true } } },
  });

  if (!visitor) {
    redirect("/admin/visitors?error=not-found");
  }

  if (visitor.person.member) {
    redirect(`/admin/visitors/${visitorId}?error=already-member`);
  }

  const membershipNumber = await generateMembershipNumber();

  const member = await prisma.$transaction(async (tx) => {
    const created = await tx.member.create({
      data: {
        personId: visitor.personId,
        membershipNumber,
      },
    });

    await tx.visitor.update({
      where: { id: visitorId },
      data: { status: "MEMBER_REGISTERED" },
    });

    return created;
  });

  await queueSageSync("member", member.id, {
    source: "visitor-conversion",
    membershipNumber: member.membershipNumber,
    visitorId,
  });

  revalidatePath("/admin/visitors");
  revalidatePath("/admin/members");
  redirect(`/admin/members/${member.id}?success=converted`);
}
