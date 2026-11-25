import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
  });

  if (!admin || !admin.active) {
    redirect("/admin/login?error=inactive");
  }

  if (admin.mustChangePassword) {
    redirect("/admin/account/password");
  }

  return (
    <AdminShell
      user={{
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
