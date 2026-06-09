import { NextResponse } from "next/server";
import { LIPILA_STATUS_URL } from "@/lib/lipila";

export const runtime = "nodejs";

const LIPILA_API_KEY =
  process.env.LIPILA_API_KEY?.trim() ||
  "lsk_019e079a-bc0d-72bc-97ff-7e6b1d4d28d1";

export async function GET(request: Request) {
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
        "x-api-key": LIPILA_API_KEY,
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

  return NextResponse.json(decoded, { status: upstream.status });
}
