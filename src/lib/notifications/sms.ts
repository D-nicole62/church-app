import type { DeliveryResult, SmsPayload } from "@/lib/notifications/types";

/**
 * Generic SMS sender. Configure Africa's Talking–style env vars or leave unset to skip.
 */
export async function sendSms(payload: SmsPayload): Promise<DeliveryResult> {
  const apiKey = process.env.SMS_PROVIDER_API_KEY?.trim();
  const username = process.env.SMS_PROVIDER_USERNAME?.trim();
  const from = process.env.SMS_FROM?.trim() || "TODAssembly";

  if (!apiKey || !username) {
    return { ok: false, skipped: true, error: "SMS provider not configured" };
  }

  const endpoint =
    process.env.SMS_PROVIDER_URL?.trim() ||
    "https://api.africastalking.com/version1/messaging";

  try {
    const body = new URLSearchParams({
      username,
      to: payload.to,
      message: payload.body,
      from,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body,
      signal: AbortSignal.timeout(20_000),
    });

    const data = (await response.json()) as {
      SMSMessageData?: { Message?: string };
      message?: string;
    };

    if (!response.ok) {
      return {
        ok: false,
        error:
          data.message ||
          data.SMSMessageData?.Message ||
          `SMS API error (${response.status})`,
      };
    }

    return { ok: true, providerId: data.SMSMessageData?.Message };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "SMS send failed",
    };
  }
}
