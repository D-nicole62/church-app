import { absoluteNotificationImageUrl } from "@/lib/notifications/images";
import type { DeliveryResult, EmailPayload } from "@/lib/notifications/types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendEmail(payload: EmailPayload): Promise<DeliveryResult> {
  const apiKey =
    process.env.EMAIL_PROVIDER_API_KEY?.trim() ||
    process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return { ok: false, skipped: true, error: "Email provider not configured" };
  }

  const from =
    process.env.EMAIL_FROM?.trim() || "TOD Assembly <church@todassembly.com>";
  const imageUrl = payload.imageUrl
    ? absoluteNotificationImageUrl(payload.imageUrl)
    : null;
  const html = imageUrl
    ? `<p>${escapeHtml(payload.body).replaceAll("\n", "<br>")}</p><p><img src="${escapeHtml(imageUrl)}" alt="" style="max-width:100%;height:auto;" /></p>`
    : undefined;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        text: imageUrl ? `${payload.body}\n\n${imageUrl}` : payload.body,
        ...(html ? { html } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });

    const data = (await response.json()) as { id?: string; message?: string };

    if (!response.ok) {
      return {
        ok: false,
        error: data.message || `Email API error (${response.status})`,
      };
    }

    return { ok: true, providerId: data.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}
