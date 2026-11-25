export type DeliveryResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  providerId?: string;
};

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  imageUrl?: string | null;
  replyTo?: string;
};

export type SmsPayload = {
  to: string;
  body: string;
};
