import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { describeMailSetup, resolveMailConfig } from "./config";
import { deliverEmail, type SmtpSend } from "./send";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

function clearMailEnv() {
  for (const name of [
    "EMAIL_PROVIDER",
    "EMAIL_FROM",
    "RESEND_API_KEY",
    "EMAIL_PROVIDER_API_KEY",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_SECURE",
  ]) {
    delete process.env[name];
  }
}

test("auto uses Resend when only a Resend key is set", () => {
  clearMailEnv();
  process.env.RESEND_API_KEY = "re_test";
  process.env.EMAIL_FROM = "Church <church@example.com>";
  const config = resolveMailConfig();
  assert.equal(config.provider, "resend");
  if (config.provider === "resend") {
    assert.equal(config.keySource, "RESEND_API_KEY");
    assert.equal(config.from, "Church <church@example.com>");
  }
});

test("RESEND_API_KEY wins over EMAIL_PROVIDER_API_KEY", () => {
  clearMailEnv();
  process.env.RESEND_API_KEY = "re_new";
  process.env.EMAIL_PROVIDER_API_KEY = "re_old";
  process.env.EMAIL_FROM = "church@example.com";
  const config = resolveMailConfig();
  assert.equal(config.provider, "resend");
  if (config.provider === "resend") {
    assert.equal(config.apiKey, "re_new");
  }
});

test("Resend refuses to send without EMAIL_FROM and does not call the API", async () => {
  clearMailEnv();
  process.env.RESEND_API_KEY = "re_test";
  let called = false;
  const result = await deliverEmail(
    { to: "person@example.com", subject: "Hi", text: "Hello", html: "<p>Hello</p>" },
    {
      fetchImpl: async () => {
        called = true;
        return new Response("{}", { status: 200 });
      },
    },
  );
  assert.equal(called, false);
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /EMAIL_FROM/);
});

test("Resend surfaces the provider error message", async () => {
  clearMailEnv();
  process.env.RESEND_API_KEY = "re_test";
  process.env.EMAIL_FROM = "church@example.com";
  const result = await deliverEmail(
    { to: "person@example.com", subject: "Hi", text: "Hello", html: "<p>Hello</p>" },
    {
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            name: "validation_error",
            message: "The example.com domain is not verified.",
          }),
          { status: 403 },
        ),
    },
  );
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /not verified/);
  assert.match(result.error ?? "", /Resend \(403\)/);
});

test("auto prefers complete SMTP settings, and EMAIL_PROVIDER=resend overrides that", () => {
  clearMailEnv();
  process.env.SMTP_HOST = "smtp.hostinger.com";
  process.env.SMTP_PORT = "465";
  process.env.SMTP_USER = "church@example.com";
  process.env.SMTP_PASS = "secret-not-logged";
  process.env.RESEND_API_KEY = "re_test";
  const smtp = resolveMailConfig();
  assert.equal(smtp.provider, "smtp");
  if (smtp.provider === "smtp") {
    assert.equal(smtp.secure, true);
    assert.equal(smtp.port, 465);
    assert.equal(smtp.from, "church@example.com");
  }

  process.env.EMAIL_PROVIDER = "resend";
  process.env.EMAIL_FROM = "Church <church@example.com>";
  assert.equal(resolveMailConfig().provider, "resend");
});

test("SMTP port 587 defaults to STARTTLS unless SMTP_SECURE forces SSL", () => {
  clearMailEnv();
  process.env.EMAIL_PROVIDER = "smtp";
  process.env.SMTP_HOST = "smtp.hostinger.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "church@example.com";
  process.env.SMTP_PASS = "secret";
  const startTls = resolveMailConfig();
  assert.equal(startTls.provider, "smtp");
  if (startTls.provider === "smtp") assert.equal(startTls.secure, false);

  process.env.SMTP_SECURE = "true";
  const forced = resolveMailConfig();
  if (forced.provider === "smtp") assert.equal(forced.secure, true);
});

test("SMTP send uses the injected transport and never returns the password", async () => {
  clearMailEnv();
  process.env.EMAIL_PROVIDER = "smtp";
  process.env.SMTP_HOST = "smtp.hostinger.com";
  process.env.SMTP_PORT = "465";
  process.env.SMTP_USER = "church@example.com";
  process.env.SMTP_PASS = "mailbox-secret";
  process.env.EMAIL_FROM = "TOD <church@example.com>";
  let seenPass = "";
  const smtpSend: SmtpSend = async (config, message) => {
    seenPass = config.pass;
    assert.equal(message.to, "person@example.com");
    assert.equal(message.text, "Hello from the church");
    return { messageId: "smtp-1" };
  };
  const result = await deliverEmail(
    {
      to: "person@example.com",
      subject: "Hello",
      text: "Hello from the church",
      html: "<p>Hello from the church</p>",
    },
    { smtpSend },
  );
  assert.equal(result.ok, true);
  assert.equal(result.providerId, "smtp-1");
  assert.equal(seenPass, "mailbox-secret");
  const description = describeMailSetup(process.env, "church@example.com");
  assert.equal(description.provider, "smtp");
  assert.equal(JSON.stringify(description).includes("mailbox-secret"), false);
});

test("a failed SMTP send returns the error", async () => {
  clearMailEnv();
  process.env.SMTP_HOST = "smtp.hostinger.com";
  process.env.SMTP_USER = "church@example.com";
  process.env.SMTP_PASS = "secret";
  const result = await deliverEmail(
    { to: "person@example.com", subject: "Hi", text: "Hello", html: "<p>Hello</p>" },
    {
      smtpSend: async () => {
        throw new Error("Invalid login: 535 authentication failed");
      },
    },
  );
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /535 authentication failed/);
});
