import {
  DHAKA_TIMEZONE_LABEL,
  formatDhakaDate,
  formatDhakaDateTime,
} from "@/lib/billing/date-format";

const BRAND = "AdReportly";

export type InvoiceRenderInput = {
  invoiceNo: string;
  customerName: string;
  customerEmail: string;
  planLabel: string;
  amount: number;
  currency: string;
  paidAt: Date | null;
  issuedAt: Date;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(amount: number, currency: string): string {
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "BDT" ? "BDT" : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
}

/** Standalone HTML document for download or email attachment. */
export function renderInvoiceHtml(p: InvoiceRenderInput): string {
  const paid = `${formatDhakaDateTime(p.paidAt)} (${DHAKA_TIMEZONE_LABEL})`;
  const issued = formatDhakaDate(p.issuedAt);
  const lineTotal = formatMoney(p.amount, p.currency);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(p.invoiceNo)} — ${BRAND}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #18181b; margin: 0; padding: 32px; background: #fafafa; }
    .sheet { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.02em; }
    .sub { color: #71717a; font-size: 13px; margin: 0 0 28px; }
    .row { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 8px; font-size: 14px; }
    .label { color: #71717a; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
    th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #e4e4e7; }
    th { background: #f4f4f5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #71717a; }
    .total { font-size: 16px; font-weight: 700; text-align: right; padding-top: 16px; border-bottom: none; }
    .foot { margin-top: 28px; font-size: 12px; color: #a1a1aa; line-height: 1.5; }
    .paid { display: inline-block; margin-top: 12px; padding: 6px 12px; background: #dcfce7; color: #166534; border-radius: 999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>${BRAND}</h1>
    <p class="sub">Receipt / Invoice</p>
    <div class="row"><span class="label">Invoice #</span><span>${escapeHtml(p.invoiceNo)}</span></div>
    <div class="row"><span class="label">Issued</span><span>${escapeHtml(issued)}</span></div>
    <div class="row"><span class="label">Bill to</span><span>${escapeHtml(p.customerName)}<br/>${escapeHtml(p.customerEmail)}</span></div>
    <span class="paid">Paid</span>
    <table>
      <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        <tr>
          <td>${escapeHtml(BRAND)} — ${escapeHtml(p.planLabel)} plan (subscription)</td>
          <td style="text-align:right">${escapeHtml(lineTotal)}</td>
        </tr>
      </tbody>
    </table>
    <div class="row total"><span>Total</span><span>${escapeHtml(lineTotal)}</span></div>
    <div class="row"><span class="label">Payment date</span><span>${escapeHtml(paid)}</span></div>
    <p class="foot">Thank you for your payment. If you have questions, reply to this email or contact support.</p>
  </div>
</body>
</html>`;
}
