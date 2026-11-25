import { CHURCH_NAME, CHURCH_NAME_SHORT, CONTACT } from "../site";

const PURPLE = "#542A7C";

export type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paragraph(text: string) {
  return escapeHtml(text).replaceAll("\n", "<br>");
}

export function renderEmail({
  subject,
  intro,
  body,
  imageUrl,
}: {
  subject: string;
  intro: string;
  body: string;
  imageUrl?: string | null;
}): EmailTemplate {
  const text = [intro, "", body, "", CHURCH_NAME, CONTACT.email].join("\n");
  const image = imageUrl
    ? `<p style="margin:16px 0 0;"><img src="${escapeHtml(imageUrl)}" alt="" style="max-width:100%;height:auto;border-radius:12px;" /></p>`
    : "";
  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f3f8;color:#1f1630;font-family:Georgia,serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:${PURPLE};padding:20px 24px;color:#ffffff;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(CHURCH_NAME_SHORT)}</p>
                <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:600;">${escapeHtml(subject)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;font-size:16px;line-height:1.55;">
                <p style="margin:0 0 12px;">${paragraph(intro)}</p>
                <p style="margin:0;">${paragraph(body)}</p>
                ${image}
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px;font-family:Arial,sans-serif;font-size:13px;color:#5c5368;">
                ${escapeHtml(CHURCH_NAME)}<br>
                <a href="mailto:${escapeHtml(CONTACT.email)}" style="color:${PURPLE};">${escapeHtml(CONTACT.email)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return { subject, text, html };
}
