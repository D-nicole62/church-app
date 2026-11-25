"use server";

import { redirect } from "next/navigation";
import { NotificationChannel, NotificationKind } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guard";
import { deliverNotification } from "@/lib/notifications/send";
import { CHURCH_NAME } from "@/lib/site";
import { isValidEmail } from "@/lib/validation/contact";

export async function sendTestEmailAction(formData: FormData) {
  await requireAdmin();
  const to = formData.get("to")?.toString().trim() ?? "";
  if (!isValidEmail(to)) {
    redirect("/admin/email?error=invalid-email");
  }

  const result = await deliverNotification({
    kind: NotificationKind.EMAIL_TEST,
    channel: NotificationChannel.EMAIL,
    recipient: to,
    subject: `Test email from ${CHURCH_NAME}`,
    body: "This is a test from the church website. If you can read it, email sending is working.",
  });

  if (result.status === "SENT") {
    redirect("/admin/email?success=sent");
  }

  redirect(
    `/admin/email?error=send-failed&detail=${encodeURIComponent(result.error ?? "The test email was not sent.")}`,
  );
}
