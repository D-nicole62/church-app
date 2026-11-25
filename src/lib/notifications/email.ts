import { absoluteNotificationImageUrl } from "@/lib/notifications/images";
import type { DeliveryResult, EmailPayload } from "@/lib/notifications/types";
import { composeMessage, deliverEmail } from "@/lib/mail/send";

/**
 * Sends through the shared mailer (Resend or SMTP).
 * A missing EMAIL_FROM used to fall back to church@todassembly.com, which
 * Resend rejects unless that domain is verified. The mailer now reports that
 * instead of calling the provider with an unverified sender.
 */
export async function sendEmail(payload: EmailPayload): Promise<DeliveryResult> {
  const imageUrl = payload.imageUrl
    ? absoluteNotificationImageUrl(payload.imageUrl)
    : null;
  const message = composeMessage({
    to: payload.to,
    subject: payload.subject,
    intro: "A message from the church",
    body: payload.body,
    imageUrl,
    replyTo: payload.replyTo,
  });
  const result = await deliverEmail(message);
  return {
    ok: result.ok,
    skipped: result.skipped,
    error: result.error,
    providerId: result.providerId,
  };
}
