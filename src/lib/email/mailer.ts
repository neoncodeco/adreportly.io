import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

import { DHAKA_TIMEZONE_LABEL, formatDhakaDateTime } from "@/lib/billing/date-format";
import { renderInvoiceHtml } from "@/lib/billing/invoice-html";

let transporterCache: nodemailer.Transporter | null = null;

const BRAND_NAME = "AdReportly";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://adreportly.io")
  ).replace(/\/$/, "");
}

function escapeEmailHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  attachments?: Mail.Attachment[];
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
    ...(params.attachments?.length ? { attachments: params.attachments } : {}),
  });
}

export async function sendPaymentPaidInvoiceEmail(params: {
  to: string;
  customerName: string;
  planLabel: string;
  amount: number;
  currency: string;
  providerPaymentId: string;
  paidAt: Date | null;
  invoiceMongoId: string | null;
}) {
  const base = getBaseUrl();
  const issuedAt = new Date();
  const attachmentHtml = renderInvoiceHtml({
    invoiceNo: params.providerPaymentId,
    customerName: params.customerName,
    customerEmail: params.to,
    planLabel: params.planLabel,
    amount: params.amount,
    currency: params.currency,
    paidAt: params.paidAt,
    issuedAt,
  });
  const safeFile = params.providerPaymentId.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 72);
  const billingUrl = `${base}/dashboard/billing`;
  const downloadPath = params.invoiceMongoId
    ? `${base}/api/billing/invoice/${params.invoiceMongoId}?download=1`
    : billingUrl;
  const paidLine = `${formatDhakaDateTime(params.paidAt)} (${DHAKA_TIMEZONE_LABEL})`;

  const planEsc = escapeEmailHtml(params.planLabel);
  const refEsc = escapeEmailHtml(params.providerPaymentId);
  const paidEsc = escapeEmailHtml(paidLine);
  const dlEsc = escapeEmailHtml(downloadPath);

  const html = wrapEmailHtml({
    title: "Payment received",
    preheader: `Your ${BRAND_NAME} subscription payment is confirmed.`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#18181b;">Payment received</p>
      <p style="margin:0 0 8px;">Thank you — we&apos;ve recorded your payment for the <strong>${planEsc}</strong> plan.</p>
      <p style="margin:0 0 4px;"><strong>Amount:</strong> ${escapeEmailHtml(params.currency)} ${escapeEmailHtml(String(params.amount))}</p>
      <p style="margin:0 0 4px;"><strong>Reference:</strong> ${refEsc}</p>
      <p style="margin:0 0 16px;"><strong>Paid:</strong> ${paidEsc}</p>
      <p style="margin:0 0 16px;">Your invoice is attached as an HTML file. While signed in, you can also open Billing and use <strong>Invoice</strong> next to this payment.</p>
      ${ctaButton(billingUrl, "Open billing")}
      <p style="margin:16px 0 0;font-size:13px;color:#71717a;">Direct download (requires sign-in): <a href="${dlEsc}" style="color:#16a34a;">${dlEsc}</a></p>
    `,
  });
  const text = [
    `${BRAND_NAME} — payment received`,
    "",
    `Plan: ${params.planLabel}`,
    `Amount: ${params.currency} ${params.amount}`,
    `Reference: ${params.providerPaymentId}`,
    `Paid: ${paidLine}`,
    "",
    "An invoice is attached to this email.",
    `Billing: ${billingUrl}`,
  ].join("\n");

  await sendMail({
    to: params.to,
    subject: `Receipt — ${BRAND_NAME} ${params.planLabel}`,
    html,
    text,
    attachments: [
      {
        filename: `AdReportly-invoice-${safeFile}.html`,
        content: attachmentHtml,
        contentType: "text/html; charset=utf-8",
      },
    ],
  });
}
