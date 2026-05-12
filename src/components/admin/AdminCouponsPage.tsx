"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ADMIN_COUPONS_PAGE_SIZE,
  ADMIN_STALE_MS,
  adminQk,
  fetchAdminCoupons,
  patchAdmin,
  postAdmin,
  type AdminCouponRow as CouponRow,
} from "@/lib/admin-queries";

export function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("10");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data, isPending, isError, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: adminQk.coupons(page, ADMIN_COUPONS_PAGE_SIZE),
    queryFn: () => fetchAdminCoupons(page, ADMIN_COUPONS_PAGE_SIZE),
    staleTime: ADMIN_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const rows = data?.coupons ?? [];
  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / ADMIN_COUPONS_PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < lastPage;

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      postAdmin<{ success: true; coupon: CouponRow }>("/api/admin/coupons", body),
    onSuccess: async () => {
      toast.success("Coupon created.");
      setCode("");
      setPercentOff("10");
      setMaxUses("");
      setExpiresAt("");
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not create coupon.");
    },
  });

  const createCoupon = async () => {
    const pct = parseInt(percentOff, 10);
    if (Number.isNaN(pct) || pct < 1 || pct > 100) {
      toast.error("Percent must be between 1 and 100.");
      return;
    }
    const maxRaw = maxUses.trim();
    let maxRedemptions: number | null | undefined = undefined;
    if (maxRaw) {
      const n = parseInt(maxRaw, 10);
      if (Number.isNaN(n) || n < 1) {
        toast.error("Max uses must be a positive number or empty for unlimited.");
        return;
      }
      maxRedemptions = n;
    }
    const body: Record<string, unknown> = {
      percentOff: pct,
      maxRedemptions: maxRedemptions ?? null,
    };
    if (code.trim()) body.code = code.trim();
    if (expiresAt.trim()) body.expiresAt = expiresAt.trim();
    createMutation.mutate(body);
  };

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      patchAdmin<{ success: true; coupon: CouponRow }>(`/api/admin/coupons/${id}`, { active }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Update failed.");
    },
    onSettled: () => {
      setTogglingId(null);
    },
  });

  const toggleActive = (row: CouponRow) => {
    setTogglingId(row.id);
    toggleMutation.mutate({ id: row.id, active: !row.active });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Create percent-off codes for checkout. Users enter a code on the billing checkout page.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Tag className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold">New coupon</h2>
            <p className="text-xs text-muted-foreground">
              Leave code empty to auto-generate. Max uses empty = unlimited.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Code (optional)</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SAVE20"
              className="h-10 rounded-xl font-mono uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Percent off *</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={percentOff}
              onChange={(e) => setPercentOff(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Max redemptions</Label>
            <Input
              type="number"
              min={1}
              placeholder="Unlimited"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Expires (optional)</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
        </div>
        <Button
          className="mt-4 rounded-full"
          disabled={createMutation.isPending}
          onClick={() => void createCoupon()}
        >
          {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create coupon
        </Button>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load coupons."}
        </div>
      ) : null}

      <div
        className={`overflow-hidden rounded-3xl border border-border bg-card shadow-soft ${
          isFetching && isPlaceholderData ? "opacity-80" : ""
        }`}
      >
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <h2 className="text-sm font-bold">All coupons</h2>
        </div>
        {isPending && rows.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
            No coupons yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Code</th>
                  <th className="px-4 py-3">%</th>
                  <th className="px-4 py-3">Uses</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Active</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono font-semibold sm:px-6">{r.code}</td>
                    <td className="px-4 py-3">{r.percentOff}%</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.maxRedemptions == null
                        ? `${r.redemptionCount} / ∞`
                        : `${r.redemptionCount} / ${r.maxRedemptions}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.expiresAt
                        ? new Date(r.expiresAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 rounded-full"
                        disabled={togglingId === r.id}
                        onClick={() => void toggleActive(r)}
                      >
                        {togglingId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : r.active ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                            On
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            Off
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Showing {(total === 0 ? 0 : (page - 1) * ADMIN_COUPONS_PAGE_SIZE + 1).toLocaleString()}-
          {Math.min(page * ADMIN_COUPONS_PAGE_SIZE, total).toLocaleString()} of{" "}
          {total.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!canPrev || isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} / {lastPage}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!canNext || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
