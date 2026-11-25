import { NextResponse } from "next/server";
import {
  LIPILA_CARD_URL,
  LIPILA_MOMO_URL,
  type GivingRequestBody,
} from "@/lib/lipila";
import {
  recordPendingLipilaTransaction,
} from "@/lib/finance/record";
import {
  getLipilaApiKey,
  paymentRoute,
  paymentsNotConfiguredResponse,
} from "@/lib/payments";

export const runtime = "nodejs";

async function startPayment(request: Request) {
  const lipilaApiKey = getLipilaApiKey();
  if (!lipilaApiKey) {
    return paymentsNotConfiguredResponse();
  }

  let body: GivingRequestBody | null = null;

  try {
    body = (await request.json()) as GivingRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || (body.type !== "momo" && body.type !== "card") || !body.data) {
    return NextResponse.json(
      { error: "Missing or invalid request fields" },
      { status: 400 },
    );
  }

  const upstreamUrl = body.type === "card" ? LIPILA_CARD_URL : LIPILA_MOMO_URL;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": lipilaApiKey,
        accept: "application/json",
      },
      body: JSON.stringify(body.data),
      // Reasonable timeout to avoid hanging the request
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "fetch failed";
    return NextResponse.json(
      {
        error: "Could not reach the payment gateway. Please try again.",
        detail,
      },
      { status: 502 },
    );
  }

  const rawText = await upstream.text();
  const trimmed = rawText.trimStart();

  // Upstream returned an HTML error page instead of JSON.
  if (
    trimmed.toLowerCase().startsWith("<!doctype") ||
    trimmed.toLowerCase().startsWith("<html")
  ) {
    return NextResponse.json(
      {
        error:
          "The payment gateway returned an unexpected response. Please try again later.",
        detail: `Upstream returned HTML (HTTP ${upstream.status})`,
      },
      { status: 502 },
    );
  }

  let decoded: unknown;
  try {
    decoded = rawText ? JSON.parse(rawText) : {};
  } catch {
    return NextResponse.json(
      {
        error:
          "The payment gateway returned an invalid response. Please try again later.",
        detail: `Invalid JSON from upstream (HTTP ${upstream.status})`,
      },
      { status: 502 },
    );
  }

  if (upstream.ok && body) {
    try {
      if (body.type === "momo") {
        await recordPendingLipilaTransaction({
          type: "momo",
          referenceId: body.data.referenceId,
          amount: body.data.amount,
          currency: body.data.currency,
          purpose: body.data.narration,
          accountNumber: body.data.accountNumber,
          email: body.data.email,
        });
      } else {
        await recordPendingLipilaTransaction({
          type: "card",
          referenceId: body.data.collectionRequest.referenceId,
          amount: body.data.collectionRequest.amount,
          currency: body.data.collectionRequest.currency,
          purpose: body.data.collectionRequest.narration,
          accountNumber: body.data.collectionRequest.accountNumber,
          email: body.data.customerInfo.email,
          payerName: `${body.data.customerInfo.firstName} ${body.data.customerInfo.lastName}`.trim(),
          payerPhone: body.data.customerInfo.phoneNumber,
        });
      }
    } catch {
      // Finance recording must not block the live payment flow.
    }
  }

  return NextResponse.json(decoded, { status: upstream.status });
}

export const POST = paymentRoute(startPayment);
export const GET = paymentRoute();
export const PUT = paymentRoute();
export const PATCH = paymentRoute();
export const DELETE = paymentRoute();
