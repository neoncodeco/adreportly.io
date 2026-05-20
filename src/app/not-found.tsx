import Link from "next/link";
import { ArrowLeft, BarChart3, Home, Search, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-gradient-hero px-4 py-10 sm:px-6 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-brand/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-ink/10 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="text-center lg:text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded border-2 border-ink bg-background px-3 py-2 text-sm font-bold shadow-brutal-sm transition-transform hover:-translate-y-0.5"
            aria-label="Go to AdReportly home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded border-2 border-ink bg-brand text-ink">
              <Zap className="h-4 w-4 fill-ink" />
            </span>
            AdReportly
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded card-brutal bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur">
            <Search className="h-3.5 w-3.5 text-ink" />
            Report route not found
          </div>

          <h1 className="mt-6 font-display text-7xl font-black leading-none tracking-tight text-ink sm:text-8xl lg:text-9xl">
            404
          </h1>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Ei page-ta dashboard map-e nei.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
            Link-ta wrong, expired, ba page move hoye geche. Home theke abar start korun, ba
            dashboard-e giye apnar reports check korun.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <div className="glow-ring rounded">
              <Button
                asChild
                size="lg"
                className="h-auto rounded bg-brand px-6 py-3 text-brand-foreground btn-brutal hover:bg-brand"
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Back to home 
                </Link>
              </Button>
            </div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto rounded border-2 border-ink bg-card px-6 py-3 btn-brutal hover:bg-card"
            >
              <Link href="/dashboard">
                <BarChart3 className="h-4 w-4" />
                Open dashboard
              </Link>
            </Button>
          </div>
        </section>

        <section
          aria-label="Missing page illustration"
          className="relative mx-auto w-full max-w-md"
        >
          <div className="glass-strong relative overflow-hidden rounded p-5 shadow-elevated">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand/45 blur-2xl"
            />

            <div className="relative flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Broken path
                </p>
                <p className="mt-1 text-xl font-bold text-ink">/unknown-page</p>
              </div>
              <span className="rounded border-2 border-ink bg-brand px-2.5 py-1 text-xs font-black text-ink shadow-brutal-sm">
                404
              </span>
            </div>

            <div className="relative mt-6 space-y-3">
              {[
                { label: "Home", value: "Online", active: true },
                { label: "Dashboard", value: "Ready", active: true },
                { label: "Requested page", value: "Missing", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded border border-border/70 bg-background/70 px-4 py-3 backdrop-blur"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.active ? "bg-brand shadow-glow" : "bg-destructive"
                      }`}
                    />
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-3">
              {["CTR", "ROAS", "Spend"].map((label, index) => (
                <div
                  key={label}
                  className="rounded border-2 border-ink bg-card px-3 py-3 text-center shadow-brutal-sm"
                >
                  <div className="mx-auto flex h-8 w-8 items-end justify-center gap-1">
                    {[12, 20, 28].map((height, barIndex) => (
                      <span
                        key={barIndex}
                        className="w-1.5 rounded-sm bg-ink"
                        style={{ height: `${height - index * 3 + barIndex * 2}px` }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative mt-5 flex items-center gap-2 rounded bg-ink px-4 py-3 text-ink-foreground">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <p className="text-xs font-medium">
                Your data is safe. Only this route needs a reroute.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="mx-auto mt-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to main website
          </Link>
        </section>
      </div>
    </main>
  );
}
