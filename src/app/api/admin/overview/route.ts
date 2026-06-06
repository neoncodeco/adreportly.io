import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";

const PAID_PLAN_IDS = BILLING_PLANS.filter((p) => p.isPaid).map((p) => p.id);

function monthKey(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function parseDateOnly(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) return null;
  return d;
}

function paymentDateSql(fromDate: Date | null, toDate: Date | null) {
  const parts: Prisma.Sql[] = [];
  if (fromDate) parts.push(Prisma.sql`COALESCE(paid_at, created_at) >= ${fromDate}`);
  if (toDate) parts.push(Prisma.sql`COALESCE(paid_at, created_at) <= ${toDate}`);
  if (parts.length === 0) return Prisma.empty;
  return Prisma.sql`AND ${Prisma.join(parts, " AND ")}`;
}

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const payload = await getOrSetCache(`admin:overview:${request.url}`, 20_000, async () => {
    const { searchParams } = new URL(request.url);
    const fromDateRaw = parseDateOnly(searchParams.get("from"));
    const toDateRaw = parseDateOnly(searchParams.get("to"));
    const fromDate = fromDateRaw
      ? new Date(
          Date.UTC(
            fromDateRaw.getUTCFullYear(),
            fromDateRaw.getUTCMonth(),
            fromDateRaw.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        )
      : null;
    const toDate = toDateRaw
      ? new Date(
          Date.UTC(
            toDateRaw.getUTCFullYear(),
            toDateRaw.getUTCMonth(),
            toDateRaw.getUTCDate(),
            23,
            59,
            59,
            999,
          ),
        )
      : null;

    const dateSql = paymentDateSql(fromDate, toDate);

    const [
      totalUsers,
      adminUsers,
      usersWithAgency,
      totalAgencies,
      totalShareLinks,
      totalFeedbacks,
      newFeedbacks,
      totalsAgg,
      packageAgg,
      monthlyAgg,
      statusAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { agencyId: { not: null } } }),
      prisma.agency.count(),
      prisma.sharedLink.count(),
      prisma.feedback.count(),
      prisma.feedback.count({ where: { status: "new" } }),
      prisma.$queryRaw<Array<{ totalIncome: number; totalPackageSales: number }>>`
        SELECT COALESCE(SUM(amount), 0)::float AS "totalIncome",
               COUNT(*)::int AS "totalPackageSales"
        FROM payment_transactions
        WHERE status = 'paid'
          AND plan_id IN (${Prisma.join(PAID_PLAN_IDS)})
        ${dateSql}
      `,
      prisma.$queryRaw<Array<{ planId: string; income: number; sales: number }>>`
        SELECT plan_id AS "planId",
               COALESCE(SUM(amount), 0)::float AS income,
               COUNT(*)::int AS sales
        FROM payment_transactions
        WHERE status = 'paid'
          AND plan_id IN (${Prisma.join(PAID_PLAN_IDS)})
        ${dateSql}
        GROUP BY plan_id
      `,
      prisma.$queryRaw<Array<{ year: number; month: number; income: number; sales: number }>>`
        SELECT EXTRACT(YEAR FROM COALESCE(paid_at, created_at))::int AS year,
               EXTRACT(MONTH FROM COALESCE(paid_at, created_at))::int AS month,
               COALESCE(SUM(amount), 0)::float AS income,
               COUNT(*)::int AS sales
        FROM payment_transactions
        WHERE status = 'paid'
          AND plan_id IN (${Prisma.join(PAID_PLAN_IDS)})
        ${dateSql}
        GROUP BY year, month
        ORDER BY year, month
      `,
      prisma.$queryRaw<Array<{ paid: number; failed: number; canceled: number; refunded: number }>>`
        SELECT
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)::int AS paid,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::int AS failed,
          SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END)::int AS canceled,
          SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END)::int AS refunded
        FROM payment_transactions
        WHERE plan_id IN (${Prisma.join(PAID_PLAN_IDS)})
        ${dateSql}
      `,
    ]);

    const totalsRow = totalsAgg[0] ?? { totalIncome: 0, totalPackageSales: 0 };
    const statusRow = statusAgg[0] ?? { paid: 0, failed: 0, canceled: 0, refunded: 0 };
    const planNameMap = Object.fromEntries(BILLING_PLANS.map((p) => [p.id, p.name]));
    const packageStats = packageAgg
      .map((row) => ({
        planId: row.planId,
        planName: planNameMap[row.planId] ?? row.planId,
        income: row.income,
        sales: row.sales,
      }))
      .sort((a, b) => b.income - a.income);

    const now = new Date();
    const monthOrder: string[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      monthOrder.push(monthKey(d));
    }
    const byMonth = new Map(
      monthlyAgg.map((row) => {
        const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
        return [key, row];
      }),
    );
    const monthlyTrend = monthOrder.map((key) => {
      const row = byMonth.get(key);
      const [year, month] = key.split("-").map(Number);
      const label = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
        month: "short",
      });
      return {
        key,
        label,
        income: row?.income ?? 0,
        sales: row?.sales ?? 0,
      };
    });

    return {
      success: true,
      totals: {
        totalUsers,
        adminUsers,
        usersWithAgency,
        totalAgencies,
        totalShareLinks,
        totalFeedbacks,
        newFeedbacks,
        totalIncome: totalsRow.totalIncome,
        totalPackageSales: totalsRow.totalPackageSales,
        totalPaidTransactions: statusRow.paid,
        totalFailedTransactions: statusRow.failed,
        totalCanceledTransactions: statusRow.canceled,
        totalRefundedTransactions: statusRow.refunded,
        avgOrderValue: totalsRow.totalPackageSales
          ? totalsRow.totalIncome / totalsRow.totalPackageSales
          : 0,
      },
      packageStats,
      monthlyTrend,
      filters: {
        from: fromDate ? fromDate.toISOString().slice(0, 10) : null,
        to: toDate ? toDate.toISOString().slice(0, 10) : null,
      },
    };
  });

  return NextResponse.json(payload, { headers: ADMIN_CACHE_HEADERS });
}
