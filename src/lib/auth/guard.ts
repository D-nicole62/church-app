import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireSignedInAdmin() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    redirect("/admin/login");
  }

  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user || !user.active) {
    redirect("/admin/login?error=inactive");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireSignedInAdmin();
  if (user.mustChangePassword) {
    redirect("/admin/account/password");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAdmin();
  if (user.role !== "SUPER_ADMIN") {
    redirect("/admin?error=forbidden");
  }
  return user;
}
