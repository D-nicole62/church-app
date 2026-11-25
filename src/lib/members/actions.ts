"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { formatHouseholdName } from "@/lib/households/display";
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
    newHouseholdName: formData.get("newHouseholdName")?.toString().trim() || null,
    householdRole: formData.get("householdRole")?.toString().trim() || null,
    includesHousehold: formData.has("householdId") || formData.has("newHouseholdName"),
    cellGroupId: formData.get("cellGroupId")?.toString().trim() || null,
    ministryGroupId: formData.get("ministryGroupId")?.toString().trim() || null,
    dateOfBirthRaw: formData.get("dateOfBirth")?.toString().trim() || null,
    baptismDateRaw: formData.get("baptismDate")?.toString().trim() || null,
  };
}

function optionalDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

type GroupWriter = Pick<typeof prisma, "groupMembership">;

async function syncAssignedGroups(
  tx: GroupWriter,
  personId: string,
  previousGroupIds: Array<string | null>,
  nextGroupIds: Array<string | null>,
) {
  const next = new Set(nextGroupIds.filter((id): id is string => Boolean(id)));

  for (const previousId of previousGroupIds) {
    if (previousId && !next.has(previousId)) {
      await tx.groupMembership.deleteMany({
        where: { personId, groupId: previousId },
      });
    }
  }

  for (const groupId of next) {
    await tx.groupMembership.upsert({
      where: { groupId_personId: { groupId, personId } },
      create: { groupId, personId, role: "MEMBER" },
      update: {},
    });
  }
}

async function resolveHousehold(
  tx: Pick<typeof prisma, "household">,
  input: { householdId: string | null; newHouseholdName: string | null },
) {
  if (input.newHouseholdName) {
    const household = await tx.household.create({
      data: { name: formatHouseholdName(input.newHouseholdName) },
    });
    return { householdId: household.id, created: true };
  }
  return { householdId: input.householdId, created: false };
}

export async function createMemberAction(formData: FormData) {
  await requireAdmin();
  const data = memberFormData(formData);

  if (!data.firstName || !data.lastName || !data.campusId) {
    redirect("/admin/members/new?error=missing-required");
  }

  const membershipNumber = await generateMembershipNumber();
  const dateOfBirth = optionalDate(data.dateOfBirthRaw);
  const baptismDate = optionalDate(data.baptismDateRaw);

  const member = await prisma.$transaction(async (tx) => {
    const household = await resolveHousehold(tx, data);
    const person = await tx.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth,
        campusId: data.campusId,
        householdId: household.householdId,
        householdRole: household.householdId
          ? data.householdRole || (household.created ? "head" : null)
          : null,
      },
    });

    await syncAssignedGroups(tx, person.id, [], [data.cellGroupId, data.ministryGroupId]);

    return tx.member.create({
      data: {
        personId: person.id,
        membershipNumber,
        cellGroupId: data.cellGroupId,
        ministryGroupId: data.ministryGroupId,
        baptismDate,
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
  revalidatePath("/admin/groups");
  revalidatePath("/admin/households");
  redirect(`/admin/members/${member.id}?success=created`);
}

export async function updateMemberAction(memberId: string, formData: FormData) {
  await requireAdmin();
  const data = memberFormData(formData);

  if (!data.firstName || !data.lastName || !data.campusId) {
    redirect(`/admin/members/${memberId}?error=missing-required`);
  }

  const dateOfBirth = optionalDate(data.dateOfBirthRaw);
  const baptismDate = optionalDate(data.baptismDateRaw);

  const member = await prisma.$transaction(async (tx) => {
    const existing = await tx.member.findUniqueOrThrow({
      where: { id: memberId },
      select: { personId: true, cellGroupId: true, ministryGroupId: true },
    });

    const household = data.includesHousehold ? await resolveHousehold(tx, data) : null;

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
        ...(household
          ? {
              householdId: household.householdId,
              householdRole: household.householdId
                ? data.householdRole || (household.created ? "head" : null)
                : null,
            }
          : {}),
      },
    });

    await syncAssignedGroups(
      tx,
      existing.personId,
      [existing.cellGroupId, existing.ministryGroupId],
      [data.cellGroupId, data.ministryGroupId],
    );

    return tx.member.update({
      where: { id: memberId },
      data: {
        cellGroupId: data.cellGroupId,
        ministryGroupId: data.ministryGroupId,
        baptismDate,
      },
    });
  });

  await queueSageSync("member", member.id, {
    action: "update",
    membershipNumber: member.membershipNumber,
  });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/groups");
  revalidatePath("/admin/households");
  redirect(`/admin/members/${memberId}?success=updated`);
}

export async function convertVisitorToMemberAction(visitorId: string) {
  await requireAdmin();
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

export async function deleteMemberAction(memberId: string) {
  await requireAdmin();
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { person: { include: { visitor: true } } },
  });
  if (!member) {
    redirect("/admin/members?error=not-found");
  }

  if (member.person.visitor) {
    await prisma.member.delete({ where: { id: memberId } });
  } else {
    await prisma.person.delete({ where: { id: member.personId } });
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin/groups");
  revalidatePath("/admin/households");
  redirect("/admin/members?success=deleted");
}
