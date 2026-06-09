import { NextResponse } from "next/server";
import {
  LIPILA_CARD_URL,
  LIPILA_MOMO_URL,
  type GivingRequestBody,
} from "@/lib/lipila";

export const runtime = "nodejs";

const LIPILA_API_KEY =
  process.env.LIPILA_API_KEY?.trim() ||
  // Fallback key from the church's PHP example. Override via .env.local.
  "lsk_019e079a-bc0d-72bc-97ff-7e6b1d4d28d1";

export async function POST(request: Request) {
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
        "x-api-key": LIPILA_API_KEY,
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

  return NextResponse.json(decoded, { status: upstream.status });
}
