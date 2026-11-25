"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import {
  NotificationChannel,
  NotificationKind,
  NotificationStatus,
} from "@/generated/prisma/client";
import {
  resolveEventAudience,
  resolveGroupAudience,
  type EventAudience,
} from "@/lib/notifications/audience";
import { imageUrlFromForm } from "@/lib/notifications/images";
import { deliverBulkNotifications } from "@/lib/notifications/send";
import { prisma } from "@/lib/prisma";

function parseChannel(value: FormDataEntryValue | null): NotificationChannel {
  return value?.toString() === "SMS"
    ? NotificationChannel.SMS
    : NotificationChannel.EMAIL;
}

function parseEventAudience(value: FormDataEntryValue | null): EventAudience {
  const raw = value?.toString();
  if (raw === "group" || raw === "campus" || raw === "all_people") {
    return raw;
  }
  return "rsvps";
}

function redirectForDelivery(
  path: string,
  results: Awaited<ReturnType<typeof deliverBulkNotifications>>,
  success: string,
) {
  const sent = results.filter((result) => result.status === NotificationStatus.SENT).length;
  const problem = results.find((result) => result.status !== NotificationStatus.SENT);
  if (sent === 0 && problem) {
    const code =
      problem.status === NotificationStatus.FAILED ? "email-failed" : "email-skipped";
    redirect(
      `${path}?error=${code}&detail=${encodeURIComponent(problem.error ?? "The message was not sent.")}`,
    );
  }
  redirect(`${path}?success=${success}`);
}

export async function sendEventReminderAction(
  eventId: string,
  formData: FormData,
) {
  await requireAdmin();
  const channel = parseChannel(formData.get("channel"));
  const audience = parseEventAudience(formData.get("audience"));
  const groupId = formData.get("groupId")?.toString().trim() || null;
  const subject =
    formData.get("subject")?.toString().trim() || "Upcoming event reminder";
  const body = formData.get("body")?.toString().trim() ?? "";
  const imageUrl = await readOptionalImage(formData, `/admin/events/${eventId}`);

  if (!body) {
    redirect(`/admin/events/${eventId}?error=missing-message`);
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    redirect("/admin/events?error=not-found");
  }

  const recipients = await resolveEventAudience(eventId, audience, groupId);
  const deliveries = recipients.flatMap((person) => {
    const address = channel === NotificationChannel.EMAIL ? person.email : person.phone;
    if (!address) {
      return [];
    }
    return [
      {
        kind: NotificationKind.EVENT_REMINDER as NotificationKind,
        channel,
        recipient: address,
        subject,
        body: body.replace("{name}", person.name),
        imageUrl,
        entityType: "event",
        entityId: eventId,
      },
    ];
  });

  if (deliveries.length === 0) {
    redirect(`/admin/events/${eventId}?error=no-recipients`);
  }

  const results = await deliverBulkNotifications(deliveries);
  revalidatePath("/admin/notifications");
  revalidatePath(`/admin/events/${eventId}`);
  redirectForDelivery(`/admin/events/${eventId}`, results, "reminder-sent");
}

export async function sendGroupAnnouncementAction(
  groupId: string,
  formData: FormData,
) {
  await requireAdmin();
  const channel = parseChannel(formData.get("channel"));
  const subject =
    formData.get("subject")?.toString().trim() || "Group announcement";
  const body = formData.get("body")?.toString().trim() ?? "";
  const imageUrl = await readOptionalImage(formData, `/admin/groups/${groupId}`);

  if (!body) {
    redirect(`/admin/groups/${groupId}?error=missing-message`);
  }

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    redirect("/admin/groups?error=not-found");
  }

  const recipients = await resolveGroupAudience(groupId);
  const deliveries = recipients.flatMap((person) => {
    const address = channel === NotificationChannel.EMAIL ? person.email : person.phone;
    if (!address) {
      return [];
    }
    return [
      {
        kind: NotificationKind.GROUP_ANNOUNCEMENT as NotificationKind,
        channel,
        recipient: address,
        subject,
        body: body.replace("{name}", person.name),
        imageUrl,
        entityType: "group",
        entityId: groupId,
      },
    ];
  });

  if (deliveries.length === 0) {
    redirect(`/admin/groups/${groupId}?error=no-recipients`);
  }

  const results = await deliverBulkNotifications(deliveries);
  revalidatePath("/admin/notifications");
  revalidatePath(`/admin/groups/${groupId}`);
  redirectForDelivery(`/admin/groups/${groupId}`, results, "announcement-sent");
}

export async function getNotificationSummary() {
  const [recent, sentCount, failedCount, skippedCount] = await Promise.all([
    prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { visitor: { include: { person: true } } },
    }),
    prisma.notificationLog.count({ where: { status: "SENT" } }),
    prisma.notificationLog.count({ where: { status: "FAILED" } }),
    prisma.notificationLog.count({ where: { status: "SKIPPED" } }),
  ]);

  return { recent, sentCount, failedCount, skippedCount };
}

async function readOptionalImage(formData: FormData, returnPath: string) {
  try {
    return await imageUrlFromForm(formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload the image.";
    redirect(`${returnPath}?error=invalid-image&detail=${encodeURIComponent(message)}`);
  }
}
