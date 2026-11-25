export type ResendConfig = {
  provider: "resend";
  from: string;
  apiKey: string;
  keySource: "RESEND_API_KEY" | "EMAIL_PROVIDER_API_KEY";
};

export type SmtpConfig = {
  provider: "smtp";
  from: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

export type MailConfig =
  | ResendConfig
  | SmtpConfig
  | { provider: "unconfigured"; reason: string };

export type MailSetupDescription = {
  provider: MailConfig["provider"];
  from: string | null;
  reason: string | null;
  resendKeySource: "RESEND_API_KEY" | "EMAIL_PROVIDER_API_KEY" | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpSecure: boolean | null;
  inbox: string;
};

function trimmed(env: NodeJS.ProcessEnv, name: string) {
  const value = env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function resendApiKey(env: NodeJS.ProcessEnv) {
  const resend = trimmed(env, "RESEND_API_KEY");
  if (resend) {
    return { apiKey: resend, keySource: "RESEND_API_KEY" as const };
  }
  const fallback = trimmed(env, "EMAIL_PROVIDER_API_KEY");
  if (fallback) {
    return { apiKey: fallback, keySource: "EMAIL_PROVIDER_API_KEY" as const };
  }
  return null;
}

function smtpReady(env: NodeJS.ProcessEnv) {
  return Boolean(
    trimmed(env, "SMTP_HOST") &&
      trimmed(env, "SMTP_USER") &&
      trimmed(env, "SMTP_PASS"),
  );
}

function smtpPort(env: NodeJS.ProcessEnv) {
  const raw = Number(trimmed(env, "SMTP_PORT"));
  if (Number.isInteger(raw) && raw > 0) {
    return raw;
  }
  return 465;
}

function smtpSecure(env: NodeJS.ProcessEnv, port: number) {
  const raw = trimmed(env, "SMTP_SECURE").toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return port === 465;
}

function fromAddress(env: NodeJS.ProcessEnv, fallback: string) {
  return trimmed(env, "EMAIL_FROM") || fallback;
}

export function resolveMailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig {
  const choice = trimmed(env, "EMAIL_PROVIDER").toLowerCase() || "auto";
  const useSmtp =
    choice === "smtp" || (choice === "auto" && smtpReady(env));
  const useResend =
    choice === "resend" ||
    (choice === "auto" && !smtpReady(env) && Boolean(resendApiKey(env)));

  if (choice !== "auto" && choice !== "resend" && choice !== "smtp") {
    return {
      provider: "unconfigured",
      reason: "EMAIL_PROVIDER must be resend, smtp, or auto.",
    };
  }

  if (useSmtp) {
    if (!smtpReady(env)) {
      return {
        provider: "unconfigured",
        reason: "SMTP needs SMTP_HOST, SMTP_USER, and SMTP_PASS.",
      };
    }
    const user = trimmed(env, "SMTP_USER");
    const from = fromAddress(env, user.includes("@") ? user : "");
    if (!from) {
      return {
        provider: "unconfigured",
        reason: "Set EMAIL_FROM to the mailbox address Hostinger should send from.",
      };
    }
    const port = smtpPort(env);
    return {
      provider: "smtp",
      from,
      host: trimmed(env, "SMTP_HOST"),
      port,
      secure: smtpSecure(env, port),
      user,
      pass: trimmed(env, "SMTP_PASS"),
    };
  }

  if (useResend) {
    const key = resendApiKey(env);
    if (!key) {
      return {
        provider: "unconfigured",
        reason: "Resend needs RESEND_API_KEY (or EMAIL_PROVIDER_API_KEY).",
      };
    }
    const from = fromAddress(env, "");
    if (!from) {
      return {
        provider: "unconfigured",
        reason:
          "EMAIL_FROM is not set. Resend only delivers from a verified domain. onboarding@resend.dev can only email the Resend account owner.",
      };
    }
    return { provider: "resend", from, apiKey: key.apiKey, keySource: key.keySource };
  }

  return {
    provider: "unconfigured",
    reason:
      "No email provider is configured. Set RESEND_API_KEY and EMAIL_FROM, or SMTP_HOST, SMTP_USER, SMTP_PASS, and EMAIL_FROM.",
  };
}

export function describeMailSetup(
  env: NodeJS.ProcessEnv = process.env,
  inbox = "",
): MailSetupDescription {
  const config = resolveMailConfig(env);
  const port = trimmed(env, "SMTP_PORT") ? smtpPort(env) : null;
  return {
    provider: config.provider,
    from: config.provider === "unconfigured" ? trimmed(env, "EMAIL_FROM") || null : config.from,
    reason: config.provider === "unconfigured" ? config.reason : null,
    resendKeySource: resendApiKey(env)?.keySource ?? null,
    smtpHost: trimmed(env, "SMTP_HOST") || null,
    smtpPort: port,
    smtpUser: trimmed(env, "SMTP_USER") || null,
    smtpSecure: trimmed(env, "SMTP_HOST") ? smtpSecure(env, port ?? 465) : null,
    inbox,
  };
}
