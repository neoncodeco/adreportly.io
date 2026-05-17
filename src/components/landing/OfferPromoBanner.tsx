"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgePercent, Copy, Ticket } from "lucide-react";
import { toast } from "sonner";
import { STANDARD_OFFER_PROMO_TEXT } from "@/lib/billing/offer-config";
import { DotLottieReact } from "@/lib/dotlottie";
import { Button } from "@/components/ui/button";

export function OfferPromoBanner({ couponCode, href }: { couponCode: string; href: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      toast.success("Coupon code copied.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy coupon code.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.72 }}
      className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
    >
      <div className="group relative overflow-hidden rounded card-brutal bg-card/95 p-4 backdrop-blur-md sm:p-5">
        <motion.div
          aria-hidden
          animate={{ x: ["-10%", "110%"] }}
          transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="pointer-events-none absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-brand/20 to-transparent"
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="hidden h-20 w-20 shrink-0 rounded bg-background/70 p-2 sm:block">
              <DotLottieReact
                src="https://lottie.host/38fb64e7-f74a-42cf-adf8-b95a314c62a4/rkg0pbL7NH.lottie"
                loop
                autoplay
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground">
                  <BadgePercent className="h-3.5 w-3.5" />
                  Limited Offer
                </span>
                <motion.span
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-foreground"
                >
                  <Ticket className="h-3.5 w-3.5" />
                  {couponCode}
                </motion.span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCopy()}
                  className="h-8 rounded-full border-border bg-background px-3 text-[11px] font-bold uppercase tracking-wider"
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              <p className="mt-3 max-w-2xl text-balance text-lg font-semibold leading-8 text-foreground">
                {STANDARD_OFFER_PROMO_TEXT}
              </p>
            </div>
          </div>

          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="flex items-center justify-end"
          >
            <Button
              asChild
              className="h-11 rounded bg-brand px-4 text-sm font-bold text-brand-foreground btn-brutal hover:bg-brand sm:px-5"
            >
              <a href={href}>
                <span className="whitespace-nowrap">See Offer</span>
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
