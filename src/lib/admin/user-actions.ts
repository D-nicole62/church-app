"use server";

import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { UserRole } from "@/generated/prisma/client";
import { requireSignedInAdmin, requireSuperAdmin } from "@/lib/auth/guard";
import { hashPassword, passwordChangeError } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/validation/contact";

const ROLES = new Set<string>(Object.values(UserRole));

function parseRole(value: FormDataEntryValue | null) {
  const raw = value?.toString() ?? "";
  if (!ROLES.has(raw)) {
    return null;
  }
  return raw as UserRole;
}

async function otherActiveSuperAdmins(userId: string) {
  return prisma.adminUser.count({
    where: {
      id: { not: userId },
      role: UserRole.SUPER_ADMIN,
      active: true,
    },
  });
}

export async function createAdminUserAction(formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name")?.toString().trim() || null;
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const role = parseRole(formData.get("role"));
  const password = formData.get("password")?.toString() ?? "";
  const confirm = formData.get("confirm")?.toString() ?? "";

  if (!email || !isValidEmail(email) || !role) {
    redirect("/admin/users/new?error=missing-required");
  }
  const passwordError = passwordChangeError(password, confirm);
  if (passwordError) {
    redirect(`/admin/users/new?error=password&detail=${encodeURIComponent(passwordError)}`);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    redirect("/admin/users/new?error=duplicate");
  }

  const user = await prisma.adminUser.create({
    data: {
      name,
      email,
      role,
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      active: true,
    },
  });

  revalidatePath("/admin/users");
  redirect(`/admin/users/${user.id}?success=created`);
}

export async function updateAdminUserAction(userId: string, formData: FormData) {
  const actor = await requireSuperAdmin();
  const role = parseRole(formData.get("role"));
  const name = formData.get("name")?.toString().trim() || null;
  if (!role) {
    redirect(`/admin/users/${userId}?error=missing-role`);
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) {
    redirect("/admin/users?error=not-found");
  }

  const removesLastSuperAdmin =
    user.role === UserRole.SUPER_ADMIN &&
    user.active &&
    role !== UserRole.SUPER_ADMIN &&
    (await otherActiveSuperAdmins(userId)) === 0;

  if (removesLastSuperAdmin) {
    redirect(`/admin/users/${userId}?error=last-super-admin`);
  }

  if (actor.id === userId && role !== UserRole.SUPER_ADMIN) {
    redirect(`/admin/users/${userId}?error=own-role`);
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: { role, name },
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?success=updated`);
}

export async function resetAdminPasswordAction(userId: string, formData: FormData) {
  await requireSuperAdmin();
  const password = formData.get("password")?.toString() ?? "";
  const confirm = formData.get("confirm")?.toString() ?? "";
  const passwordError = passwordChangeError(password, confirm);
  if (passwordError) {
    redirect(`/admin/users/${userId}?error=password&detail=${encodeURIComponent(passwordError)}`);
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) {
    redirect("/admin/users?error=not-found");
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
    },
  });
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?success=password-reset`);
}

export async function setAdminActiveAction(userId: string, active: boolean) {
  const actor = await requireSuperAdmin();
  if (actor.id === userId && !active) {
    redirect(`/admin/users/${userId}?error=deactivate-self`);
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) {
    redirect("/admin/users?error=not-found");
  }

  if (
    !active &&
    user.role === UserRole.SUPER_ADMIN &&
    user.active &&
    (await otherActiveSuperAdmins(userId)) === 0
  ) {
    redirect(`/admin/users/${userId}?error=last-super-admin`);
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: { active },
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?success=${active ? "activated" : "deactivated"}`);
}

export async function changeOwnPasswordAction(formData: FormData) {
  const admin = await requireSignedInAdmin();
  const current = formData.get("current")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirm = formData.get("confirm")?.toString() ?? "";
  const passwordError = passwordChangeError(password, confirm);
  if (passwordError) {
    redirect(`/admin/account/password?error=password&detail=${encodeURIComponent(passwordError)}`);
  }

  const matches = await compare(current, admin.passwordHash);
  if (!matches) {
    redirect("/admin/account/password?error=current");
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash: await hashPassword(password),
      mustChangePassword: false,
    },
  });

  await signOut({ redirectTo: "/admin/login?password=updated" });
}
