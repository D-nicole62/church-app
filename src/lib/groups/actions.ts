"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  GroupMembershipRole,
  GroupType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function parseGroupType(value: FormDataEntryValue | null): GroupType {
  const raw = value?.toString() ?? GroupType.CELL_GROUP;
  if (Object.values(GroupType).includes(raw as GroupType)) {
    return raw as GroupType;
  }
  return GroupType.CELL_GROUP;
}

function groupFormData(formData: FormData) {
  return {
    name: formData.get("name")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() || null,
    type: parseGroupType(formData.get("type")),
    meetsWhen: formData.get("meetsWhen")?.toString().trim() || null,
    location: formData.get("location")?.toString().trim() || null,
    campusId: formData.get("campusId")?.toString().trim() || null,
  };
}

export async function createGroupAction(formData: FormData) {
  const data = groupFormData(formData);
  if (!data.name) {
    redirect("/admin/groups/new?error=missing-name");
  }

  const group = await prisma.group.create({ data });
  revalidatePath("/admin/groups");
  revalidatePath("/groups");
  redirect(`/admin/groups/${group.id}?success=created`);
}

export async function updateGroupAction(groupId: string, formData: FormData) {
  const data = groupFormData(formData);
  if (!data.name) {
    redirect(`/admin/groups/${groupId}?error=missing-name`);
  }

  await prisma.group.update({
    where: { id: groupId },
    data,
  });

  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/groups");
  redirect(`/admin/groups/${groupId}?success=updated`);
}

export async function deleteGroupAction(groupId: string) {
  await prisma.group.delete({ where: { id: groupId } });
  revalidatePath("/admin/groups");
  revalidatePath("/groups");
  redirect("/admin/groups?success=deleted");
}

export async function addGroupMemberAction(groupId: string, formData: FormData) {
  const personId = formData.get("personId")?.toString().trim();
  const roleRaw = formData.get("role")?.toString();
  const role =
    roleRaw === GroupMembershipRole.LEADER
      ? GroupMembershipRole.LEADER
      : GroupMembershipRole.MEMBER;

  if (!personId) {
    redirect(`/admin/groups/${groupId}?error=missing-person`);
  }

  await prisma.groupMembership.upsert({
    where: { groupId_personId: { groupId, personId } },
    update: { role },
    create: { groupId, personId, role },
  });

  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/groups");
  redirect(`/admin/groups/${groupId}?success=member-added`);
}

export async function removeGroupMemberAction(groupId: string, membershipId: string) {
  await prisma.groupMembership.delete({ where: { id: membershipId } });
  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/groups");
  redirect(`/admin/groups/${groupId}?success=member-removed`);
}
