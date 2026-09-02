import {
  NotificationChannel,
  NotificationKind,
  NotificationStatus,
} from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/lib/db";
import { sendEmail } from "@/lib/notifications/email";
import { sendSms } from "@/lib/notifications/sms";
import { prisma } from "@/lib/prisma";

export type DeliverNotificationInput = {
  kind: NotificationKind;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  entityType?: string;
  entityId?: string;
  visitorId?: string;
};

export async function deliverNotification(input: DeliverNotificationInput) {
  if (!isDatabaseConfigured()) {
    return { status: NotificationStatus.SKIPPED, error: "Database not configured" };
  }

  const log = await prisma.notificationLog.create({
    data: {
      kind: input.kind,
      channel: input.channel,
      status: NotificationStatus.PENDING,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      entityType: input.entityType,
      entityId: input.entityId,
      visitorId: input.visitorId,
    },
  });

  const result =
    input.channel === NotificationChannel.EMAIL
      ? await sendEmail({
          to: input.recipient,
          subject: input.subject || "TOD Assembly",
          body: input.body,
        })
      : await sendSms({ to: input.recipient, body: input.body });

  const status = result.ok
    ? NotificationStatus.SENT
    : result.skipped
      ? NotificationStatus.SKIPPED
      : NotificationStatus.FAILED;

  await prisma.notificationLog.update({
    where: { id: log.id },
    data: {
      status,
      errorMessage: result.error,
      sentAt: result.ok ? new Date() : null,
    },
  });

  return { status, error: result.error, logId: log.id };
}

export async function deliverBulkNotifications(
  inputs: DeliverNotificationInput[],
) {
  const results = [];
  for (const input of inputs) {
    results.push(await deliverNotification(input));
  }
  return results;
}
