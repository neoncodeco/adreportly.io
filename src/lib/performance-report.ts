import type { CampaignAdInsightRow } from "@/services/facebook";
import {
  countResultsFromInsight,
  costPerResultFromInsight,
  purchaseValueFromInsight,
  roasFromInsight,
} from "@/lib/facebook/client-report-normalize";

export type CampaignInsightApiRow = CampaignAdInsightRow;

const PURCHASE_TYPES = new Set([
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "onsite_conversion.purchase",
]);

function num(s: string | undefined): number {
  return parseFloat(s ?? "0") || 0;
}

function int(s: string | undefined): number {
  return parseInt(s ?? "0", 10) || 0;
}

function conversionsFromActions(actions?: CampaignAdInsightRow["actions"]): number {
  if (!actions?.length) return 0;
  return actions
    .filter((a) => PURCHASE_TYPES.has(a.action_type))
    .reduce((s, a) => s + (parseInt(a.value, 10) || 0), 0);
}

export function brandLetterFromText(text: string): string {
  const t = text.trim();
  if (!t) return "R";
  const ch = t[0];
  return ch.toUpperCase();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtMoneyCurrency(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.length === 3 ? currency : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export type PerformanceReportAggregates = {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalReach: number;
  totalResults: number;
  totalPurchases: number;
  totalPurchaseValue: number;
  ctr: number;
  cpc: number;
  costPerResult: number | null;
  roas: number | null;
  avgFrequency: number;
};

export function aggregatePerformanceReport(
  daily: CampaignInsightApiRow[],
  rollup: CampaignInsightApiRow | null,
): PerformanceReportAggregates {
  const totalSpend = daily.reduce((s, r) => s + num(r.spend), 0);
  const totalImpressions = daily.reduce((s, r) => s + int(r.impressions), 0);
  const totalClicks = daily.reduce((s, r) => s + int(r.clicks), 0);
  const totalResults = daily.reduce((s, r) => s + countResultsFromInsight(r), 0);
  const totalPurchases = daily.reduce((s, r) => s + conversionsFromActions(r.actions), 0);
  const totalPurchaseValue = daily.reduce((s, r) => s + purchaseValueFromInsight(r), 0);
  const maxReachDaily = daily.length ? Math.max(...daily.map((r) => int(r.reach)), 0) : 0;

  const impForRates =
    rollup && int(rollup.impressions) > 0 ? int(rollup.impressions) : totalImpressions;
  const spendForCpc = rollup && num(rollup.spend) > 0 ? num(rollup.spend) : totalSpend;
  const reachForFreq = rollup && int(rollup.reach) > 0 ? int(rollup.reach) : maxReachDaily;
  const impForFreq =
    rollup && int(rollup.impressions) > 0 ? int(rollup.impressions) : totalImpressions;

  const ctr = impForRates > 0 ? (totalClicks / impForRates) * 100 : 0;
  const cpc = totalClicks > 0 ? spendForCpc / totalClicks : 0;
  let costPerResult: number | null =
    totalResults > 0 ? totalSpend / totalResults : costPerResultFromInsight(rollup ?? undefined);
  if (costPerResult != null && (Number.isNaN(costPerResult) || costPerResult <= 0)) {
    costPerResult = null;
  }

  let roasVal = roasFromInsight(rollup ?? undefined);
  if (roasVal == null && totalSpend > 0 && totalPurchaseValue > 0) {
    roasVal = totalPurchaseValue / totalSpend;
  }

  const avgFrequency = reachForFreq > 0 ? impForFreq / reachForFreq : 0;

  const totalReachDisplay = rollup && int(rollup.reach) > 0 ? int(rollup.reach) : maxReachDaily;

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalReach: totalReachDisplay,
    totalResults,
    totalPurchases,
    totalPurchaseValue,
    ctr,
    cpc,
    costPerResult,
    roas: roasVal,
    avgFrequency,
  };
}

export type DailyReportRow = {
  date: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  inlineLinkClicks: number;
  results: number;
  purchases: number;
  purchaseValue: number;
};

export type ReportFinancialDetails = {
  totalDeposit: number | null;
  dollarRateBdt: number | null;
};

export function buildDailyReportRows(daily: CampaignInsightApiRow[]): DailyReportRow[] {
  return daily
    .filter((r) => r.date_start)
    .map((r) => {
      const impressions = int(r.impressions);
      const reach = int(r.reach);
      const clicks = int(r.clicks);
      const spend = num(r.spend);
      return {
        date: r.date_start ?? "",
        spend,
        impressions,
        reach,
        clicks,
        ctr: num(r.ctr),
        cpc: num(r.cpc),
        cpm: num(r.cpm),
        frequency: num(r.frequency),
        inlineLinkClicks: int(r.inline_link_clicks),
        results: countResultsFromInsight(r),
        purchases: conversionsFromActions(r.actions),
        purchaseValue: purchaseValueFromInsight(r),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function periodLabelFromDaily(daily: CampaignInsightApiRow[]): string {
  const dated = daily.filter((r) => r.date_start);
  if (!dated.length) return "Last 30 days";
  const ts = dated.map((r) => new Date(`${r.date_start as string}T12:00:00Z`).getTime());
  const min = new Date(Math.min(...ts));
  const max = new Date(Math.max(...ts));
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${min.toLocaleDateString("en-US", opts)} – ${max.toLocaleDateString("en-US", opts)}`;
}

export function buildPerformanceReportHtml(params: {
  brandLetter: string;
  campaignName: string;
  clientName: string;
  clientEmail: string;
  periodLabel: string;
  generatedAt: Date;
  currency: string;
  aggregates: PerformanceReportAggregates;
  dailyRows: DailyReportRow[];
  financial?: ReportFinancialDetails;
}): string {
  const {
    brandLetter,
    campaignName,
    clientName,
    clientEmail,
    periodLabel,
    generatedAt,
    currency,
    aggregates: a,
    dailyRows,
    financial,
  } = params;

  const clientNameDisp = clientName.trim() || "—";
  const clientEmailDisp = clientEmail.trim() || "—";
  const totalDeposit =
    financial?.totalDeposit != null && financial.totalDeposit > 0 ? financial.totalDeposit : null;
  const dollarRateBdt =
    financial?.dollarRateBdt != null && financial.dollarRateBdt > 0
      ? financial.dollarRateBdt
      : null;
  const totalDepositBdt =
    totalDeposit != null && dollarRateBdt != null ? totalDeposit * dollarRateBdt : null;
  const totalSpendBdt = dollarRateBdt != null ? a.totalSpend * dollarRateBdt : null;
  const remainingBalance = totalDeposit != null ? totalDeposit - a.totalSpend : null;
  const remainingBalanceBdt =
    remainingBalance != null && dollarRateBdt != null ? remainingBalance * dollarRateBdt : null;
  const fmtBdt = (n: number) => `BDT ${Math.round(n).toLocaleString()}`;
  const fmtRate = (n: number) =>
    `BDT ${n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  const genStr = generatedAt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const m = (label: string, value: string) => `
    <div class="metric-card">
      <div class="metric-value">${value}</div>
      <div class="metric-label">${escapeHtml(label)}</div>
    </div>`;

  const cpr =
    a.costPerResult != null && a.costPerResult > 0
      ? fmtMoneyCurrency(a.costPerResult, currency)
      : fmtMoneyCurrency(0, currency);
  const roasStr = a.roas != null && !Number.isNaN(a.roas) ? `${a.roas.toFixed(2)}x` : "0.00x";

  const financialSummaryHtml =
    totalDeposit != null
      ? m("Total Deposit", escapeHtml(fmtMoneyCurrency(totalDeposit, currency))) +
        m("Dollar Rate", escapeHtml(dollarRateBdt != null ? fmtRate(dollarRateBdt) : "—")) +
        m(
          "Remaining Balance",
          escapeHtml(remainingBalance != null ? fmtMoneyCurrency(remainingBalance, currency) : "—"),
        ) +
        m("Deposit (BDT)", escapeHtml(totalDepositBdt != null ? fmtBdt(totalDepositBdt) : "—"))
      : "";

  const summaryHtml =
    financialSummaryHtml +
    m("Amount Spent", escapeHtml(fmtMoneyCurrency(a.totalSpend, currency))) +
    m("Impressions", escapeHtml(a.totalImpressions.toLocaleString())) +
    m("Clicks", escapeHtml(a.totalClicks.toLocaleString())) +
    m("Results", escapeHtml(a.totalResults.toLocaleString())) +
    m("CTR", escapeHtml(`${a.ctr.toFixed(2)}%`)) +
    m("CPC", escapeHtml(fmtMoneyCurrency(a.cpc, currency))) +
    m("Cost/Result", escapeHtml(cpr)) +
    m("ROAS", escapeHtml(roasStr));

  const tableBody = dailyRows
    .map(
      (r) => `
    <tr>
      <td>${escapeHtml(r.date)}</td>
      <td class="num">${escapeHtml(fmtMoneyCurrency(r.spend, currency))}</td>
      <td class="num">${r.impressions.toLocaleString()}</td>
      <td class="num">${r.reach.toLocaleString()}</td>
      <td class="num">${r.clicks.toLocaleString()}</td>
      <td class="num">${r.inlineLinkClicks.toLocaleString()}</td>
      <td class="num">${r.ctr.toFixed(2)}%</td>
      <td class="num">${fmtMoneyCurrency(r.cpc, currency)}</td>
      <td class="num">${r.cpm > 0 ? fmtMoneyCurrency(r.cpm, currency) : "—"}</td>
      <td class="num">${r.frequency > 0 ? r.frequency.toFixed(2) : "—"}</td>
      <td class="num">${r.results.toLocaleString()}</td>
      <td class="num">${r.purchases.toLocaleString()}</td>
      <td class="num">${fmtMoneyCurrency(r.purchaseValue, currency)}</td>
    </tr>`,
    )
    .join("");

  const overviewExtra = `
    <div class="subsection">
      <h2 class="section-title">Overview</h2>
      <div class="divider"></div>
      <table class="info-table">
        <tbody>
          <tr><th>Client name</th><td>${escapeHtml(clientNameDisp)}</td></tr>
          <tr><th>Client email</th><td>${escapeHtml(clientEmailDisp)}</td></tr>
          <tr><th>Campaign</th><td>${escapeHtml(campaignName)}</td></tr>
          ${
            totalDeposit != null
              ? `
          <tr><th>Total deposit</th><td>${escapeHtml(fmtMoneyCurrency(totalDeposit, currency))}</td></tr>
          <tr><th>Dollar rate</th><td>${escapeHtml(dollarRateBdt != null ? fmtRate(dollarRateBdt) : "—")}</td></tr>
          <tr><th>Total deposit (BDT)</th><td>${escapeHtml(totalDepositBdt != null ? fmtBdt(totalDepositBdt) : "—")}</td></tr>
          <tr><th>Total spend (BDT)</th><td>${escapeHtml(totalSpendBdt != null ? fmtBdt(totalSpendBdt) : "—")}</td></tr>
          <tr><th>Remaining balance</th><td>${escapeHtml(remainingBalance != null ? fmtMoneyCurrency(remainingBalance, currency) : "—")}</td></tr>
          <tr><th>Remaining balance (BDT)</th><td>${escapeHtml(remainingBalanceBdt != null ? fmtBdt(remainingBalanceBdt) : "—")}</td></tr>`
              : ""
          }
          <tr><th>Total reach (period)</th><td>${a.totalReach.toLocaleString()}</td></tr>
          <tr><th>Purchases (conversion)</th><td>${a.totalPurchases.toLocaleString()}</td></tr>
          <tr><th>Purchase value</th><td>${escapeHtml(fmtMoneyCurrency(a.totalPurchaseValue, currency))}</td></tr>
          <tr><th>Avg. frequency</th><td>${a.avgFrequency > 0 ? a.avgFrequency.toFixed(2) : "—"}</td></tr>
        </tbody>
      </table>
    </div>`;

  return `
<div class="report-root">
  <style>
    .report-root {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #fff;
      padding: 0;
      margin: 0;
      width: 100%;
      box-sizing: border-box;
    }
    .report-root * { box-sizing: border-box; }
    .header-bar {
      background: #1877f2;
      color: #fff;
      padding: 28px 32px 24px;
    }
    .header-letter {
      font-size: 42px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.02em;
    }
    .header-title {
      margin-top: 8px;
      font-size: 18px;
      font-weight: 600;
      opacity: 0.95;
    }
    .meta-box {
      margin: 24px 32px 0;
      padding: 20px 22px;
      background: #e8f1fe;
      border-radius: 12px;
      border-left: 4px solid #1877f2;
    }
    .meta-row { margin-bottom: 10px; font-size: 14px; line-height: 1.45; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-k { font-weight: 700; color: #0f172a; }
    .meta-v { color: #334155; font-weight: 500; }
    .body-pad { padding: 28px 32px 40px; }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0c1e3c;
      margin: 0 0 10px;
    }
    .divider {
      height: 2px;
      background: #1877f2;
      border-radius: 1px;
      margin-bottom: 20px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 32px;
    }
    .metric-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 12px;
      text-align: center;
      background: #fff;
    }
    .metric-value {
      font-size: 22px;
      font-weight: 800;
      color: #1877f2;
      margin-bottom: 8px;
    }
    .metric-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }
    .subsection { margin-top: 28px; }
    .data-table-wrap { overflow: hidden; border-radius: 10px; border: 1px solid #e2e8f0; }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    table.data-table th {
      text-align: left;
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      padding: 10px 8px;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }
    table.data-table td {
      padding: 8px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    table.data-table td.num { text-align: right; font-variant-numeric: tabular-nums; }
    table.data-table tr:last-child td { border-bottom: none; }
    table.info-table { width: 100%; font-size: 13px; border-collapse: collapse; }
    table.info-table th {
      text-align: left;
      padding: 8px 12px 8px 0;
      color: #475569;
      font-weight: 700;
      width: 200px;
      vertical-align: top;
    }
    table.info-table td { padding: 8px 0; color: #0f172a; }
  </style>
  <header class="header-bar">
    <div class="header-letter">${escapeHtml(brandLetter)}</div>
    <div class="header-title">Performance Report</div>
  </header>
  <div class="meta-box">
    <div class="meta-row"><span class="meta-k">Client: </span><span class="meta-v">${escapeHtml(clientNameDisp)}</span></div>
    <div class="meta-row"><span class="meta-k">Email: </span><span class="meta-v">${escapeHtml(clientEmailDisp)}</span></div>
    <div class="meta-row"><span class="meta-k">Period: </span><span class="meta-v">${escapeHtml(periodLabel)}</span></div>
    <div class="meta-row"><span class="meta-k">Generated: </span><span class="meta-v">${escapeHtml(genStr)}</span></div>
  </div>
  <div class="body-pad">
    <section>
      <h2 class="section-title">Performance Summary</h2>
      <div class="divider"></div>
      <div class="metric-grid">${summaryHtml}</div>
    </section>
    ${overviewExtra}
    <section class="subsection">
      <h2 class="section-title">Daily breakdown</h2>
      <div class="divider"></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th class="num">Amount spent</th>
              <th class="num">Impr.</th>
              <th class="num">Reach</th>
              <th class="num">Clicks</th>
              <th class="num">Link clk.</th>
              <th class="num">CTR</th>
              <th class="num">CPC</th>
              <th class="num">CPM</th>
              <th class="num">Freq.</th>
              <th class="num">Results</th>
              <th class="num">Purch.</th>
              <th class="num">Purch. value</th>
            </tr>
          </thead>
          <tbody>${tableBody}</tbody>
        </table>
      </div>
    </section>
  </div>
</div>`.trim();
}

export async function downloadPerformanceReportPdf(opts: {
  html: string;
  filename: string;
}): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Capture inside a blank iframe so html2canvas never sees the app’s Tailwind
  // theme (oklch colors), which its parser does not support.
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "report-pdf-capture");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:820px;height:16000px;border:0;opacity:0;pointer-events:none;";

  const srcDoc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#ffffff;">${opts.html}</body></html>`;

  await new Promise<void>((resolve, reject) => {
    iframe.onload = () => resolve();
    iframe.onerror = () => reject(new Error("Could not load report preview."));
    iframe.srcdoc = srcDoc;
    document.body.appendChild(iframe);
  });

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error("Could not access report frame.");
  }

  const target = doc.querySelector(".report-root") as HTMLElement | null;
  if (!target) {
    document.body.removeChild(iframe);
    throw new Error("Report markup missing.");
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  document.body.removeChild(iframe);

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const imgData = canvas.toDataURL("image/png");

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(opts.filename);
}
