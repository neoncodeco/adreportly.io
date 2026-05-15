import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { ADMIN_CACHE_HEADERS, getOrSetCache } from "@/lib/server-cache";
import type { PipelineStage } from "mongoose";
import { UserModel } from "@/models/user";
import { AgencyModel } from "@/models/agency";
import { FeedbackModel } from "@/models/feedback";
import { SharedLinkModel } from "@/models/shared-link";
import { PaymentTransactionModel } from "@/models/payment-transaction";
import { BILLING_PLANS } from "@/lib/billing/plans";

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
    const dateStages: PipelineStage[] = [
      { $addFields: { effectiveAt: { $ifNull: ["$paidAt", "$createdAt"] } } },
      ...(fromDate || toDate
        ? [
            {
              $match: {
                effectiveAt: {
                  ...(fromDate ? { $gte: fromDate } : {}),
                  ...(toDate ? { $lte: toDate } : {}),
                },
              },
            } as PipelineStage,
          ]
        : []),
    ];

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
      UserModel.countDocuments({}),
      UserModel.countDocuments({ role: "admin" }),
      UserModel.countDocuments({
        agencyId: { $exists: true, $nin: [null, ""] },
      }),
      AgencyModel.countDocuments({}),
      SharedLinkModel.countDocuments({}),
      FeedbackModel.countDocuments({}),
      FeedbackModel.countDocuments({ status: "new" }),
      PaymentTransactionModel.aggregate<{
        totalIncome: number;
        totalPackageSales: number;
      }>([
        ...dateStages,
        { $match: { status: "paid", planId: { $in: PAID_PLAN_IDS } } },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$amount" },
            totalPackageSales: { $sum: 1 },
          },
        },
      ]),
      PaymentTransactionModel.aggregate<{
        _id: string;
        income: number;
        sales: number;
      }>([
        ...dateStages,
        { $match: { status: "paid", planId: { $in: PAID_PLAN_IDS } } },
        {
          $group: {
            _id: "$planId",
            income: { $sum: "$amount" },
            sales: { $sum: 1 },
          },
        },
      ]),
      PaymentTransactionModel.aggregate<{
        _id: { year: number; month: number };
        income: number;
        sales: number;
      }>([
        ...dateStages,
        { $match: { status: "paid", planId: { $in: PAID_PLAN_IDS } } },
        {
          $group: {
            _id: {
              year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } },
              month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } },
            },
            income: { $sum: "$amount" },
            sales: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      PaymentTransactionModel.aggregate<{
        paid: number;
        failed: number;
        canceled: number;
        refunded: number;
      }>([
        ...dateStages,
        { $match: { planId: { $in: PAID_PLAN_IDS } } },
        {
          $group: {
            _id: null,
            paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
            canceled: { $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] } },
            refunded: { $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const totalsRow = totalsAgg[0] ?? { totalIncome: 0, totalPackageSales: 0 };
    const statusRow = statusAgg[0] ?? { paid: 0, failed: 0, canceled: 0, refunded: 0 };
    const planNameMap = Object.fromEntries(BILLING_PLANS.map((p) => [p.id, p.name]));
    const packageStats = packageAgg
      .map((row) => ({
        planId: row._id,
        planName: planNameMap[row._id] ?? row._id,
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
        const key = `${row._id.year}-${String(row._id.month).padStart(2, "0")}`;
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
