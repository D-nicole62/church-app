import { NextResponse } from "next/server";
import { closeLipilaPaymentSession } from "@/lib/finance/record";
import { paymentRoute } from "@/lib/payments";

export const runtime = "nodejs";

async function closePayment(request: Request) {
  let body: { referenceId?: string; outcome?: string } | null = null;
  try {
    body = (await request.json()) as { referenceId?: string; outcome?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const referenceId = body?.referenceId?.trim();
  const outcome = body?.outcome;
  if (
    !referenceId ||
    (outcome !== "timeout" && outcome !== "cancelled" && outcome !== "failed")
  ) {
    return NextResponse.json(
      { error: "Missing referenceId or outcome" },
      { status: 400 },
    );
  }

  try {
    await closeLipilaPaymentSession(referenceId, outcome);
  } catch {
    return NextResponse.json(
      { error: "Could not update the payment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, referenceId, outcome });
}

export const POST = paymentRoute(closePayment);
export const GET = paymentRoute();
export const PUT = paymentRoute();
export const PATCH = paymentRoute();
export const DELETE = paymentRoute();
