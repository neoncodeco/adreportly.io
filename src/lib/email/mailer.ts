import nodemailer from "nodemailer";

let transporterCache: nodemailer.Transporter | null = null;

const BRAND_NAME = "AdReportly";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).replace(/\/$/, "");
}

function wrapEmailHtml(params: {
  title: string;
  preheader: string;
  bodyHtml: string;
  footerNote?: string;
}) {
  const { title, preheader, bodyHtml, footerNote } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px 32px;text-align:center;border-bottom:1px solid #e4e4e7;">
              <span style="display:inline-block;font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#18181b;">${BRAND_NAME}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px 32px;color:#3f3f46;font-size:16px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px 32px;font-size:12px;line-height:1.5;color:#a1a1aa;text-align:center;">
              ${footerNote ?? `You received this because someone used this address on ${BRAND_NAME}. If it wasn&apos;t you, you can ignore this email.`}
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;">${BRAND_NAME}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:24px auto;">
    <tr>
      <td align="center" style="border-radius:10px;background-color:#16a34a;">
        <a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function getTransporter() {
  if (transporterCache) return transporterCache;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  transporterCache = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporterCache;
}

async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();
  if (!from || !transporter) {
    console.warn("[mailer] SMTP is not configured. Skipping email send.");
    return;
  }
  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${from}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    headers: {
      "X-Mailer": BRAND_NAME,
      ...params.headers,
    },
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const base = getBaseUrl();
  const verifyUrl = `${base}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const html = wrapEmailHtml({
    title: "Verify your email",
    preheader: "Confirm your email to start using AdReportly.",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#18181b;">Verify your email</p>
      <p style="margin:0 0 8px;">Thanks for signing up. Tap the button below to confirm your email address and activate your account.</p>
      ${ctaButton(verifyUrl, "Verify email address")}
      <p style="margin:16px 0 0;font-size:13px;color:#71717a;">This button expires in <strong>24 hours</strong>. If you didn&apos;t create an account, you can ignore this message.</p>
    `,
  });
  const text = [
    `Thanks for signing up for ${BRAND_NAME}.`,
    "",
    "Verify your email (copy and paste into your browser if the button does not work):",
    verifyUrl,
    "",
    "This link expires in 24 hours.",
  ].join("\n");

  await sendMail({
    to,
    subject: `Verify your ${BRAND_NAME} account`,
    html,
    text,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const base = getBaseUrl();
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;
  const html = wrapEmailHtml({
    title: "Reset your password",
    preheader: "Set a new password for your AdReportly account.",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#18181b;">Reset your password</p>
      <p style="margin:0 0 8px;">We received a request to reset the password for your account. Use the button below to choose a new password.</p>
      ${ctaButton(resetUrl, "Reset password")}
      <p style="margin:16px 0 0;font-size:13px;color:#71717a;">This button expires in <strong>1 hour</strong>. If you didn&apos;t request a reset, you can safely ignore this email.</p>
    `,
    footerNote: `If you didn&apos;t request a password reset, ignore this email. Your password will stay the same.`,
  });
  const text = [
    `${BRAND_NAME} password reset`,
    "",
    "Reset your password by opening this link:",
    resetUrl,
    "",
    "This link expires in 1 hour.",
  ].join("\n");

  await sendMail({
    to,
    subject: `Reset your ${BRAND_NAME} password`,
    html,
    text,
  });
}
