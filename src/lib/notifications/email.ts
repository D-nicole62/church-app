import type { DeliveryResult, EmailPayload } from "@/lib/notifications/types";

export async function sendEmail(payload: EmailPayload): Promise<DeliveryResult> {
  const apiKey =
    process.env.EMAIL_PROVIDER_API_KEY?.trim() ||
    process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return { ok: false, skipped: true, error: "Email provider not configured" };
  }

  const from =
    process.env.EMAIL_FROM?.trim() || "TOD Assembly <church@todassembly.com>";

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
        text: payload.body,
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
