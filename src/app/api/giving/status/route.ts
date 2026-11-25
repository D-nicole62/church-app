import { NextResponse } from "next/server";
import { LIPILA_STATUS_URL, type CollectionStatus } from "@/lib/lipila";
import {
  recordCancelledLipilaFromStatus,
  recordFailedLipilaFromStatus,
  recordSuccessfulLipilaFromStatus,
} from "@/lib/finance/record";
import {
  getLipilaApiKey,
  paymentRoute,
  paymentsNotConfiguredResponse,
} from "@/lib/payments";

export const runtime = "nodejs";

async function checkPaymentStatus(request: Request) {
  const lipilaApiKey = getLipilaApiKey();
  if (!lipilaApiKey) {
    return paymentsNotConfiguredResponse();
  }

  const { searchParams } = new URL(request.url);
  const referenceId = searchParams.get("referenceId")?.trim();

  if (!referenceId) {
    return NextResponse.json(
      { error: "Missing referenceId" },
      { status: 400 },
    );
  }

  const url = `${LIPILA_STATUS_URL}?referenceId=${encodeURIComponent(referenceId)}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": lipilaApiKey,
      },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
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

  if (upstream.ok && decoded && typeof decoded === "object") {
    const statusPayload = decoded as CollectionStatus;
    try {
      await recordSuccessfulLipilaFromStatus(statusPayload);
      await recordFailedLipilaFromStatus(statusPayload);
      await recordCancelledLipilaFromStatus(statusPayload);
    } catch {
      // Finance recording must not block status checks for the Give UI.
    }
  }

  return NextResponse.json(decoded, { status: upstream.status });
}

export const GET = paymentRoute(checkPaymentStatus);
export const POST = paymentRoute();
export const PUT = paymentRoute();
export const PATCH = paymentRoute();
export const DELETE = paymentRoute();
