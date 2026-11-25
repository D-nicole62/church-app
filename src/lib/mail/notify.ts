import { NotificationChannel, NotificationKind } from "@/generated/prisma/client";
import { deliverNotification } from "@/lib/notifications/send";
import { CONTACT } from "@/lib/site";

export function churchInbox(env: NodeJS.ProcessEnv = process.env) {
  return env.CHURCH_INBOX_EMAIL?.trim() || CONTACT.email;
}

type Notice = {
  kind: NotificationKind;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
  visitorId?: string;
};

async function sendNotice(notice: Notice) {
  try {
    return await deliverNotification({
      kind: notice.kind,
      channel: NotificationChannel.EMAIL,
      recipient: notice.to,
      subject: notice.subject,
      body: notice.body,
      replyTo: notice.replyTo,
      visitorId: notice.visitorId,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[mail]", error);
    }
    return null;
  }
}

export async function notifyChurchAndSender(input: {
  churchKind: NotificationKind;
  churchSubject: string;
  churchBody: string;
  senderKind: NotificationKind;
  senderEmail?: string | null;
  senderSubject: string;
  senderBody: string;
  visitorId?: string;
}) {
  const inbox = churchInbox();
  await sendNotice({
    kind: input.churchKind,
    to: inbox,
    subject: input.churchSubject,
    body: input.churchBody,
    replyTo: input.senderEmail || undefined,
    visitorId: input.visitorId,
  });

  if (!input.senderEmail) {
    return;
  }

  await sendNotice({
    kind: input.senderKind,
    to: input.senderEmail,
    subject: input.senderSubject,
    body: input.senderBody,
    visitorId: input.visitorId,
  });
}
