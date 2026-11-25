"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { isDatabaseConfigured } from "@/lib/db";
import { notifyChurchAndSender } from "@/lib/mail/notify";
import { prisma } from "@/lib/prisma";
import { CHURCH_NAME } from "@/lib/site";
import { isValidEmail, isValidZambianPhone } from "@/lib/validation/contact";

const CREATE_CONTACT_TABLE = `
CREATE TABLE IF NOT EXISTS "ContactInquiry" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
)`;

export async function submitContactAction(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const phone = formData.get("phone")?.toString().trim() || null;
  const message = formData.get("message")?.toString().trim() ?? "";

  if (!name || !email || !message) {
    redirect("/contact?error=missing-required");
  }

  if (!isValidEmail(email)) {
    redirect("/contact?error=invalid-email");
  }

  if (phone && !isValidZambianPhone(phone)) {
    redirect("/contact?error=invalid-phone");
  }

  if (!isDatabaseConfigured()) {
    redirect("/contact?error=unavailable");
  }

  try {
    await prisma.$executeRawUnsafe(CREATE_CONTACT_TABLE);
    await prisma.contactInquiry.create({
      data: { name, email, phone, message },
    });
    const details = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    await notifyChurchAndSender({
      churchKind: "CONTACT_INQUIRY",
      churchSubject: `New website message from ${name}`,
      churchBody: details,
      senderKind: "CONTACT_CONFIRMATION",
      senderEmail: email,
      senderSubject: `We received your message — ${CHURCH_NAME}`,
      senderBody:
        "Thank you for writing to us. Your message has been received and the church office will follow up.",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[submitContactAction]", error);
    }
    redirect("/contact?error=save-failed");
  }

  redirect("/contact?success=1");
}

export async function deleteContactInquiryAction(inquiryId: string) {
  await requireAdmin();
  await prisma.contactInquiry.delete({ where: { id: inquiryId } }).catch(() => null);
  revalidatePath("/admin/messages");
  redirect("/admin/messages?success=deleted");
}
