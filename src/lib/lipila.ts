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
