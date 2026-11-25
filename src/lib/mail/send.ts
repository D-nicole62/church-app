import nodemailer from "nodemailer";
import { resolveMailConfig, type MailConfig, type SmtpConfig } from "./config";
import { renderEmail } from "./templates";

export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export type MailResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  providerId?: string;
  provider: MailConfig["provider"] | "unconfigured";
};

export type SmtpSend = (
  config: SmtpConfig,
  message: OutboundEmail,
) => Promise<{ messageId?: string }>;

type SendDeps = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
  smtpSend?: SmtpSend;
};

function resendError(status: number, raw: string) {
  try {
    const data = JSON.parse(raw) as {
      message?: string;
      name?: string;
      error?: string;
    };
    const message = data.message || data.error || data.name;
    if (message) {
      return `Resend (${status}): ${message}`;
    }
  } catch {
    // The provider returned a non-JSON body.
  }
  const snippet = raw.replace(/\s+/g, " ").trim().slice(0, 300);
  return `Resend (${status}): ${snippet || "request failed"}`;
}

async function sendViaResend(
  config: Extract<MailConfig, { provider: "resend" }>,
  message: OutboundEmail,
  fetchImpl: typeof fetch,
): Promise<MailResult> {
  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const raw = await response.text();
    if (!response.ok) {
      return { ok: false, error: resendError(response.status, raw), provider: "resend" };
    }
    let id: string | undefined;
    try {
      id = (JSON.parse(raw) as { id?: string }).id;
    } catch {
      id = undefined;
    }
    return { ok: true, providerId: id, provider: "resend" };
  } catch (error) {
    return {
      ok: false,
      provider: "resend",
      error: `Resend: ${error instanceof Error ? error.message : "request failed"}`,
    };
  }
}

export async function sendViaSmtp(
  config: SmtpConfig,
  message: OutboundEmail,
): Promise<{ messageId?: string }> {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
  const info = await transport.sendMail({
    from: config.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    replyTo: message.replyTo,
  });
  return { messageId: info.messageId };
}

export async function deliverEmail(
  message: OutboundEmail,
  deps: SendDeps = {},
): Promise<MailResult> {
  const config = resolveMailConfig(deps.env ?? process.env);
  if (config.provider === "unconfigured") {
    return { ok: false, skipped: true, error: config.reason, provider: "unconfigured" };
  }
  if (config.provider === "resend") {
    return sendViaResend(config, message, deps.fetchImpl ?? fetch);
  }
  try {
    const info = await (deps.smtpSend ?? sendViaSmtp)(config, message);
    return { ok: true, providerId: info.messageId, provider: "smtp" };
  } catch (error) {
    return {
      ok: false,
      provider: "smtp",
      error: `SMTP: ${error instanceof Error ? error.message : "send failed"}`,
    };
  }
}

export function composeMessage({
  to,
  subject,
  intro,
  body,
  imageUrl,
  replyTo,
}: {
  to: string;
  subject: string;
  intro: string;
  body: string;
  imageUrl?: string | null;
  replyTo?: string;
}): OutboundEmail {
  const rendered = renderEmail({ subject, intro, body, imageUrl });
  return {
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
    replyTo,
  };
}
