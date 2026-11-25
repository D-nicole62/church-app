# Tabernacle of David Assembly website

Next.js site and admin for the church. Online payments stay off until `PAYMENTS_ENABLED` is set to `true`.

## Local development

Use a local Postgres database. Do not point `DATABASE_URL` at production.

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

The seed admin is `ADMIN_SEED_EMAIL` (default `admin@todassembly.com`). If the password is still the setup password `ChangeMe123!`, the admin must choose a new password before using the dashboard.

Checks:

```bash
npm run test:payments
npm run test:mail
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

`npm run test:ci` runs those against the local database and refuses hosted database URLs.

After this version is deployed, apply the schema to the host database with `npx prisma db push` before relying on admin users, deactivation, or the new notification types. Do that as a planned release step, not against production from a laptop by accident.

## Email on Vercel

Set **one** of the two options below, plus the shared variables. `EMAIL_PROVIDER=auto` uses SMTP when `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are all set. Otherwise it uses Resend. Set `EMAIL_PROVIDER` to `resend` or `smtp` to force a choice.

Shared:

| Variable | Purpose |
| --- | --- |
| `EMAIL_FROM` | Sender, for example `Tabernacle of David <church@yourdomain.com>` |
| `CHURCH_INBOX_EMAIL` | Where contact and visit notices are delivered. Defaults to the public church email. |
| `EMAIL_PROVIDER` | `auto`, `resend`, or `smtp` |

### Resend

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | API key from Resend. This name is preferred. |
| `EMAIL_PROVIDER_API_KEY` | Older fallback name, used only when `RESEND_API_KEY` is empty. |

`EMAIL_FROM` must use a domain you have verified in Resend. Resend rejects unverified domains, which is why a valid key still fails if the sender is `church@todassembly.com` and that domain is not verified. The address `onboarding@resend.dev` can only email the owner of the Resend account. Leave `EMAIL_FROM` empty and the site will not call Resend; the admin email page and notification log show that reason.

### Hostinger SMTP

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` for SSL, or `587` for STARTTLS |
| `SMTP_SECURE` | `true` for port 465. Set `false` for port 587. |
| `SMTP_USER` | The full mailbox address |
| `SMTP_PASS` | The mailbox password. This is not an API key. |

`EMAIL_FROM` should be that same mailbox. If you omit it, the site uses `SMTP_USER` when that value contains `@`.

The admin page **Email** shows which provider is configured and can send a test. It never displays the API key or mailbox password. Failures are stored on the notification log with the provider's error.

Contact-form submissions and visit sign-ups email the church inbox and send a confirmation to the person when they gave an email address. Event reminders and group announcements use the same mailer.
