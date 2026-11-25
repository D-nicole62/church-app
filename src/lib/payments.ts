import { NextResponse } from "next/server";

/**
 * Online payments stay off unless PAYMENTS_ENABLED is explicitly turned on.
 * Unset, blank, and any other value keep the Lipila flow closed.
 *
 * Read through a local binding so the value is taken from the running
 * process. Set the variable and redeploy (or restart the server) to change it.
 */
const ENABLED = new Set(["1", "true", "yes", "on"]);

export function paymentsEnabled() {
  const env = process.env;
  const raw = env.PAYMENTS_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED.has(raw) : false;
}

export const PAYMENTS_DISABLED_CODE = "PAYMENTS_DISABLED";

export const PAYMENTS_DISABLED_MESSAGE =
  "Online payments are turned off. Give in person at a Sunday service, or contact the church.";

export function paymentsDisabledPayload() {
  return {
    error: PAYMENTS_DISABLED_MESSAGE,
    code: PAYMENTS_DISABLED_CODE,
    enabled: false as const,
  };
}

export function paymentsUnavailableResponse() {
  return NextResponse.json(paymentsDisabledPayload(), {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { "Cache-Control": "no-store" } },
  );
}

type PaymentHandler = (request: Request) => Promise<Response> | Response;

/**
 * While payments are off, every method on a payment route returns 503.
 * When payments are on, unused methods stay 405.
 */
export function paymentRoute(
  handler?: PaymentHandler,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    if (!paymentsEnabled()) {
      return paymentsUnavailableResponse();
    }
    if (!handler) {
      return methodNotAllowed();
    }
    return handler(request);
  };
}

export function getLipilaApiKey() {
  const env = process.env;
  const key = env.LIPILA_API_KEY?.trim();
  return key ? key : null;
}

export function paymentsNotConfiguredResponse() {
  return NextResponse.json(
    {
      error: "Online payments are not configured.",
      code: "PAYMENTS_NOT_CONFIGURED",
      enabled: true,
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
