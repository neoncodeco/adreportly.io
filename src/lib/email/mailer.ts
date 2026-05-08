import nodemailer from "nodemailer";

let transporterCache: nodemailer.Transporter | null = null;

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).replace(/\/$/, "");
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

async function sendMail(params: { to: string; subject: string; html: string; text: string }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();
  if (!from || !transporter) {
    console.warn("[mailer] SMTP is not configured. Skipping email send.");
    return;
  }
  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail({
    to,
    subject: "Verify your AdReportly account",
    text: `Verify your email by opening this link: ${verifyUrl}`,
    html: `<p>Welcome to AdReportly.</p><p>Please verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to,
    subject: "Reset your AdReportly password",
    text: `Reset your password by opening this link: ${resetUrl}`,
    html: `<p>We received a request to reset your password.</p><p>Reset link:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
  });
}
