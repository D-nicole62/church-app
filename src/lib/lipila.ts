/**
 * Lipila collections (mobile money + card) configuration and types.
 *
 * Endpoints based on https://docs.lipila.dev/docs/collections/
 */

export const LIPILA_MOMO_URL =
  "https://api.lipila.dev/api/v1/collections/mobile-money";

export const LIPILA_CARD_URL =
  "https://api.lipila.dev/api/v1/collections/card";

export const LIPILA_STATUS_URL =
  "https://api.lipila.dev/api/v1/collections/check-status";

/** Default currency for giving (Zambian Kwacha). */
export const DEFAULT_CURRENCY = "ZMW";

/** Default country for card payer (Zambia). */
export const DEFAULT_COUNTRY = "ZM";

export type GivingType = "momo" | "card";

export type MomoCollectionRequest = {
  referenceId: string;
  amount: number;
  narration: string;
  accountNumber: string;
  currency: string;
  email?: string;
};

export type CardCustomerInfo = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  city: string;
  country: string;
  address: string;
  zip: string;
};

export type CardCollectionRequest = {
  referenceId: string;
  amount: number;
  narration: string;
  accountNumber: string;
  currency: string;
  backUrl: string;
  redirectUrl: string;
};

export type CardCollectionPayload = {
  customerInfo: CardCustomerInfo;
  collectionRequest: CardCollectionRequest;
};

export type GivingRequestBody =
  | { type: "momo"; data: MomoCollectionRequest }
  | { type: "card"; data: CardCollectionPayload };

export type CollectionStatusValue = "Pending" | "Successful" | "Failed" | string;

const DEFAULT_PAYMENT_TIMEOUT_SECONDS = 180;

/** How long a started payment may stay pending before it is marked failed. */
export function getPaymentTimeoutSeconds() {
  const raw = Number(process.env.PAYMENT_TIMEOUT_SECONDS);
  if (Number.isFinite(raw) && raw >= 30 && raw <= 900) {
    return Math.round(raw);
  }
  return DEFAULT_PAYMENT_TIMEOUT_SECONDS;
}

export type PaymentOutcome = "successful" | "failed" | "cancelled" | "pending";

export function classifyCollectionStatus(status: string | null | undefined): PaymentOutcome {
  const value = (status || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "successful" || value === "success" || value === "completed") {
    return "successful";
  }
  if (
    value === "cancelled" ||
    value === "canceled" ||
    value === "user_cancelled" ||
    value === "user_canceled"
  ) {
    return "cancelled";
  }
  if (
    value === "failed" ||
    value === "failure" ||
    value === "declined" ||
    value === "rejected" ||
    value === "expired" ||
    value === "timeout" ||
    value === "timed_out"
  ) {
    return "failed";
  }
  return "pending";
}

export type CollectionStatus = {
  referenceId: string;
  currency?: string;
  amount?: number;
  accountNumber?: string;
  status: CollectionStatusValue;
  paymentType?: string;
  type?: string;
  ipAddress?: string;
  identifier?: string;
  externalId?: string;
  message?: string;
};

/** Generate a short reference id similar to the docs' examples (12 hex chars). */
export function generateReferenceId(prefix = "tod"): string {
  const random = Math.random().toString(16).slice(2, 10);
  const ts = Date.now().toString(16).slice(-4);
  return `${prefix}-${ts}${random}`;
}

export const GIVING_PURPOSE_OPTIONS = [
  { id: "tithe", label: "Tithe" },
  { id: "offering", label: "Offering" },
  { id: "missions", label: "Missions" },
  { id: "other", label: "Other" },
] as const;

export type GivingPurposeId = (typeof GIVING_PURPOSE_OPTIONS)[number]["id"];

export function formatGivingNarration(
  purpose: GivingPurposeId,
  otherNote?: string,
): string {
  switch (purpose) {
    case "tithe":
      return "Tithe";
    case "offering":
      return "Offering";
    case "missions":
      return "Missions";
    case "other": {
      const note = otherNote?.trim();
      return note ? `Other: ${note}` : "Other";
    }
    default: {
      const exhaustive: never = purpose;
      return exhaustive;
    }
  }
}
