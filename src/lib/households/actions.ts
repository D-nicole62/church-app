"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { formatHouseholdName } from "@/lib/households/display";
import { prisma } from "@/lib/prisma";

export async function createHouseholdAction(formData: FormData) {
  await requireAdmin();
  const rawName = formData.get("name")?.toString().trim() ?? "";
  if (!rawName) {
    redirect("/admin/households/new?error=missing-name");
  }
  const name = formatHouseholdName(rawName);

  const household = await prisma.household.create({ data: { name } });
  revalidatePath("/admin/households");
  revalidatePath("/admin/members");
  redirect(`/admin/households/${household.id}?success=created`);
}

export async function updateHouseholdAction(householdId: string, formData: FormData) {
  await requireAdmin();
  const rawName = formData.get("name")?.toString().trim() ?? "";
  if (!rawName) {
    redirect(`/admin/households/${householdId}?error=missing-name`);
  }
  const name = formatHouseholdName(rawName);

  await prisma.household.update({
    where: { id: householdId },
    data: { name },
  });
  revalidatePath("/admin/households");
  revalidatePath(`/admin/households/${householdId}`);
  redirect(`/admin/households/${householdId}?success=updated`);
}

export async function deleteHouseholdAction(householdId: string) {
  await requireAdmin();
  await prisma.household.delete({ where: { id: householdId } });
  revalidatePath("/admin/households");
  revalidatePath("/admin/members");
  redirect("/admin/households?success=deleted");
}

export async function attachMemberToHouseholdAction(
  householdId: string,
  formData: FormData,
) {
  await requireAdmin();
  const memberId = formData.get("memberId")?.toString().trim();
  if (!memberId) {
    redirect(`/admin/households/${householdId}?error=missing-member`);
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { personId: true },
  });
  if (!member) {
    redirect(`/admin/households/${householdId}?error=missing-member`);
  }

  const householdRole = formData.get("householdRole")?.toString().trim() || "member";

  await prisma.person.update({
    where: { id: member.personId },
    data: { householdId, householdRole },
  });

  revalidatePath("/admin/households");
  revalidatePath(`/admin/households/${householdId}`);
  revalidatePath("/admin/members");
  redirect(`/admin/households/${householdId}?success=member-added`);
}

export async function removeMemberFromHouseholdAction(
  householdId: string,
  personId: string,
) {
  await requireAdmin();
  await prisma.person.update({
    where: { id: personId },
    data: { householdId: null, householdRole: null },
  });
  revalidatePath("/admin/households");
  revalidatePath(`/admin/households/${householdId}`);
  revalidatePath("/admin/members");
  redirect(`/admin/households/${householdId}?success=member-removed`);
}

export async function assignHouseholdFromProfileAction(
  memberId: string,
  formData: FormData,
) {
  await requireAdmin();
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { personId: true },
  });
  if (!member) {
    redirect("/admin/members");
  }

  const newName = formData.get("newHouseholdName")?.toString().trim() ?? "";
  const householdId = formData.get("householdId")?.toString().trim() || null;
  const role = formData.get("householdRole")?.toString().trim() || null;
  const back = `/admin/members/${memberId}`;

  if (!newName && !householdId) {
    redirect(`${back}?error=missing-household`);
  }

  let nextHouseholdId = householdId;
  if (newName) {
    const household = await prisma.household.create({
      data: { name: formatHouseholdName(newName) },
    });
    nextHouseholdId = household.id;
  }

  await prisma.person.update({
    where: { id: member.personId },
    data: {
      householdId: nextHouseholdId,
      householdRole: role || (newName ? "head" : null),
    },
  });

  revalidatePath("/admin/households");
  revalidatePath("/admin/members");
  revalidatePath(back);
  if (nextHouseholdId) {
    revalidatePath(`/admin/households/${nextHouseholdId}`);
  }
  redirect(`${back}?success=household`);
}
