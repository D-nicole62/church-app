"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";

export async function createServiceAttendanceAction(formData: FormData) {
  await requireAdmin();
  const serviceDateRaw = formData.get("serviceDate")?.toString().trim();
  const serviceName = formData.get("serviceName")?.toString().trim() ?? "";
  const campusId = formData.get("campusId")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;

  const menCount = Number.parseInt(formData.get("menCount")?.toString() ?? "0", 10);
  const womenCount = Number.parseInt(formData.get("womenCount")?.toString() ?? "0", 10);
  const boysCount = Number.parseInt(formData.get("boysCount")?.toString() ?? "0", 10);
  const girlsCount = Number.parseInt(formData.get("girlsCount")?.toString() ?? "0", 10);

  if (!serviceDateRaw || !serviceName) {
    redirect("/admin/attendance?error=missing-required");
  }

  await prisma.serviceAttendance.create({
    data: {
      serviceDate: new Date(serviceDateRaw),
      serviceName,
      campusId,
      notes,
      menCount: Number.isNaN(menCount) ? 0 : menCount,
      womenCount: Number.isNaN(womenCount) ? 0 : womenCount,
      boysCount: Number.isNaN(boysCount) ? 0 : boysCount,
      girlsCount: Number.isNaN(girlsCount) ? 0 : girlsCount,
    },
  });

  revalidatePath("/admin/attendance");
  redirect("/admin/attendance?success=recorded");
}

export async function createCellGroupAttendanceAction(formData: FormData) {
  await requireAdmin();
  const groupId = formData.get("groupId")?.toString().trim();
  const meetingDateRaw = formData.get("meetingDate")?.toString().trim();
  const presentCount = Number.parseInt(
    formData.get("presentCount")?.toString() ?? "0",
    10,
  );
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!groupId || !meetingDateRaw) {
    redirect("/admin/attendance?error=missing-cell-required");
  }

  await prisma.cellGroupAttendance.create({
    data: {
      groupId,
      meetingDate: new Date(meetingDateRaw),
      presentCount: Number.isNaN(presentCount) ? 0 : presentCount,
      notes,
    },
  });

  revalidatePath("/admin/attendance");
  redirect("/admin/attendance?success=cell-recorded");
}

export async function deleteServiceAttendanceAction(recordId: string) {
  await requireAdmin();
  await prisma.serviceAttendance.delete({ where: { id: recordId } }).catch(() => null);
  revalidatePath("/admin/attendance");
  redirect("/admin/attendance?success=service-deleted");
}

export async function deleteCellAttendanceAction(recordId: string) {
  await requireAdmin();
  await prisma.cellGroupAttendance.delete({ where: { id: recordId } }).catch(() => null);
  revalidatePath("/admin/attendance");
  redirect("/admin/attendance?success=cell-deleted");
}
