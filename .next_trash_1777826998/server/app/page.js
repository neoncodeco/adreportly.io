(() => {
  var a = {};
  ((a.id = 974),
    (a.ids = [974]),
    (a.modules = {
      261: (a) => {
        "use strict";
        a.exports = require("next/dist/shared/lib/router/utils/app-paths");
      },
      703: (a, b, c) => {
        "use strict";
        c.d(b, { Pricing: () => m });
        var d = c(21124),
          e = c(4085),
          f = c(75234),
          g = c(71613),
          h = c(3991),
          i = c.n(h),
          j = c(35284),
          k = c(44943);
        let l = [
          {
            name: "Free",
            price: "$0",
            period: "/forever",
            desc: "Perfect for solo agencies getting started.",
            features: [
              "1 ad account",
              "Up to 5 campaigns",
              "7 days data retention",
              "Basic dashboard",
            ],
            cta: "Start Free",
            highlight: !1,
          },
          {
            name: "Starter",
            price: "$19",
            period: "/month",
            desc: "For freelancers running a few clients.",
            features: [
              "2 ad accounts",
              "Up to 15 campaigns",
              "30 days data retention",
              "Share links",
              "Email support",
            ],
            cta: "Start Starter",
            highlight: !1,
          },
          {
            name: "Pro",
            price: "$50",
            period: "/month",
            desc: "Everything growing agencies need.",
            features: [
              "5 ad accounts",
              "Up to 50 campaigns",
              "90 days data retention",
              "Unlimited share links",
              "PDF & CSV reports",
              "Priority support",
            ],
            cta: "Start Pro Trial",
            highlight: !0,
          },
          {
            name: "Enterprise",
            price: "Custom",
            period: "",
            desc: "For large agencies & networks.",
            features: [
              "Unlimited everything",
              "API access",
              "Custom integrations",
              "White-label options",
              "Dedicated success manager",
            ],
            cta: "Contact Sales",
            highlight: !1,
          },
        ];
        function m() {
          return (0, d.jsxs)("section", {
            id: "pricing",
            className: "relative py-28",
            children: [
              (0, d.jsx)("div", {
                "aria-hidden": !0,
                className: "pointer-events-none absolute inset-0 bg-gradient-mesh opacity-50",
              }),
              (0, d.jsxs)("div", {
                className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
                children: [
                  (0, d.jsxs)("div", {
                    className: "mx-auto max-w-2xl text-center",
                    children: [
                      (0, d.jsxs)("span", {
                        className:
                          "inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink",
                        children: [(0, d.jsx)(f.A, { className: "h-3 w-3" }), "Pricing"],
                      }),
                      (0, d.jsx)("h2", {
                        className:
                          "mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl",
                        children: "Simple, transparent pricing",
                      }),
                      (0, d.jsx)("p", {
                        className: "mt-4 text-muted-foreground",
                        children: "Start free. Upgrade when your agency grows.",
                      }),
                    ],
                  }),
                  (0, d.jsx)("div", {
                    className: "mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-center",
                    children: l.map((a, b) =>
                      (0, d.jsxs)(
                        e.P.div,
                        {
                          initial: { opacity: 0, y: 30 },
                          whileInView: { opacity: 1, y: 0 },
                          viewport: { once: !0, margin: "-80px" },
                          transition: { duration: 0.55, delay: 0.12 * b },
                          className: (0, k.cn)(
                            "relative rounded p-8 hover-lift",
                            a.highlight
                              ? "border-2 border-brand bg-ink text-ink-foreground shadow-brutal lg:scale-[1.04] lg:-my-2"
                              : "card-brutal bg-card",
                          ),
                          children: [
                            a.highlight &&
                              (0, d.jsxs)("span", {
                                className:
                                  "absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground shadow-glow",
                                children: [
                                  (0, d.jsx)(f.A, { className: "h-3 w-3" }),
                                  "Most popular",
                                ],
                              }),
                            (0, d.jsx)("h3", {
                              className: (0, k.cn)(
                                "text-sm font-semibold uppercase tracking-wider",
                                a.highlight ? "text-brand" : "text-muted-foreground",
                              ),
                              children: a.name,
                            }),
                            (0, d.jsxs)("div", {
                              className: "mt-4 flex items-baseline gap-1",
                              children: [
                                (0, d.jsx)("span", {
                                  className: (0, k.cn)(
                                    "font-display text-5xl font-bold",
                                    a.highlight ? "text-ink-foreground" : "text-foreground",
                                  ),
                                  children: a.price,
                                }),
                                (0, d.jsx)("span", {
                                  className: (0, k.cn)(
                                    "text-sm",
                                    a.highlight
                                      ? "text-ink-foreground/70"
                                      : "text-muted-foreground",
                                  ),
                                  children: a.period,
                                }),
                              ],
                            }),
                            (0, d.jsx)("p", {
                              className: (0, k.cn)(
                                "mt-3 text-sm",
                                a.highlight ? "text-ink-foreground/80" : "text-muted-foreground",
                              ),
                              children: a.desc,
                            }),
                            (0, d.jsx)("div", {
                              className: (0, k.cn)(
                                "my-6 h-px",
                                a.highlight ? "bg-ink-foreground/15" : "bg-border",
                              ),
                            }),
                            (0, d.jsx)("ul", {
                              className: "space-y-3",
                              children: a.features.map((b) =>
                                (0, d.jsxs)(
                                  "li",
                                  {
                                    className: (0, k.cn)(
                                      "flex items-start gap-2.5 text-sm",
                                      a.highlight ? "text-ink-foreground/90" : "text-foreground",
                                    ),
                                    children: [
                                      (0, d.jsx)("span", {
                                        className: (0, k.cn)(
                                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                                          a.highlight
                                            ? "bg-brand text-brand-foreground"
                                            : "bg-accent text-ink",
                                        ),
                                        children: (0, d.jsx)(g.A, {
                                          className: "h-3 w-3",
                                          strokeWidth: 3,
                                        }),
                                      }),
                                      b,
                                    ],
                                  },
                                  b,
                                ),
                              ),
                            }),
                            (0, d.jsx)(j.$, {
                              asChild: !0,
                              className: (0, k.cn)(
                                "mt-8 w-full rounded font-semibold btn-brutal h-auto py-3",
                                (a.highlight, "!bg-brand !text-brand-foreground hover:!bg-brand"),
                              ),
                              children: (0, d.jsx)(i(), { href: "/signup", children: a.cta }),
                            }),
                          ],
                        },
                        a.name,
                      ),
                    ),
                  }),
                ],
              }),
            ],
          });
        }
      },
      3295: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");
      },
      10846: (a) => {
        "use strict";
        a.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js");
      },
      11272: (a, b, c) => {
        "use strict";
        c.d(b, { HowItWorks: () => j });
        var d = c(21124),
          e = c(4085),
          f = c(31905),
          g = c(15952),
          h = c(30029);
        let i = [
          {
            icon: f.A,
            title: "Connect Facebook",
            desc: "Securely link your ad accounts in one click. Tokens are encrypted with AES-256 — never stored in plaintext.",
          },
          {
            icon: g.A,
            title: "Analyze Data",
            desc: "Real-time insights pulled directly from the Graph API. Spend, ROAS, CTR, CPC — all updated live.",
          },
          {
            icon: h.A,
            title: "Share Reports",
            desc: "Generate secure UUID share links that expire automatically. Clients view read-only dashboards — no login required.",
          },
        ];
        function j() {
          return (0, d.jsx)("section", {
            id: "how-it-works",
            className: "relative py-28",
            children: (0, d.jsxs)("div", {
              className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
              children: [
                (0, d.jsxs)("div", {
                  className: "mx-auto max-w-2xl text-center",
                  children: [
                    (0, d.jsx)("span", {
                      className:
                        "inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink",
                      children: "How it works",
                    }),
                    (0, d.jsxs)("h2", {
                      className: "mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl",
                      children: [
                        "Three steps from raw data to",
                        " ",
                        (0, d.jsxs)("span", {
                          className: "relative inline-block",
                          children: [
                            (0, d.jsx)("span", {
                              className: "relative z-10 text-brand-foreground",
                              children: "client report",
                            }),
                            (0, d.jsx)("span", {
                              "aria-hidden": !0,
                              className: "absolute inset-0 -z-0 -skew-x-6 bg-brand",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, d.jsxs)("div", {
                  className: "relative mt-20 grid gap-8 lg:grid-cols-3",
                  children: [
                    (0, d.jsx)("div", {
                      "aria-hidden": !0,
                      className:
                        "pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block",
                    }),
                    i.map((a, b) =>
                      (0, d.jsxs)(
                        e.P.div,
                        {
                          initial: { opacity: 0, y: 30 },
                          whileInView: { opacity: 1, y: 0 },
                          viewport: { once: !0, margin: "-80px" },
                          transition: { duration: 0.55, delay: 0.15 * b },
                          className: "group relative rounded card-brutal bg-card p-8 hover-lift",
                          children: [
                            (0, d.jsx)("div", {
                              className:
                                "absolute -top-6 left-7 flex h-12 w-12 items-center justify-center rounded bg-ink text-base font-bold text-ink-foreground shadow-glow-ink ring-4 ring-background",
                              children: b + 1,
                            }),
                            (0, d.jsx)("div", {
                              className:
                                "mt-2 inline-flex h-12 w-12 items-center justify-center rounded bg-accent text-ink transition-all duration-500 group-hover:bg-brand group-hover:rotate-6",
                              children: (0, d.jsx)(a.icon, { className: "h-6 w-6" }),
                            }),
                            (0, d.jsx)("h3", {
                              className: "mt-5 text-xl font-bold tracking-tight",
                              children: a.title,
                            }),
                            (0, d.jsx)("p", {
                              className: "mt-2 text-sm leading-relaxed text-muted-foreground",
                              children: a.desc,
                            }),
                          ],
                        },
                        a.title,
                      ),
                    ),
                  ],
                }),
              ],
            }),
          });
        }
      },
      12643: (a, b, c) => {
        "use strict";
        c.d(b, { FAQ: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call FAQ() from the server but FAQ is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/FAQ.tsx",
          "FAQ",
        );
      },
      15952: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("chart-column", [
          ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
          ["path", { d: "M18 17V9", key: "2bz60n" }],
          ["path", { d: "M13 17V5", key: "1frdt8" }],
          ["path", { d: "M8 17v-3", key: "17ska0" }],
        ]);
      },
      15982: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("mail", [
          ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
          ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }],
        ]);
      },
      16381: (a, b, c) => {
        "use strict";
        c.d(b, { Navbar: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call Navbar() from the server but Navbar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/Navbar.tsx",
          "Navbar",
        );
      },
      19121: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/action-async-storage.external.js");
      },
      22237: (a, b, c) => {
        "use strict";
        c.d(b, { Hero: () => w });
        var d = c(21124),
          e = c(4085),
          f = c(3991),
          g = c.n(f),
          h = c(75234),
          i = c(75535);
        let j = (0, c(14959).A)("circle-play", [
          [
            "path",
            {
              d: "M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z",
              key: "kmsa83",
            },
          ],
          ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
        ]);
        var k = c(67748),
          l = c(35284),
          m = c(6077),
          n = c(8283),
          o = c(90333),
          p = c(59296),
          q = c(16803),
          r = c(45802),
          s = (0, n.gu)({
            chartName: "BarChart",
            GraphicalChild: o.y,
            defaultTooltipEventType: "axis",
            validateTooltipEventTypes: ["axis", "item"],
            axisComponents: [
              { axisType: "xAxis", AxisComp: p.W },
              { axisType: "yAxis", AxisComp: q.h },
            ],
            formatAxisMap: r.pr,
          }),
          t = c(83790);
        let u = Array.from({ length: 30 }, (a, b) => {
          let c = new Date();
          c.setDate(c.getDate() - (29 - b));
          let d = 0.5 * Math.sin(1.7 * b) + 0.5;
          return {
            date: c.toISOString().slice(0, 10),
            label: c.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            spend: Math.round(8e3 + 18e3 * d + 4e3 * Math.random()),
            results: Math.round(4e3 + 14e3 * d + 3e3 * Math.random()),
          };
        });
        u.reduce((a, b) => a + b.spend, 0);
        let v = ["Turn", "ad", "spend", "into"];
        function w() {
          return (0, d.jsxs)("section", {
            className: "relative overflow-hidden bg-gradient-hero",
            children: [
              (0, d.jsx)("div", {
                "aria-hidden": !0,
                className:
                  "pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-brand/30 opacity-70 blur-3xl animate-float-slow",
              }),
              (0, d.jsx)("div", {
                "aria-hidden": !0,
                className:
                  "pointer-events-none absolute -right-24 top-32 h-96 w-96 animate-blob bg-gradient-brand opacity-25 blur-3xl",
              }),
              (0, d.jsx)("div", {
                "aria-hidden": !0,
                className: "pointer-events-none absolute inset-0 bg-grid opacity-[0.35]",
              }),
              (0, d.jsxs)("div", {
                className:
                  "relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-32 pb-20 sm:px-6 sm:pt-36 sm:pb-24 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-40 lg:pb-32",
                children: [
                  (0, d.jsxs)("div", {
                    className: "text-center lg:text-left",
                    children: [
                      (0, d.jsxs)(e.P.span, {
                        initial: { opacity: 0, y: 12 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5 },
                        className:
                          "inline-flex items-center gap-2 rounded-full card-brutal bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-md",
                        children: [
                          (0, d.jsxs)("span", {
                            className: "relative flex h-2 w-2",
                            children: [
                              (0, d.jsx)("span", {
                                className:
                                  "absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75",
                              }),
                              (0, d.jsx)("span", {
                                className: "relative inline-flex h-2 w-2 rounded-full bg-brand",
                              }),
                            ],
                          }),
                          (0, d.jsx)(h.A, { className: "h-3.5 w-3.5 text-ink" }),
                          "Real-time Facebook Ads insights",
                        ],
                      }),
                      (0, d.jsxs)("h1", {
                        className:
                          "mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem] lg:leading-[1.02]",
                        children: [
                          v.map((a, b) =>
                            (0, d.jsx)(
                              e.P.span,
                              {
                                initial: { opacity: 0, y: 24, filter: "blur(8px)" },
                                animate: { opacity: 1, y: 0, filter: "blur(0px)" },
                                transition: { duration: 0.55, delay: 0.05 * b, ease: "easeOut" },
                                className: "mr-3 inline-block text-ink",
                                children: a,
                              },
                              b,
                            ),
                          ),
                          (0, d.jsx)("br", {}),
                          (0, d.jsxs)(e.P.span, {
                            initial: { opacity: 0, y: 24 },
                            animate: { opacity: 1, y: 0 },
                            transition: { duration: 0.6, delay: 0.3, ease: "easeOut" },
                            className: "relative inline-block",
                            children: [
                              (0, d.jsx)("span", {
                                className: "relative z-10 text-brand-foreground",
                                children: "measurable ROI",
                              }),
                              (0, d.jsx)("span", {
                                "aria-hidden": !0,
                                className: "absolute inset-0 -z-0 -skew-x-6 bg-brand",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, d.jsx)(e.P.p, {
                        initial: { opacity: 0, y: 16 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.5 },
                        className: "mt-6 max-w-xl text-lg text-muted-foreground mx-auto lg:mx-0",
                        children:
                          "The all-in-one analytics platform agencies use to track Facebook campaigns, generate stunning client reports, and share secure read-only dashboards in seconds.",
                      }),
                      (0, d.jsxs)(e.P.div, {
                        initial: { opacity: 0, y: 16 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.6 },
                        className:
                          "mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start",
                        children: [
                          (0, d.jsx)("div", {
                            className: "glow-ring rounded",
                            children: (0, d.jsx)(l.$, {
                              asChild: !0,
                              size: "lg",
                              className:
                                "rounded bg-brand px-7 text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand",
                              children: (0, d.jsxs)(g(), {
                                href: "/signup",
                                children: [
                                  "Get Started Free",
                                  (0, d.jsx)(i.A, {
                                    className:
                                      "ml-2 h-4 w-4 transition-transform group-hover:translate-x-1",
                                  }),
                                ],
                              }),
                            }),
                          }),
                          (0, d.jsxs)(l.$, {
                            variant: "outline",
                            size: "lg",
                            className: "rounded bg-card btn-brutal h-auto py-3 hover:bg-card",
                            children: [(0, d.jsx)(j, { className: "mr-2 h-5 w-5" }), "Watch Demo"],
                          }),
                        ],
                      }),
                      (0, d.jsxs)(e.P.div, {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { duration: 0.6, delay: 0.8 },
                        className:
                          "mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start",
                        children: [
                          (0, d.jsx)("div", {
                            className: "flex -space-x-2",
                            children: ["F", "T", "A", "M"].map((a) =>
                              (0, d.jsx)(
                                "div",
                                {
                                  className:
                                    "flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-ink text-xs font-semibold text-ink-foreground shadow-soft",
                                  children: a,
                                },
                                a,
                              ),
                            ),
                          }),
                          (0, d.jsxs)("span", {
                            children: [
                              (0, d.jsx)("span", {
                                className: "font-semibold text-foreground",
                                children: "500+ agencies",
                              }),
                              " tracking ৳120M+ in ad spend",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, d.jsxs)(e.P.div, {
                    initial: { opacity: 0, y: 50, scale: 0.94 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    transition: { duration: 0.85, delay: 0.2, ease: "easeOut" },
                    className: "relative",
                    children: [
                      (0, d.jsx)("div", {
                        className: "animate-float",
                        children: (0, d.jsxs)("div", {
                          className:
                            "glass-strong relative overflow-hidden rounded p-6 shadow-elevated",
                          children: [
                            (0, d.jsx)("div", {
                              "aria-hidden": !0,
                              className:
                                "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/40 blur-2xl",
                            }),
                            (0, d.jsxs)("div", {
                              className: "relative flex items-center justify-between",
                              children: [
                                (0, d.jsxs)("div", {
                                  children: [
                                    (0, d.jsx)("p", {
                                      className:
                                        "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                                      children: "Live ROI Tracking",
                                    }),
                                    (0, d.jsx)("h3", {
                                      className: "mt-1 font-display text-3xl font-bold text-ink",
                                      children: "৳477,710.00",
                                    }),
                                  ],
                                }),
                                (0, d.jsxs)("span", {
                                  className:
                                    "inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success",
                                  children: [
                                    (0, d.jsx)(k.A, { className: "h-3.5 w-3.5" }),
                                    "+4,397.8%",
                                  ],
                                }),
                              ],
                            }),
                            (0, d.jsx)("div", {
                              className: "relative mt-6 h-44",
                              children: (0, d.jsx)(m.u, {
                                width: "100%",
                                height: "100%",
                                children: (0, d.jsxs)(s, {
                                  data: u.slice(-14),
                                  barCategoryGap: 4,
                                  children: [
                                    (0, d.jsx)(p.W, { dataKey: "label", hide: !0 }),
                                    (0, d.jsx)(o.y, {
                                      dataKey: "spend",
                                      radius: [6, 6, 0, 0],
                                      maxBarSize: 14,
                                      children: u
                                        .slice(-14)
                                        .map((a, b) => (0, d.jsx)(t.f, { fill: "var(--ink)" }, b)),
                                    }),
                                    (0, d.jsx)(o.y, {
                                      dataKey: "results",
                                      radius: [6, 6, 0, 0],
                                      maxBarSize: 14,
                                      children: u
                                        .slice(-14)
                                        .map((a, b) =>
                                          (0, d.jsx)(t.f, { fill: "var(--brand)" }, b),
                                        ),
                                    }),
                                  ],
                                }),
                              }),
                            }),
                            (0, d.jsx)("div", {
                              className: "mt-4 grid grid-cols-3 gap-3 text-center",
                              children: [
                                { label: "ROAS", value: "6.55\xd7" },
                                { label: "CTR", value: "2.4%" },
                                { label: "CPC", value: "৳12.7" },
                              ].map((a, b) =>
                                (0, d.jsxs)(
                                  e.P.div,
                                  {
                                    initial: { opacity: 0, y: 10 },
                                    animate: { opacity: 1, y: 0 },
                                    transition: { delay: 0.6 + 0.1 * b },
                                    className:
                                      "rounded-xl border border-border/60 bg-background/60 px-3 py-2 backdrop-blur",
                                    children: [
                                      (0, d.jsx)("div", {
                                        className:
                                          "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                                        children: a.label,
                                      }),
                                      (0, d.jsx)("div", {
                                        className: "text-base font-bold text-foreground",
                                        children: a.value,
                                      }),
                                    ],
                                  },
                                  a.label,
                                ),
                              ),
                            }),
                          ],
                        }),
                      }),
                      (0, d.jsxs)(e.P.div, {
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { opacity: 1, scale: 1 },
                        transition: { delay: 1, duration: 0.5 },
                        className:
                          "absolute -left-6 top-12 hidden rounded card-brutal bg-card px-4 py-3 backdrop-blur lg:block",
                        children: [
                          (0, d.jsx)("div", {
                            className:
                              "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                            children: "Today's spend",
                          }),
                          (0, d.jsx)("div", {
                            className: "mt-1 text-lg font-bold text-ink",
                            children: "৳18,420",
                          }),
                        ],
                      }),
                      (0, d.jsxs)(e.P.div, {
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { opacity: 1, scale: 1 },
                        transition: { delay: 1.2, duration: 0.5 },
                        className:
                          "absolute -right-4 -bottom-2 hidden items-center gap-2 rounded-full card-brutal bg-card px-4 py-2 lg:inline-flex",
                        children: [
                          (0, d.jsx)("span", { className: "h-2 w-2 rounded-full bg-success" }),
                          (0, d.jsx)("span", {
                            className: "text-xs font-semibold text-foreground",
                            children: "All accounts synced",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, d.jsx)("div", {
                className: "relative border-t border-border/60 bg-background/40 backdrop-blur",
                children: (0, d.jsx)("div", {
                  className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
                  children: (0, d.jsxs)("div", {
                    className:
                      "flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    children: [
                      (0, d.jsx)("span", { children: "Trusted by" }),
                      [
                        "Hive Marketing",
                        "BoostBD",
                        "Pixel & Penny",
                        "Lumen Studio",
                        "Fashion House BD",
                      ].map((a) =>
                        (0, d.jsx)(
                          "span",
                          { className: "opacity-70 transition hover:opacity-100", children: a },
                          a,
                        ),
                      ),
                    ],
                  }),
                }),
              }),
            ],
          });
        }
      },
      26713: (a) => {
        "use strict";
        a.exports = require("next/dist/shared/lib/router/utils/is-bot");
      },
      27207: (a, b, c) => {
        "use strict";
        c.d(b, { Navbar: () => s });
        var d = c(21124),
          e = c(3991),
          f = c.n(e),
          g = c(46422),
          h = c(70175),
          i = c(60988),
          j = c(75535),
          k = c(6130),
          l = c(38301),
          m = c(4085),
          n = c(35284),
          o = c(86851),
          p = c(32573),
          q = c(44943);
        let r = [
          { label: "Home", href: "#top" },
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how-it-works" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ];
        function s() {
          let { theme: a, toggle: b } = (0, p.D)(),
            [c, e] = (0, l.useState)(!1),
            [s, t] = (0, l.useState)(!1);
          return (0, d.jsx)(m.P.header, {
            initial: { y: -40, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            className: "fixed top-0 left-0 right-0 z-50 w-full",
            children: (0, d.jsx)("div", {
              className: (0, q.cn)(
                "px-3 sm:px-4 lg:px-6 transition-all duration-300",
                c ? "pt-3 pb-3" : "pt-4 pb-4 sm:pt-5 sm:pb-5",
              ),
              children: (0, d.jsxs)("nav", {
                className: (0, q.cn)(
                  "mx-auto flex max-w-7xl items-center justify-between gap-3 rounded card-brutal bg-background px-3 py-3.5 transition-all duration-300 sm:px-4 sm:py-4",
                  c ? "shadow-brutal" : "",
                ),
                children: [
                  (0, d.jsxs)(f(), {
                    href: "/",
                    className: "group flex items-center gap-2 shrink-0 pl-1",
                    children: [
                      (0, d.jsx)("span", {
                        className:
                          "relative flex h-9 w-9 items-center justify-center rounded bg-brand text-ink border-2 border-ink transition-transform duration-300 group-hover:rotate-12",
                        children: (0, d.jsx)(g.A, { className: "h-4 w-4 fill-ink" }),
                      }),
                      (0, d.jsxs)("span", {
                        className:
                          "text-sm font-bold tracking-tight whitespace-nowrap sm:text-base",
                        children: [
                          (0, d.jsx)("span", {
                            className: "hidden sm:inline",
                            children: "AdReportly",
                          }),
                          (0, d.jsx)("span", { className: "sm:hidden", children: "AdReportly" }),
                        ],
                      }),
                    ],
                  }),
                  (0, d.jsx)("div", {
                    className: "hidden items-center gap-0.5 lg:flex",
                    children: r.map((a) =>
                      (0, d.jsx)(
                        "a",
                        {
                          href: a.href,
                          className:
                            "whitespace-nowrap rounded px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-ink",
                          children: a.label,
                        },
                        a.label,
                      ),
                    ),
                  }),
                  (0, d.jsxs)("div", {
                    className: "flex items-center gap-1.5",
                    children: [
                      (0, d.jsx)(n.$, {
                        variant: "ghost",
                        size: "icon",
                        onClick: b,
                        "aria-label": "Toggle theme",
                        className: "rounded h-9 w-9 hover:bg-accent",
                        children:
                          "dark" === a
                            ? (0, d.jsx)(h.A, { className: "h-4 w-4" })
                            : (0, d.jsx)(i.A, { className: "h-4 w-4" }),
                      }),
                      (0, d.jsx)(n.$, {
                        asChild: !0,
                        variant: "ghost",
                        size: "sm",
                        className: "hidden rounded lg:inline-flex",
                        children: (0, d.jsx)(f(), { href: "/login", children: "Sign in" }),
                      }),
                      (0, d.jsx)(n.$, {
                        asChild: !0,
                        size: "sm",
                        className:
                          "hidden rounded bg-brand text-brand-foreground btn-brutal h-9 px-4 hover:bg-brand lg:inline-flex",
                        children: (0, d.jsxs)(f(), {
                          href: "/signup",
                          children: [
                            "Get Started ",
                            (0, d.jsx)(j.A, { className: "ml-1 h-3.5 w-3.5" }),
                          ],
                        }),
                      }),
                      (0, d.jsxs)(o.cj, {
                        open: s,
                        onOpenChange: t,
                        children: [
                          (0, d.jsx)(o.CG, {
                            asChild: !0,
                            children: (0, d.jsx)(n.$, {
                              variant: "outline",
                              size: "icon",
                              "aria-label": "Open menu",
                              className: "rounded h-9 w-9 border-2 border-ink bg-card lg:hidden",
                              children: (0, d.jsx)(k.A, { className: "h-4 w-4" }),
                            }),
                          }),
                          (0, d.jsxs)(o.h, {
                            side: "left",
                            className:
                              "w-[300px] border-r-2 border-ink bg-background p-0 sm:w-[340px]",
                            children: [
                              (0, d.jsx)(o.Fm, {
                                className: "border-b-2 border-ink/10 p-5",
                                children: (0, d.jsx)(o.qp, {
                                  asChild: !0,
                                  children: (0, d.jsxs)(f(), {
                                    href: "/",
                                    onClick: () => t(!1),
                                    className: "flex items-center gap-2.5",
                                    children: [
                                      (0, d.jsx)("span", {
                                        className:
                                          "flex h-9 w-9 items-center justify-center rounded bg-brand text-ink border-2 border-ink",
                                        children: (0, d.jsx)(g.A, {
                                          className: "h-4 w-4 fill-ink",
                                        }),
                                      }),
                                      (0, d.jsx)("span", {
                                        className: "text-base font-bold tracking-tight",
                                        children: "AdReportly",
                                      }),
                                    ],
                                  }),
                                }),
                              }),
                              (0, d.jsx)("nav", {
                                className: "flex flex-col gap-1 p-4",
                                children: r.map((a, b) =>
                                  (0, d.jsx)(
                                    o.kN,
                                    {
                                      asChild: !0,
                                      children: (0, d.jsxs)(m.P.a, {
                                        initial: { opacity: 0, x: -12 },
                                        animate: { opacity: 1, x: 0 },
                                        transition: { delay: 0.05 * b, duration: 0.3 },
                                        href: a.href,
                                        className:
                                          "group flex items-center justify-between rounded px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent",
                                        children: [
                                          (0, d.jsx)("span", { children: a.label }),
                                          (0, d.jsx)("span", {
                                            className:
                                              "text-muted-foreground transition-all group-hover:text-ink group-hover:translate-x-1",
                                            children: "→",
                                          }),
                                        ],
                                      }),
                                    },
                                    a.label,
                                  ),
                                ),
                              }),
                              (0, d.jsxs)("div", {
                                className:
                                  "mt-auto flex flex-col gap-2 border-t-2 border-ink/10 p-4",
                                children: [
                                  (0, d.jsx)(o.kN, {
                                    asChild: !0,
                                    children: (0, d.jsx)(n.$, {
                                      asChild: !0,
                                      variant: "outline",
                                      className:
                                        "w-full rounded bg-card btn-brutal h-auto py-3 hover:bg-card",
                                      children: (0, d.jsx)(f(), {
                                        href: "/login",
                                        children: "Sign in",
                                      }),
                                    }),
                                  }),
                                  (0, d.jsx)(o.kN, {
                                    asChild: !0,
                                    children: (0, d.jsx)(n.$, {
                                      asChild: !0,
                                      className:
                                        "w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand",
                                      children: (0, d.jsx)(f(), {
                                        href: "/signup",
                                        children: "Get Started",
                                      }),
                                    }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          });
        }
      },
      27864: (a, b, c) => {
        "use strict";
        c.d(b, { Features: () => n });
        var d = c(21124),
          e = c(4085),
          f = c(46422),
          g = c(14959);
        let h = (0, g.A)("lock", [
            [
              "rect",
              { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" },
            ],
            ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }],
          ]),
          i = (0, g.A)("chart-line", [
            ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
            ["path", { d: "m19 9-5 5-4-4-3 3", key: "2osh9i" }],
          ]);
        var j = c(65893);
        let k = (0, g.A)("globe", [
          ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
          ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
          ["path", { d: "M2 12h20", key: "9i4pu4" }],
        ]);
        var l = c(3663);
        let m = [
          {
            icon: f.A,
            title: "Real-time sync",
            desc: "Direct Graph API calls — never stale, always live.",
          },
          {
            icon: h,
            title: "AES-256 encryption",
            desc: "Access tokens encrypted at rest and never exposed.",
          },
          { icon: i, title: "Beautiful charts", desc: "Spend, results, ROAS visualized clearly." },
          {
            icon: j.A,
            title: "Multi-client",
            desc: "Manage unlimited clients from a single dashboard.",
          },
          { icon: k, title: "Secure share links", desc: "UUID tokens that expire automatically." },
          {
            icon: l.A,
            title: "PDF & CSV export",
            desc: "One-click branded reports your clients will love.",
          },
        ];
        function n() {
          return (0, d.jsx)("section", {
            id: "features",
            className: "relative py-28",
            children: (0, d.jsxs)("div", {
              className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
              children: [
                (0, d.jsxs)("div", {
                  className: "mx-auto max-w-2xl text-center",
                  children: [
                    (0, d.jsx)("span", {
                      className:
                        "inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink",
                      children: "Features",
                    }),
                    (0, d.jsx)("h2", {
                      className: "mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl",
                      children: "Built for ads agencies that ship reports daily",
                    }),
                  ],
                }),
                (0, d.jsx)("div", {
                  className: "mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
                  children: m.map((a, b) =>
                    (0, d.jsxs)(
                      e.P.div,
                      {
                        initial: { opacity: 0, y: 24 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: !0, margin: "-80px" },
                        transition: { duration: 0.5, delay: (b % 3) * 0.1 },
                        className:
                          "group relative overflow-hidden rounded card-brutal bg-card p-7 hover-lift",
                        children: [
                          (0, d.jsx)("div", {
                            "aria-hidden": !0,
                            className:
                              "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/40 blur-3xl",
                          }),
                          (0, d.jsx)("div", {
                            className:
                              "relative flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-brand",
                            children: (0, d.jsx)(a.icon, { className: "h-5 w-5" }),
                          }),
                          (0, d.jsx)("h3", {
                            className: "relative mt-5 text-base font-bold tracking-tight",
                            children: a.title,
                          }),
                          (0, d.jsx)("p", {
                            className:
                              "relative mt-1.5 text-sm leading-relaxed text-muted-foreground",
                            children: a.desc,
                          }),
                        ],
                      },
                      a.title,
                    ),
                  ),
                }),
              ],
            }),
          });
        }
      },
      28354: (a) => {
        "use strict";
        a.exports = require("util");
      },
      29245: (a, b, c) => {
        "use strict";
        c.d(b, { Stats: () => u });
        var d = c(21124),
          e = c(4085),
          f = c(38301),
          g = c(32717),
          h = c(65893),
          i = c(15952),
          j = c(14959);
        let k = (0, j.A)("earth", [
            ["path", { d: "M21.54 15H17a2 2 0 0 0-2 2v4.54", key: "1djwo0" }],
            [
              "path",
              {
                d: "M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17",
                key: "1tzkfa",
              },
            ],
            [
              "path",
              {
                d: "M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05",
                key: "14pb5j",
              },
            ],
            ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
          ]),
          l = (0, j.A)("shield-check", [
            [
              "path",
              {
                d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
                key: "oel41y",
              },
            ],
            ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }],
          ]),
          m = (0, j.A)("clock", [
            ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
            ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }],
          ]);
        var n = c(75234),
          o = c(75535),
          p = c(42378),
          q = c(35284),
          r = c(73610);
        let s = [
          {
            icon: g.A,
            value: 48,
            prefix: "৳",
            suffix: "M+",
            label: "Ad spend tracked",
            desc: "Across all connected Meta accounts",
          },
          {
            icon: h.A,
            value: 2400,
            suffix: "+",
            label: "Active agencies",
            desc: "Trust us with their client reporting",
          },
          {
            icon: i.A,
            value: 18500,
            suffix: "+",
            label: "Reports generated",
            desc: "Branded PDFs & live dashboards delivered",
          },
          {
            icon: k,
            value: 32,
            suffix: "+",
            label: "Countries",
            desc: "Agencies running campaigns worldwide",
          },
          {
            icon: l,
            value: 99.9,
            decimals: 1,
            suffix: "%",
            label: "Uptime SLA",
            desc: "Reliable infrastructure, always on",
          },
          {
            icon: m,
            value: 12,
            suffix: "\xd7",
            label: "Faster reporting",
            desc: "Compared to manual spreadsheet workflows",
          },
        ];
        function t({ stat: a, index: b }) {
          let { ref: c, formatted: g } = (function (a, b = 0, c = 1600) {
              let [d, e] = (0, f.useState)(0),
                g = (0, f.useRef)(null);
              return (
                (0, f.useRef)(!1),
                {
                  ref: g,
                  formatted:
                    b > 0
                      ? d.toFixed(b)
                      : d >= 1e3
                        ? Math.floor(d).toLocaleString()
                        : Math.floor(d).toString(),
                }
              );
            })(a.value, a.decimals ?? 0),
            h = a.icon;
          return (0, d.jsxs)(e.P.div, {
            initial: { opacity: 0, y: 24 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: !0, margin: "-80px" },
            transition: { duration: 0.5, delay: 0.06 * b },
            className:
              "group relative overflow-hidden rounded card-brutal bg-card p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant",
            children: [
              (0, d.jsx)("div", {
                className:
                  "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/15",
              }),
              (0, d.jsxs)("div", {
                className: "relative",
                children: [
                  (0, d.jsx)("div", {
                    className:
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary",
                    children: (0, d.jsx)(h, { className: "h-5 w-5" }),
                  }),
                  (0, d.jsxs)("div", {
                    className: "mt-5 flex items-baseline gap-1",
                    children: [
                      a.prefix &&
                        (0, d.jsx)("span", {
                          className: "font-display text-2xl font-bold text-foreground sm:text-3xl",
                          children: a.prefix,
                        }),
                      (0, d.jsx)("span", {
                        ref: c,
                        className:
                          "font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl",
                        children: g,
                      }),
                      a.suffix &&
                        (0, d.jsx)("span", {
                          className: "font-display text-2xl font-bold text-primary sm:text-3xl",
                          children: a.suffix,
                        }),
                    ],
                  }),
                  (0, d.jsx)("h3", {
                    className: "mt-2 text-sm font-semibold text-foreground",
                    children: a.label,
                  }),
                  (0, d.jsx)("p", {
                    className: "mt-1 text-sm text-muted-foreground",
                    children: a.desc,
                  }),
                ],
              }),
            ],
          });
        }
        function u() {
          return (0, d.jsxs)("section", {
            id: "stats",
            className: "relative py-24",
            children: [
              (0, d.jsx)("div", {
                "aria-hidden": !0,
                className:
                  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/15 via-brand/5 to-transparent",
              }),
              (0, d.jsx)("div", {
                "aria-hidden": !0,
                className:
                  "pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]",
              }),
              (0, d.jsxs)("div", {
                className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
                children: [
                  (0, d.jsxs)("div", {
                    className: "mx-auto max-w-2xl text-center",
                    children: [
                      (0, d.jsx)("span", {
                        className:
                          "inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink",
                        children: "By the numbers",
                      }),
                      (0, d.jsx)("h2", {
                        className:
                          "mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl",
                        children: "Trusted by agencies, proven at scale",
                      }),
                      (0, d.jsx)("p", {
                        className: "mt-4 text-base text-muted-foreground sm:text-lg",
                        children:
                          "Real numbers from real teams using our platform every day to manage Meta ad campaigns and deliver client reports.",
                      }),
                    ],
                  }),
                  (0, d.jsx)("div", {
                    className: "mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
                    children: s.map((a, b) => (0, d.jsx)(t, { stat: a, index: b }, a.label)),
                  }),
                  (0, d.jsx)(v, {}),
                ],
              }),
            ],
          });
        }
        function v() {
          let a = (0, p.useRouter)(),
            { user: b } = (0, r.A)();
          return (0, d.jsxs)(e.P.div, {
            initial: { opacity: 0, y: 24 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: !0, margin: "-80px" },
            transition: { duration: 0.5 },
            className:
              "relative mt-16 overflow-hidden rounded card-brutal bg-card p-8 text-center sm:p-10",
            children: [
              (0, d.jsx)("div", {
                className:
                  "pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5",
              }),
              (0, d.jsxs)("div", {
                className: "relative",
                children: [
                  (0, d.jsx)("div", {
                    className:
                      "mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary",
                    children: (0, d.jsx)(n.A, { className: "h-5 w-5" }),
                  }),
                  (0, d.jsx)("h3", {
                    className: "mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl",
                    children: "Ready to join thousands of agencies?",
                  }),
                  (0, d.jsx)("p", {
                    className: "mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base",
                    children:
                      "Start your 14-day free trial — no credit card required. Connect Meta in minutes and ship branded reports today.",
                  }),
                  (0, d.jsxs)(q.$, {
                    size: "lg",
                    className:
                      "mt-6 gap-2 rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand",
                    onClick: () => {
                      b ? a.push("/dashboard") : a.push("/login");
                    },
                    children: ["Get Started ", (0, d.jsx)(o.A, { className: "h-4 w-4" })],
                  }),
                ],
              }),
            ],
          });
        }
      },
      29294: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/work-async-storage.external.js");
      },
      30029: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("share-2", [
          ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
          ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
          ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
          ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
          ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }],
        ]);
      },
      31905: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("facebook", [
          [
            "path",
            {
              d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
              key: "1jg4f8",
            },
          ],
        ]);
      },
      32717: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("dollar-sign", [
          ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
          ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }],
        ]);
      },
      33873: (a) => {
        "use strict";
        a.exports = require("path");
      },
      37961: (a, b, c) => {
        (Promise.resolve().then(c.bind(c, 45816)),
          Promise.resolve().then(c.bind(c, 27864)),
          Promise.resolve().then(c.bind(c, 99483)),
          Promise.resolve().then(c.bind(c, 22237)),
          Promise.resolve().then(c.bind(c, 11272)),
          Promise.resolve().then(c.bind(c, 27207)),
          Promise.resolve().then(c.bind(c, 703)),
          Promise.resolve().then(c.bind(c, 29245)),
          Promise.resolve().then(c.bind(c, 55933)));
      },
      41025: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/dynamic-access-async-storage.external.js");
      },
      45816: (a, b, c) => {
        "use strict";
        c.d(b, { FAQ: () => aq });
        var d = c(21124),
          e = c(38301);
        let f = (0, c(14959).A)("message-circle", [
          [
            "path",
            {
              d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
              key: "1sd12s",
            },
          ],
        ]);
        var g = c(71563),
          h = c(15982),
          i = c(2332),
          j = c(43515),
          k = c(92808),
          l = c(87868),
          m = c(11720),
          n = c(99978),
          o = c(68829),
          p = c(29988),
          q = c(75656),
          r = "Collapsible",
          [s, t] = (0, i.A)(r),
          [u, v] = s(r),
          w = e.forwardRef((a, b) => {
            let {
                __scopeCollapsible: c,
                open: f,
                defaultOpen: g,
                disabled: h,
                onOpenChange: i,
                ...j
              } = a,
              [k, l] = (0, m.i)({ prop: f, defaultProp: g ?? !1, onChange: i, caller: r });
            return (0, d.jsx)(u, {
              scope: c,
              disabled: h,
              contentId: (0, q.B)(),
              open: k,
              onOpenToggle: e.useCallback(() => l((a) => !a), [l]),
              children: (0, d.jsx)(n.sG.div, {
                "data-state": C(k),
                "data-disabled": h ? "" : void 0,
                ...j,
                ref: b,
              }),
            });
          });
        w.displayName = r;
        var x = "CollapsibleTrigger",
          y = e.forwardRef((a, b) => {
            let { __scopeCollapsible: c, ...e } = a,
              f = v(x, c);
            return (0, d.jsx)(n.sG.button, {
              type: "button",
              "aria-controls": f.contentId,
              "aria-expanded": f.open || !1,
              "data-state": C(f.open),
              "data-disabled": f.disabled ? "" : void 0,
              disabled: f.disabled,
              ...e,
              ref: b,
              onClick: (0, l.mK)(a.onClick, f.onOpenToggle),
            });
          });
        y.displayName = x;
        var z = "CollapsibleContent",
          A = e.forwardRef((a, b) => {
            let { forceMount: c, ...e } = a,
              f = v(z, a.__scopeCollapsible);
            return (0, d.jsx)(p.C, {
              present: c || f.open,
              children: ({ present: a }) => (0, d.jsx)(B, { ...e, ref: b, present: a }),
            });
          });
        A.displayName = z;
        var B = e.forwardRef((a, b) => {
          let { __scopeCollapsible: c, present: f, children: g, ...h } = a,
            i = v(z, c),
            [j, l] = e.useState(f),
            m = e.useRef(null),
            p = (0, k.s)(b, m),
            q = e.useRef(0),
            r = q.current,
            s = e.useRef(0),
            t = s.current,
            u = i.open || j,
            w = e.useRef(u),
            x = e.useRef(void 0);
          return (
            e.useEffect(() => {
              let a = requestAnimationFrame(() => (w.current = !1));
              return () => cancelAnimationFrame(a);
            }, []),
            (0, o.N)(() => {
              let a = m.current;
              if (a) {
                ((x.current = x.current || {
                  transitionDuration: a.style.transitionDuration,
                  animationName: a.style.animationName,
                }),
                  (a.style.transitionDuration = "0s"),
                  (a.style.animationName = "none"));
                let b = a.getBoundingClientRect();
                ((q.current = b.height),
                  (s.current = b.width),
                  w.current ||
                    ((a.style.transitionDuration = x.current.transitionDuration),
                    (a.style.animationName = x.current.animationName)),
                  l(f));
              }
            }, [i.open, f]),
            (0, d.jsx)(n.sG.div, {
              "data-state": C(i.open),
              "data-disabled": i.disabled ? "" : void 0,
              id: i.contentId,
              hidden: !u,
              ...h,
              ref: p,
              style: {
                "--radix-collapsible-content-height": r ? `${r}px` : void 0,
                "--radix-collapsible-content-width": t ? `${t}px` : void 0,
                ...a.style,
              },
              children: u && g,
            })
          );
        });
        function C(a) {
          return a ? "open" : "closed";
        }
        var D = c(10498),
          E = "Accordion",
          F = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"],
          [G, H, I] = (0, j.N)(E),
          [J, K] = (0, i.A)(E, [I, t]),
          L = t(),
          M = e.forwardRef((a, b) => {
            let { type: c, ...e } = a;
            return (0, d.jsx)(G.Provider, {
              scope: a.__scopeAccordion,
              children:
                "multiple" === c
                  ? (0, d.jsx)(S, { ...e, ref: b })
                  : (0, d.jsx)(R, { ...e, ref: b }),
            });
          });
        M.displayName = E;
        var [N, O] = J(E),
          [P, Q] = J(E, { collapsible: !1 }),
          R = e.forwardRef((a, b) => {
            let {
                value: c,
                defaultValue: f,
                onValueChange: g = () => {},
                collapsible: h = !1,
                ...i
              } = a,
              [j, k] = (0, m.i)({ prop: c, defaultProp: f ?? "", onChange: g, caller: E });
            return (0, d.jsx)(N, {
              scope: a.__scopeAccordion,
              value: e.useMemo(() => (j ? [j] : []), [j]),
              onItemOpen: k,
              onItemClose: e.useCallback(() => h && k(""), [h, k]),
              children: (0, d.jsx)(P, {
                scope: a.__scopeAccordion,
                collapsible: h,
                children: (0, d.jsx)(V, { ...i, ref: b }),
              }),
            });
          }),
          S = e.forwardRef((a, b) => {
            let { value: c, defaultValue: f, onValueChange: g = () => {}, ...h } = a,
              [i, j] = (0, m.i)({ prop: c, defaultProp: f ?? [], onChange: g, caller: E }),
              k = e.useCallback((a) => j((b = []) => [...b, a]), [j]),
              l = e.useCallback((a) => j((b = []) => b.filter((b) => b !== a)), [j]);
            return (0, d.jsx)(N, {
              scope: a.__scopeAccordion,
              value: i,
              onItemOpen: k,
              onItemClose: l,
              children: (0, d.jsx)(P, {
                scope: a.__scopeAccordion,
                collapsible: !0,
                children: (0, d.jsx)(V, { ...h, ref: b }),
              }),
            });
          }),
          [T, U] = J(E),
          V = e.forwardRef((a, b) => {
            let { __scopeAccordion: c, disabled: f, dir: g, orientation: h = "vertical", ...i } = a,
              j = e.useRef(null),
              m = (0, k.s)(j, b),
              o = H(c),
              p = "ltr" === (0, D.jH)(g),
              q = (0, l.mK)(a.onKeyDown, (a) => {
                if (!F.includes(a.key)) return;
                let b = a.target,
                  c = o().filter((a) => !a.ref.current?.disabled),
                  d = c.findIndex((a) => a.ref.current === b),
                  e = c.length;
                if (-1 === d) return;
                a.preventDefault();
                let f = d,
                  g = e - 1,
                  i = () => {
                    (f = d + 1) > g && (f = 0);
                  },
                  j = () => {
                    (f = d - 1) < 0 && (f = g);
                  };
                switch (a.key) {
                  case "Home":
                    f = 0;
                    break;
                  case "End":
                    f = g;
                    break;
                  case "ArrowRight":
                    "horizontal" === h && (p ? i() : j());
                    break;
                  case "ArrowDown":
                    "vertical" === h && i();
                    break;
                  case "ArrowLeft":
                    "horizontal" === h && (p ? j() : i());
                    break;
                  case "ArrowUp":
                    "vertical" === h && j();
                }
                let k = f % e;
                c[k].ref.current?.focus();
              });
            return (0, d.jsx)(T, {
              scope: c,
              disabled: f,
              direction: g,
              orientation: h,
              children: (0, d.jsx)(G.Slot, {
                scope: c,
                children: (0, d.jsx)(n.sG.div, {
                  ...i,
                  "data-orientation": h,
                  ref: m,
                  onKeyDown: f ? void 0 : q,
                }),
              }),
            });
          }),
          W = "AccordionItem",
          [X, Y] = J(W),
          Z = e.forwardRef((a, b) => {
            let { __scopeAccordion: c, value: e, ...f } = a,
              g = U(W, c),
              h = O(W, c),
              i = L(c),
              j = (0, q.B)(),
              k = (e && h.value.includes(e)) || !1,
              l = g.disabled || a.disabled;
            return (0, d.jsx)(X, {
              scope: c,
              open: k,
              disabled: l,
              triggerId: j,
              children: (0, d.jsx)(w, {
                "data-orientation": g.orientation,
                "data-state": ae(k),
                ...i,
                ...f,
                ref: b,
                disabled: l,
                open: k,
                onOpenChange: (a) => {
                  a ? h.onItemOpen(e) : h.onItemClose(e);
                },
              }),
            });
          });
        Z.displayName = W;
        var $ = "AccordionHeader",
          _ = e.forwardRef((a, b) => {
            let { __scopeAccordion: c, ...e } = a,
              f = U(E, c),
              g = Y($, c);
            return (0, d.jsx)(n.sG.h3, {
              "data-orientation": f.orientation,
              "data-state": ae(g.open),
              "data-disabled": g.disabled ? "" : void 0,
              ...e,
              ref: b,
            });
          });
        _.displayName = $;
        var aa = "AccordionTrigger",
          ab = e.forwardRef((a, b) => {
            let { __scopeAccordion: c, ...e } = a,
              f = U(E, c),
              g = Y(aa, c),
              h = Q(aa, c),
              i = L(c);
            return (0, d.jsx)(G.ItemSlot, {
              scope: c,
              children: (0, d.jsx)(y, {
                "aria-disabled": (g.open && !h.collapsible) || void 0,
                "data-orientation": f.orientation,
                id: g.triggerId,
                ...i,
                ...e,
                ref: b,
              }),
            });
          });
        ab.displayName = aa;
        var ac = "AccordionContent",
          ad = e.forwardRef((a, b) => {
            let { __scopeAccordion: c, ...e } = a,
              f = U(E, c),
              g = Y(ac, c),
              h = L(c);
            return (0, d.jsx)(A, {
              role: "region",
              "aria-labelledby": g.triggerId,
              "data-orientation": f.orientation,
              ...h,
              ...e,
              ref: b,
              style: {
                "--radix-accordion-content-height": "var(--radix-collapsible-content-height)",
                "--radix-accordion-content-width": "var(--radix-collapsible-content-width)",
                ...a.style,
              },
            });
          });
        function ae(a) {
          return a ? "open" : "closed";
        }
        ad.displayName = ac;
        var af = c(85351),
          ag = c(44943);
        let ah = e.forwardRef(({ className: a, ...b }, c) =>
          (0, d.jsx)(Z, { ref: c, className: (0, ag.cn)("border-b", a), ...b }),
        );
        ah.displayName = "AccordionItem";
        let ai = e.forwardRef(({ className: a, children: b, ...c }, e) =>
          (0, d.jsx)(_, {
            className: "flex",
            children: (0, d.jsxs)(ab, {
              ref: e,
              className: (0, ag.cn)(
                "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
                a,
              ),
              ...c,
              children: [
                b,
                (0, d.jsx)(af.A, {
                  className:
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                }),
              ],
            }),
          }),
        );
        ai.displayName = ab.displayName;
        let aj = e.forwardRef(({ className: a, children: b, ...c }, e) =>
          (0, d.jsx)(ad, {
            ref: e,
            className:
              "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
            ...c,
            children: (0, d.jsx)("div", { className: (0, ag.cn)("pb-4 pt-0", a), children: b }),
          }),
        );
        aj.displayName = ad.displayName;
        var ak = c(35284),
          al = c(93758);
        let am = e.forwardRef(({ className: a, ...b }, c) =>
          (0, d.jsx)("textarea", {
            className: (0, ag.cn)(
              "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              a,
            ),
            ref: c,
            ...b,
          }),
        );
        am.displayName = "Textarea";
        var an = c(68120),
          ao = c(42830);
        let ap = [
          {
            q: "Is my Facebook access token safe?",
            a: "Yes. Tokens are encrypted with AES-256-GCM before being stored, and only the server can decrypt them when calling the Graph API. They are never sent to the browser.",
          },
          {
            q: "How do client share links work?",
            a: "When you click 'Share with Client', we generate a unique random UUID token tied to a single campaign with an expiry date you choose (7 / 30 / 60 / 90 days). The client opens a read-only dashboard — they cannot see any other campaign or your account.",
          },
          {
            q: "Do you cache data or always pull fresh?",
            a: "By default we call the Graph API directly so you always see real-time data. Pro and Enterprise plans include optional 1-hour caching to reduce API calls.",
          },
          {
            q: "What happens when a share link expires?",
            a: "The link returns a friendly 'expired' page. You can generate a new one anytime from the campaign or Reports page.",
          },
          {
            q: "Can I export reports as PDF or CSV?",
            a: "Yes. The Reports page lets you generate branded PDF or CSV reports for any client and date range with one click.",
          },
          {
            q: "Does it work on mobile?",
            a: "Absolutely. Both the agency dashboard and client share view are fully responsive and look great on any device.",
          },
        ];
        function aq() {
          let [a, b] = (0, e.useState)({ name: "", email: "", message: "" }),
            [c, i] = (0, e.useState)(!1);
          return (0, d.jsx)("section", {
            id: "faq",
            className: "py-24",
            children: (0, d.jsx)("div", {
              className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
              children: (0, d.jsxs)("div", {
                className: "grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-stretch",
                children: [
                  (0, d.jsxs)("div", {
                    className: "flex flex-col",
                    children: [
                      (0, d.jsxs)("div", {
                        children: [
                          (0, d.jsx)("span", {
                            className:
                              "inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink",
                            children: "FAQ",
                          }),
                          (0, d.jsx)("h2", {
                            className:
                              "mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl",
                            children: "Frequently asked questions",
                          }),
                          (0, d.jsx)("p", {
                            className: "mt-3 text-muted-foreground",
                            children: "Everything you need to know about the product.",
                          }),
                        ],
                      }),
                      (0, d.jsx)(M, {
                        type: "single",
                        collapsible: !0,
                        className: "mt-8 flex-1 space-y-3",
                        children: ap.map((a, b) =>
                          (0, d.jsxs)(
                            ah,
                            {
                              value: `item-${b}`,
                              className: "rounded card-brutal bg-card px-5",
                              children: [
                                (0, d.jsx)(ai, {
                                  className: "text-left text-base font-semibold hover:no-underline",
                                  children: a.q,
                                }),
                                (0, d.jsx)(aj, {
                                  className: "text-sm text-muted-foreground",
                                  children: a.a,
                                }),
                              ],
                            },
                            b,
                          ),
                        ),
                      }),
                    ],
                  }),
                  (0, d.jsxs)("div", {
                    id: "contact",
                    className: "flex flex-col",
                    children: [
                      (0, d.jsxs)("div", {
                        children: [
                          (0, d.jsxs)("span", {
                            className:
                              "inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink",
                            children: [(0, d.jsx)(f, { className: "h-3 w-3" }), "Contact us"],
                          }),
                          (0, d.jsx)("h2", {
                            className:
                              "mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl",
                            children: "Still have questions?",
                          }),
                          (0, d.jsx)("p", {
                            className: "mt-3 text-muted-foreground",
                            children: "Send us a message and our team will reply within 24 hours.",
                          }),
                        ],
                      }),
                      (0, d.jsx)("form", {
                        onSubmit: (a) => {
                          (a.preventDefault(),
                            i(!0),
                            setTimeout(() => {
                              (ao.oR.success(
                                "Message sent! We'll get back to you within 24 hours.",
                              ),
                                b({ name: "", email: "", message: "" }),
                                i(!1));
                            }, 700));
                        },
                        className:
                          "mt-8 flex-1 rounded card-brutal bg-card p-6 sm:p-7 flex flex-col",
                        children: (0, d.jsxs)("div", {
                          className: "flex flex-1 flex-col space-y-4",
                          children: [
                            (0, d.jsxs)("div", {
                              className: "grid gap-4 sm:grid-cols-2",
                              children: [
                                (0, d.jsxs)("div", {
                                  className: "space-y-1.5",
                                  children: [
                                    (0, d.jsx)(an.J, { htmlFor: "contact-name", children: "Name" }),
                                    (0, d.jsx)(al.p, {
                                      id: "contact-name",
                                      placeholder: "Jane Doe",
                                      required: !0,
                                      maxLength: 100,
                                      className: "rounded",
                                      value: a.name,
                                      onChange: (c) => b({ ...a, name: c.target.value }),
                                    }),
                                  ],
                                }),
                                (0, d.jsxs)("div", {
                                  className: "space-y-1.5",
                                  children: [
                                    (0, d.jsx)(an.J, {
                                      htmlFor: "contact-email",
                                      children: "Email",
                                    }),
                                    (0, d.jsx)(al.p, {
                                      id: "contact-email",
                                      type: "email",
                                      placeholder: "jane@agency.com",
                                      required: !0,
                                      maxLength: 255,
                                      className: "rounded",
                                      value: a.email,
                                      onChange: (c) => b({ ...a, email: c.target.value }),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, d.jsxs)("div", {
                              className: "flex flex-1 flex-col space-y-1.5",
                              children: [
                                (0, d.jsx)(an.J, {
                                  htmlFor: "contact-message",
                                  children: "Message",
                                }),
                                (0, d.jsx)(am, {
                                  id: "contact-message",
                                  placeholder: "How can we help?",
                                  required: !0,
                                  maxLength: 1e3,
                                  className: "rounded flex-1 min-h-[140px]",
                                  value: a.message,
                                  onChange: (c) => b({ ...a, message: c.target.value }),
                                }),
                              ],
                            }),
                            (0, d.jsxs)(ak.$, {
                              type: "submit",
                              disabled: c,
                              className:
                                "w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand font-semibold",
                              children: [
                                (0, d.jsx)(g.A, { className: "h-4 w-4" }),
                                c ? "Sending..." : "Send message",
                              ],
                            }),
                            (0, d.jsxs)("div", {
                              className:
                                "flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground",
                              children: [
                                (0, d.jsx)(h.A, { className: "h-3.5 w-3.5" }),
                                "Or email us at",
                                " ",
                                (0, d.jsx)("span", {
                                  className: "font-medium text-foreground",
                                  children: "hello@adgleam.com",
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          });
        }
      },
      46267: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("arrow-up-right", [
          ["path", { d: "M7 7h10v10", key: "1tivn9" }],
          ["path", { d: "M7 17 17 7", key: "1vkiza" }],
        ]);
      },
      48435: (a, b, c) => {
        "use strict";
        (c.r(b),
          c.d(b, {
            GlobalError: () => D.a,
            __next_app__: () => J,
            handler: () => L,
            pages: () => I,
            routeModule: () => K,
            tree: () => H,
          }));
        var d = c(49754),
          e = c(9117),
          f = c(46595),
          g = c(32324),
          h = c(39326),
          i = c(38928),
          j = c(20175),
          k = c(12),
          l = c(54290),
          m = c(12696),
          n = c(82802),
          o = c(77533),
          p = c(45229),
          q = c(32822),
          r = c(261),
          s = c(26453),
          t = c(52474),
          u = c(26713),
          v = c(51356),
          w = c(62685),
          x = c(36225),
          y = c(63446),
          z = c(2762),
          A = c(45742),
          B = c(86439),
          C = c(81170),
          D = c.n(C),
          E = c(62506),
          F = c(91203),
          G = {};
        for (let a in E)
          0 >
            [
              "default",
              "tree",
              "pages",
              "GlobalError",
              "__next_app__",
              "routeModule",
              "handler",
            ].indexOf(a) && (G[a] = () => E[a]);
        c.d(b, G);
        let H = [
            "",
            {
              children: [
                "__PAGE__",
                {},
                {
                  page: [
                    () => Promise.resolve().then(c.bind(c, 60967)),
                    "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/app/page.tsx",
                  ],
                },
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(c.bind(c, 51472)),
                "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/app/layout.tsx",
              ],
              "global-error": [
                () => Promise.resolve().then(c.t.bind(c, 81170, 23)),
                "next/dist/client/components/builtin/global-error.js",
              ],
              "not-found": [
                () => Promise.resolve().then(c.bind(c, 59732)),
                "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/app/not-found.tsx",
              ],
              forbidden: [
                () => Promise.resolve().then(c.t.bind(c, 90461, 23)),
                "next/dist/client/components/builtin/forbidden.js",
              ],
              unauthorized: [
                () => Promise.resolve().then(c.t.bind(c, 32768, 23)),
                "next/dist/client/components/builtin/unauthorized.js",
              ],
            },
          ],
          I = ["/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/app/page.tsx"],
          J = { require: c, loadChunk: () => Promise.resolve() },
          K = new d.AppPageRouteModule({
            definition: {
              kind: e.RouteKind.APP_PAGE,
              page: "/page",
              pathname: "/",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: H },
            distDir: ".next",
            relativeProjectDir: "",
          });
        async function L(a, b, d) {
          var C;
          let G = "/page";
          "/index" === G && (G = "/");
          let M = (0, h.getRequestMeta)(a, "postponed"),
            N = (0, h.getRequestMeta)(a, "minimalMode"),
            O = await K.prepare(a, b, { srcPage: G, multiZoneDraftMode: !1 });
          if (!O)
            return (
              (b.statusCode = 400),
              b.end("Bad Request"),
              null == d.waitUntil || d.waitUntil.call(d, Promise.resolve()),
              null
            );
          let {
              buildId: P,
              query: Q,
              params: R,
              parsedUrl: S,
              pageIsDynamic: T,
              buildManifest: U,
              nextFontManifest: V,
              reactLoadableManifest: W,
              serverActionsManifest: X,
              clientReferenceManifest: Y,
              subresourceIntegrityManifest: Z,
              prerenderManifest: $,
              isDraftMode: _,
              resolvedPathname: aa,
              revalidateOnlyGenerated: ab,
              routerServerContext: ac,
              nextConfig: ad,
              interceptionRoutePatterns: ae,
            } = O,
            af = S.pathname || "/",
            ag = (0, r.normalizeAppPath)(G),
            { isOnDemandRevalidate: ah } = O,
            ai = K.match(af, $),
            aj = !!$.routes[aa],
            ak = !!(ai || aj || $.routes[ag]),
            al = a.headers["user-agent"] || "",
            am = (0, u.getBotType)(al),
            an = (0, p.isHtmlBotRequest)(a),
            ao =
              (0, h.getRequestMeta)(a, "isPrefetchRSCRequest") ??
              "1" === a.headers[t.NEXT_ROUTER_PREFETCH_HEADER],
            ap = (0, h.getRequestMeta)(a, "isRSCRequest") ?? !!a.headers[t.RSC_HEADER],
            aq = (0, s.getIsPossibleServerAction)(a),
            ar =
              (0, m.checkIsAppPPREnabled)(ad.experimental.ppr) &&
              (null == (C = $.routes[ag] ?? $.dynamicRoutes[ag]) ? void 0 : C.renderingMode) ===
                "PARTIALLY_STATIC",
            as = !1,
            at = !1,
            au = ar ? M : void 0,
            av = ar && ap && !ao,
            aw = (0, h.getRequestMeta)(a, "segmentPrefetchRSCRequest"),
            ax = !al || (0, p.shouldServeStreamingMetadata)(al, ad.htmlLimitedBots);
          an && ar && ((ak = !1), (ax = !1));
          let ay = !0 === K.isDev || !ak || "string" == typeof M || av,
            az = an && ar,
            aA = null;
          _ || !ak || ay || aq || au || av || (aA = aa);
          let aB = aA;
          (!aB && K.isDev && (aB = aa), K.isDev || _ || !ak || !ap || av || (0, k.d)(a.headers));
          let aC = {
            ...E,
            tree: H,
            pages: I,
            GlobalError: D(),
            handler: L,
            routeModule: K,
            __next_app__: J,
          };
          X &&
            Y &&
            (0, o.setReferenceManifestsSingleton)({
              page: G,
              clientReferenceManifest: Y,
              serverActionsManifest: X,
              serverModuleMap: (0, q.createServerModuleMap)({ serverActionsManifest: X }),
            });
          let aD = a.method || "GET",
            aE = (0, g.getTracer)(),
            aF = aE.getActiveScopeSpan();
          try {
            let f = K.getVaryHeader(aa, ae);
            b.setHeader("Vary", f);
            let k = async (c, d) => {
                let e = new l.NodeNextRequest(a),
                  f = new l.NodeNextResponse(b);
                return K.render(e, f, d).finally(() => {
                  if (!c) return;
                  c.setAttributes({ "http.status_code": b.statusCode, "next.rsc": !1 });
                  let d = aE.getRootSpanAttributes();
                  if (!d) return;
                  if (d.get("next.span_type") !== i.BaseServerSpan.handleRequest)
                    return void console.warn(
                      `Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`,
                    );
                  let e = d.get("next.route");
                  if (e) {
                    let a = `${aD} ${e}`;
                    (c.setAttributes({ "next.route": e, "http.route": e, "next.span_name": a }),
                      c.updateName(a));
                  } else c.updateName(`${aD} ${a.url}`);
                });
              },
              m = async ({ span: e, postponed: f, fallbackRouteParams: g }) => {
                let i = {
                    query: Q,
                    params: R,
                    page: ag,
                    sharedContext: { buildId: P },
                    serverComponentsHmrCache: (0, h.getRequestMeta)(a, "serverComponentsHmrCache"),
                    fallbackRouteParams: g,
                    renderOpts: {
                      App: () => null,
                      Document: () => null,
                      pageConfig: {},
                      ComponentMod: aC,
                      Component: (0, j.T)(aC),
                      params: R,
                      routeModule: K,
                      page: G,
                      postponed: f,
                      shouldWaitOnAllReady: az,
                      serveStreamingMetadata: ax,
                      supportsDynamicResponse: "string" == typeof f || ay,
                      buildManifest: U,
                      nextFontManifest: V,
                      reactLoadableManifest: W,
                      subresourceIntegrityManifest: Z,
                      serverActionsManifest: X,
                      clientReferenceManifest: Y,
                      setIsrStatus: null == ac ? void 0 : ac.setIsrStatus,
                      dir: c(33873).join(process.cwd(), K.relativeProjectDir),
                      isDraftMode: _,
                      isRevalidate: ak && !f && !av,
                      botType: am,
                      isOnDemandRevalidate: ah,
                      isPossibleServerAction: aq,
                      assetPrefix: ad.assetPrefix,
                      nextConfigOutput: ad.output,
                      crossOrigin: ad.crossOrigin,
                      trailingSlash: ad.trailingSlash,
                      previewProps: $.preview,
                      deploymentId: ad.deploymentId,
                      enableTainting: ad.experimental.taint,
                      htmlLimitedBots: ad.htmlLimitedBots,
                      devtoolSegmentExplorer: ad.experimental.devtoolSegmentExplorer,
                      reactMaxHeadersLength: ad.reactMaxHeadersLength,
                      multiZoneDraftMode: !1,
                      incrementalCache: (0, h.getRequestMeta)(a, "incrementalCache"),
                      cacheLifeProfiles: ad.experimental.cacheLife,
                      basePath: ad.basePath,
                      serverActions: ad.experimental.serverActions,
                      ...(as
                        ? {
                            nextExport: !0,
                            supportsDynamicResponse: !1,
                            isStaticGeneration: !0,
                            isRevalidate: !0,
                            isDebugDynamicAccesses: as,
                          }
                        : {}),
                      experimental: {
                        isRoutePPREnabled: ar,
                        expireTime: ad.expireTime,
                        staleTimes: ad.experimental.staleTimes,
                        cacheComponents: !!ad.experimental.cacheComponents,
                        clientSegmentCache: !!ad.experimental.clientSegmentCache,
                        clientParamParsing: !!ad.experimental.clientParamParsing,
                        dynamicOnHover: !!ad.experimental.dynamicOnHover,
                        inlineCss: !!ad.experimental.inlineCss,
                        authInterrupts: !!ad.experimental.authInterrupts,
                        clientTraceMetadata: ad.experimental.clientTraceMetadata || [],
                      },
                      waitUntil: d.waitUntil,
                      onClose: (a) => {
                        b.on("close", a);
                      },
                      onAfterTaskError: () => {},
                      onInstrumentationRequestError: (b, c, d) => K.onRequestError(a, b, d, ac),
                      err: (0, h.getRequestMeta)(a, "invokeError"),
                      dev: K.isDev,
                    },
                  },
                  l = await k(e, i),
                  { metadata: m } = l,
                  { cacheControl: n, headers: o = {}, fetchTags: p } = m;
                if (
                  (p && (o[y.NEXT_CACHE_TAGS_HEADER] = p),
                  (a.fetchMetrics = m.fetchMetrics),
                  ak && (null == n ? void 0 : n.revalidate) === 0 && !K.isDev && !ar)
                ) {
                  let a = m.staticBailoutInfo,
                    b = Object.defineProperty(
                      Error(`Page changed from static to dynamic at runtime ${aa}${(null == a ? void 0 : a.description) ? `, reason: ${a.description}` : ""}
see more here https://nextjs.org/docs/messages/app-static-to-dynamic-error`),
                      "__NEXT_ERROR_CODE",
                      { value: "E132", enumerable: !1, configurable: !0 },
                    );
                  if (null == a ? void 0 : a.stack) {
                    let c = a.stack;
                    b.stack = b.message + c.substring(c.indexOf("\n"));
                  }
                  throw b;
                }
                return {
                  value: {
                    kind: v.CachedRouteKind.APP_PAGE,
                    html: l,
                    headers: o,
                    rscData: m.flightData,
                    postponed: m.postponed,
                    status: m.statusCode,
                    segmentData: m.segmentData,
                  },
                  cacheControl: n,
                };
              },
              o = async ({ hasResolved: c, previousCacheEntry: f, isRevalidating: g, span: i }) => {
                let j,
                  k = !1 === K.isDev,
                  l = c || b.writableEnded;
                if (ah && ab && !f && !N)
                  return (
                    (null == ac ? void 0 : ac.render404)
                      ? await ac.render404(a, b)
                      : ((b.statusCode = 404), b.end("This page could not be found")),
                    null
                  );
                if (
                  (ai && (j = (0, w.parseFallbackField)(ai.fallback)),
                  j === w.FallbackMode.PRERENDER &&
                    (0, u.isBot)(al) &&
                    (!ar || an) &&
                    (j = w.FallbackMode.BLOCKING_STATIC_RENDER),
                  (null == f ? void 0 : f.isStale) === -1 && (ah = !0),
                  ah &&
                    (j !== w.FallbackMode.NOT_FOUND || f) &&
                    (j = w.FallbackMode.BLOCKING_STATIC_RENDER),
                  !N &&
                    j !== w.FallbackMode.BLOCKING_STATIC_RENDER &&
                    aB &&
                    !l &&
                    !_ &&
                    T &&
                    (k || !aj))
                ) {
                  let b;
                  if ((k || ai) && j === w.FallbackMode.NOT_FOUND) throw new B.NoFallbackError();
                  if (ar && !ap) {
                    let c =
                      "string" == typeof (null == ai ? void 0 : ai.fallback)
                        ? ai.fallback
                        : k
                          ? ag
                          : null;
                    if (
                      ((b = await K.handleResponse({
                        cacheKey: c,
                        req: a,
                        nextConfig: ad,
                        routeKind: e.RouteKind.APP_PAGE,
                        isFallback: !0,
                        prerenderManifest: $,
                        isRoutePPREnabled: ar,
                        responseGenerator: async () =>
                          m({
                            span: i,
                            postponed: void 0,
                            fallbackRouteParams: k || at ? (0, n.u)(ag) : null,
                          }),
                        waitUntil: d.waitUntil,
                      })),
                      null === b)
                    )
                      return null;
                    if (b) return (delete b.cacheControl, b);
                  }
                }
                let o = ah || g || !au ? void 0 : au;
                if (as && void 0 !== o)
                  return {
                    cacheControl: { revalidate: 1, expire: void 0 },
                    value: {
                      kind: v.CachedRouteKind.PAGES,
                      html: x.default.EMPTY,
                      pageData: {},
                      headers: void 0,
                      status: void 0,
                    },
                  };
                let p =
                  T && ar && ((0, h.getRequestMeta)(a, "renderFallbackShell") || at)
                    ? (0, n.u)(af)
                    : null;
                return m({ span: i, postponed: o, fallbackRouteParams: p });
              },
              p = async (c) => {
                var f, g, i, j, k;
                let l,
                  n = await K.handleResponse({
                    cacheKey: aA,
                    responseGenerator: (a) => o({ span: c, ...a }),
                    routeKind: e.RouteKind.APP_PAGE,
                    isOnDemandRevalidate: ah,
                    isRoutePPREnabled: ar,
                    req: a,
                    nextConfig: ad,
                    prerenderManifest: $,
                    waitUntil: d.waitUntil,
                  });
                if (
                  (_ &&
                    b.setHeader(
                      "Cache-Control",
                      "private, no-cache, no-store, max-age=0, must-revalidate",
                    ),
                  K.isDev && b.setHeader("Cache-Control", "no-store, must-revalidate"),
                  !n)
                ) {
                  if (aA)
                    throw Object.defineProperty(
                      Error("invariant: cache entry required but not generated"),
                      "__NEXT_ERROR_CODE",
                      { value: "E62", enumerable: !1, configurable: !0 },
                    );
                  return null;
                }
                if ((null == (f = n.value) ? void 0 : f.kind) !== v.CachedRouteKind.APP_PAGE)
                  throw Object.defineProperty(
                    Error(
                      `Invariant app-page handler received invalid cache entry ${null == (i = n.value) ? void 0 : i.kind}`,
                    ),
                    "__NEXT_ERROR_CODE",
                    { value: "E707", enumerable: !1, configurable: !0 },
                  );
                let p = "string" == typeof n.value.postponed;
                ak &&
                  !av &&
                  (!p || ao) &&
                  (N ||
                    b.setHeader(
                      "x-nextjs-cache",
                      ah ? "REVALIDATED" : n.isMiss ? "MISS" : n.isStale ? "STALE" : "HIT",
                    ),
                  b.setHeader(t.NEXT_IS_PRERENDER_HEADER, "1"));
                let { value: q } = n;
                if (au) l = { revalidate: 0, expire: void 0 };
                else if (N && ap && !ao && ar) l = { revalidate: 0, expire: void 0 };
                else if (!K.isDev)
                  if (_) l = { revalidate: 0, expire: void 0 };
                  else if (ak) {
                    if (n.cacheControl)
                      if ("number" == typeof n.cacheControl.revalidate) {
                        if (n.cacheControl.revalidate < 1)
                          throw Object.defineProperty(
                            Error(
                              `Invalid revalidate configuration provided: ${n.cacheControl.revalidate} < 1`,
                            ),
                            "__NEXT_ERROR_CODE",
                            { value: "E22", enumerable: !1, configurable: !0 },
                          );
                        l = {
                          revalidate: n.cacheControl.revalidate,
                          expire:
                            (null == (j = n.cacheControl) ? void 0 : j.expire) ?? ad.expireTime,
                        };
                      } else l = { revalidate: y.CACHE_ONE_YEAR, expire: void 0 };
                  } else b.getHeader("Cache-Control") || (l = { revalidate: 0, expire: void 0 });
                if (
                  ((n.cacheControl = l),
                  "string" == typeof aw &&
                    (null == q ? void 0 : q.kind) === v.CachedRouteKind.APP_PAGE &&
                    q.segmentData)
                ) {
                  b.setHeader(t.NEXT_DID_POSTPONE_HEADER, "2");
                  let c = null == (k = q.headers) ? void 0 : k[y.NEXT_CACHE_TAGS_HEADER];
                  N && ak && c && "string" == typeof c && b.setHeader(y.NEXT_CACHE_TAGS_HEADER, c);
                  let d = q.segmentData.get(aw);
                  return void 0 !== d
                    ? (0, A.sendRenderResult)({
                        req: a,
                        res: b,
                        generateEtags: ad.generateEtags,
                        poweredByHeader: ad.poweredByHeader,
                        result: x.default.fromStatic(d, t.RSC_CONTENT_TYPE_HEADER),
                        cacheControl: n.cacheControl,
                      })
                    : ((b.statusCode = 204),
                      (0, A.sendRenderResult)({
                        req: a,
                        res: b,
                        generateEtags: ad.generateEtags,
                        poweredByHeader: ad.poweredByHeader,
                        result: x.default.EMPTY,
                        cacheControl: n.cacheControl,
                      }));
                }
                let r = (0, h.getRequestMeta)(a, "onCacheEntry");
                if (
                  r &&
                  (await r(
                    { ...n, value: { ...n.value, kind: "PAGE" } },
                    { url: (0, h.getRequestMeta)(a, "initURL") },
                  ))
                )
                  return null;
                if (p && au)
                  throw Object.defineProperty(
                    Error("Invariant: postponed state should not be present on a resume request"),
                    "__NEXT_ERROR_CODE",
                    { value: "E396", enumerable: !1, configurable: !0 },
                  );
                if (q.headers) {
                  let a = { ...q.headers };
                  for (let [c, d] of ((N && ak) || delete a[y.NEXT_CACHE_TAGS_HEADER],
                  Object.entries(a)))
                    if (void 0 !== d)
                      if (Array.isArray(d)) for (let a of d) b.appendHeader(c, a);
                      else ("number" == typeof d && (d = d.toString()), b.appendHeader(c, d));
                }
                let s = null == (g = q.headers) ? void 0 : g[y.NEXT_CACHE_TAGS_HEADER];
                if (
                  (N && ak && s && "string" == typeof s && b.setHeader(y.NEXT_CACHE_TAGS_HEADER, s),
                  !q.status || (ap && ar) || (b.statusCode = q.status),
                  !N && q.status && F.RedirectStatusCode[q.status] && ap && (b.statusCode = 200),
                  p && b.setHeader(t.NEXT_DID_POSTPONE_HEADER, "1"),
                  ap && !_)
                ) {
                  if (void 0 === q.rscData) {
                    if (q.postponed)
                      throw Object.defineProperty(
                        Error("Invariant: Expected postponed to be undefined"),
                        "__NEXT_ERROR_CODE",
                        { value: "E372", enumerable: !1, configurable: !0 },
                      );
                    return (0, A.sendRenderResult)({
                      req: a,
                      res: b,
                      generateEtags: ad.generateEtags,
                      poweredByHeader: ad.poweredByHeader,
                      result: q.html,
                      cacheControl: av ? { revalidate: 0, expire: void 0 } : n.cacheControl,
                    });
                  }
                  return (0, A.sendRenderResult)({
                    req: a,
                    res: b,
                    generateEtags: ad.generateEtags,
                    poweredByHeader: ad.poweredByHeader,
                    result: x.default.fromStatic(q.rscData, t.RSC_CONTENT_TYPE_HEADER),
                    cacheControl: n.cacheControl,
                  });
                }
                let u = q.html;
                if (!p || N || ap)
                  return (0, A.sendRenderResult)({
                    req: a,
                    res: b,
                    generateEtags: ad.generateEtags,
                    poweredByHeader: ad.poweredByHeader,
                    result: u,
                    cacheControl: n.cacheControl,
                  });
                if (as)
                  return (
                    u.push(
                      new ReadableStream({
                        start(a) {
                          (a.enqueue(z.ENCODED_TAGS.CLOSED.BODY_AND_HTML), a.close());
                        },
                      }),
                    ),
                    (0, A.sendRenderResult)({
                      req: a,
                      res: b,
                      generateEtags: ad.generateEtags,
                      poweredByHeader: ad.poweredByHeader,
                      result: u,
                      cacheControl: { revalidate: 0, expire: void 0 },
                    })
                  );
                let w = new TransformStream();
                return (
                  u.push(w.readable),
                  m({ span: c, postponed: q.postponed, fallbackRouteParams: null })
                    .then(async (a) => {
                      var b, c;
                      if (!a)
                        throw Object.defineProperty(
                          Error("Invariant: expected a result to be returned"),
                          "__NEXT_ERROR_CODE",
                          { value: "E463", enumerable: !1, configurable: !0 },
                        );
                      if ((null == (b = a.value) ? void 0 : b.kind) !== v.CachedRouteKind.APP_PAGE)
                        throw Object.defineProperty(
                          Error(
                            `Invariant: expected a page response, got ${null == (c = a.value) ? void 0 : c.kind}`,
                          ),
                          "__NEXT_ERROR_CODE",
                          { value: "E305", enumerable: !1, configurable: !0 },
                        );
                      await a.value.html.pipeTo(w.writable);
                    })
                    .catch((a) => {
                      w.writable.abort(a).catch((a) => {
                        console.error("couldn't abort transformer", a);
                      });
                    }),
                  (0, A.sendRenderResult)({
                    req: a,
                    res: b,
                    generateEtags: ad.generateEtags,
                    poweredByHeader: ad.poweredByHeader,
                    result: u,
                    cacheControl: { revalidate: 0, expire: void 0 },
                  })
                );
              };
            if (!aF)
              return await aE.withPropagatedContext(a.headers, () =>
                aE.trace(
                  i.BaseServerSpan.handleRequest,
                  {
                    spanName: `${aD} ${a.url}`,
                    kind: g.SpanKind.SERVER,
                    attributes: { "http.method": aD, "http.target": a.url },
                  },
                  p,
                ),
              );
            await p(aF);
          } catch (b) {
            throw (
              b instanceof B.NoFallbackError ||
                (await K.onRequestError(
                  a,
                  b,
                  {
                    routerKind: "App Router",
                    routePath: G,
                    routeType: "render",
                    revalidateReason: (0, f.c)({ isRevalidate: ak, isOnDemandRevalidate: ah }),
                  },
                  ac,
                )),
              b
            );
          }
        }
      },
      55933: (a, b, c) => {
        "use strict";
        c.d(b, { Testimonials: () => C });
        var d = c(21124),
          e = c(38301),
          f = c(25880),
          g = c(62312);
        let h = "undefined" != typeof window ? e.useLayoutEffect : e.useEffect;
        var i = c(21664),
          j = c(93238),
          k = c(22577);
        function l(a, b) {
          if ("function" == typeof a) return a(b);
          null != a && (a.current = b);
        }
        class m extends e.Component {
          getSnapshotBeforeUpdate(a) {
            let b = this.props.childRef.current;
            if ((0, j.s)(b) && a.isPresent && !this.props.isPresent && !1 !== this.props.pop) {
              let a = b.offsetParent,
                c = ((0, j.s)(a) && a.offsetWidth) || 0,
                d = ((0, j.s)(a) && a.offsetHeight) || 0,
                e = getComputedStyle(b),
                f = this.props.sizeRef.current;
              ((f.height = parseFloat(e.height)),
                (f.width = parseFloat(e.width)),
                (f.top = b.offsetTop),
                (f.left = b.offsetLeft),
                (f.right = c - f.width - f.left),
                (f.bottom = d - f.height - f.top));
            }
            return null;
          }
          componentDidUpdate() {}
          render() {
            return this.props.children;
          }
        }
        function n({ children: a, isPresent: b, anchorX: c, anchorY: f, root: g, pop: h }) {
          let i = (0, e.useId)(),
            j = (0, e.useRef)(null),
            n = (0, e.useRef)({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }),
            { nonce: o } = (0, e.useContext)(k.Q),
            p = (function (...a) {
              return e.useCallback(
                (function (...a) {
                  return (b) => {
                    let c = !1,
                      d = a.map((a) => {
                        let d = l(a, b);
                        return (c || "function" != typeof d || (c = !0), d);
                      });
                    if (c)
                      return () => {
                        for (let b = 0; b < d.length; b++) {
                          let c = d[b];
                          "function" == typeof c ? c() : l(a[b], null);
                        }
                      };
                  };
                })(...a),
                a,
              );
            })(j, a.props?.ref ?? a?.ref);
          return (
            (0, e.useInsertionEffect)(() => {
              let { width: a, height: d, top: e, left: k, right: l, bottom: m } = n.current;
              if (b || !1 === h || !j.current || !a || !d) return;
              let p = "left" === c ? `left: ${k}` : `right: ${l}`,
                q = "bottom" === f ? `bottom: ${m}` : `top: ${e}`;
              j.current.dataset.motionPopId = i;
              let r = document.createElement("style");
              o && (r.nonce = o);
              let s = g ?? document.head;
              return (
                s.appendChild(r),
                r.sheet &&
                  r.sheet.insertRule(`
          [data-motion-pop-id="${i}"] {
            position: absolute !important;
            width: ${a}px !important;
            height: ${d}px !important;
            ${p}px !important;
            ${q}px !important;
          }
        `),
                () => {
                  (j.current?.removeAttribute("data-motion-pop-id"),
                    s.contains(r) && s.removeChild(r));
                }
              );
            }, [b]),
            (0, d.jsx)(m, {
              isPresent: b,
              childRef: j,
              sizeRef: n,
              pop: h,
              children: !1 === h ? a : e.cloneElement(a, { ref: p }),
            })
          );
        }
        let o = ({
          children: a,
          initial: b,
          isPresent: c,
          onExitComplete: f,
          custom: h,
          presenceAffectsLayout: j,
          mode: k,
          anchorX: l,
          anchorY: m,
          root: o,
        }) => {
          let q = (0, g.M)(p),
            r = (0, e.useId)(),
            s = !0,
            t = (0, e.useMemo)(
              () => (
                (s = !1),
                {
                  id: r,
                  initial: b,
                  isPresent: c,
                  custom: h,
                  onExitComplete: (a) => {
                    for (let b of (q.set(a, !0), q.values())) if (!b) return;
                    f && f();
                  },
                  register: (a) => (q.set(a, !1), () => q.delete(a)),
                }
              ),
              [c, q, f],
            );
          return (
            j && s && (t = { ...t }),
            (0, e.useMemo)(() => {
              q.forEach((a, b) => q.set(b, !1));
            }, [c]),
            e.useEffect(() => {
              c || q.size || !f || f();
            }, [c]),
            (a = (0, d.jsx)(n, {
              pop: "popLayout" === k,
              isPresent: c,
              anchorX: l,
              anchorY: m,
              root: o,
              children: a,
            })),
            (0, d.jsx)(i.t.Provider, { value: t, children: a })
          );
        };
        function p() {
          return new Map();
        }
        var q = c(92323);
        let r = (a) => a.key || "";
        function s(a) {
          let b = [];
          return (
            e.Children.forEach(a, (a) => {
              (0, e.isValidElement)(a) && b.push(a);
            }),
            b
          );
        }
        let t = ({
          children: a,
          custom: b,
          initial: c = !0,
          onExitComplete: i,
          presenceAffectsLayout: j = !0,
          mode: k = "sync",
          propagate: l = !1,
          anchorX: m = "left",
          anchorY: n = "top",
          root: p,
        }) => {
          let [t, u] = (0, q.xQ)(l),
            v = (0, e.useMemo)(() => s(a), [a]),
            w = l && !t ? [] : v.map(r),
            x = (0, e.useRef)(!0),
            y = (0, e.useRef)(v),
            z = (0, g.M)(() => new Map()),
            A = (0, e.useRef)(new Set()),
            [B, C] = (0, e.useState)(v),
            [D, E] = (0, e.useState)(v);
          h(() => {
            ((x.current = !1), (y.current = v));
            for (let a = 0; a < D.length; a++) {
              let b = r(D[a]);
              w.includes(b) ? (z.delete(b), A.current.delete(b)) : !0 !== z.get(b) && z.set(b, !1);
            }
          }, [D, w.length, w.join("-")]);
          let F = [];
          if (v !== B) {
            let a = [...v];
            for (let b = 0; b < D.length; b++) {
              let c = D[b],
                d = r(c);
              w.includes(d) || (a.splice(b, 0, c), F.push(c));
            }
            return ("wait" === k && F.length && (a = F), E(s(a)), C(v), null);
          }
          let { forceRender: G } = (0, e.useContext)(f.L);
          return (0, d.jsx)(d.Fragment, {
            children: D.map((a) => {
              let e = r(a),
                f = (!l || !!t) && (v === D || w.includes(e));
              return (0, d.jsx)(
                o,
                {
                  isPresent: f,
                  initial: (!x.current || !!c) && void 0,
                  custom: b,
                  presenceAffectsLayout: j,
                  mode: k,
                  root: p,
                  onExitComplete: f
                    ? void 0
                    : () => {
                        if (A.current.has(e) || !z.has(e)) return;
                        (A.current.add(e), z.set(e, !0));
                        let a = !0;
                        (z.forEach((b) => {
                          b || (a = !1);
                        }),
                          a && (G?.(), E(y.current), l && u?.(), i && i()));
                      },
                  anchorX: m,
                  anchorY: n,
                  children: a,
                },
                e,
              );
            }),
          });
        };
        var u = c(4085),
          v = c(14959);
        let w = (0, v.A)("quote", [
            [
              "path",
              {
                d: "M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
                key: "rib7q0",
              },
            ],
            [
              "path",
              {
                d: "M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
                key: "1ymkrd",
              },
            ],
          ]),
          x = (0, v.A)("star", [
            [
              "path",
              {
                d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
                key: "r04s7s",
              },
            ],
          ]),
          y = (0, v.A)("chevron-left", [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]]);
        var z = c(59405),
          A = c(35284);
        let B = [
          {
            name: "Sarah Ahmed",
            role: "Founder, Hive Marketing",
            quote:
              "We replaced three tools with this. Our clients adore the share links — no more screenshots in WhatsApp.",
            initials: "SA",
            accent: "bg-brand text-brand-foreground",
          },
          {
            name: "Rakib Hassan",
            role: "Performance Lead, BoostBD",
            quote:
              "The ROAS dashboard alone saved us hours per week. Reports our team used to build manually now take 30 seconds.",
            initials: "RH",
            accent: "bg-accent text-ink",
          },
          {
            name: "Mira Chen",
            role: "Director, Pixel & Penny",
            quote:
              "Beautiful UI, real-time data, and rock-solid encryption. This is the FB ads tool agencies have been waiting for.",
            initials: "MC",
            accent: "bg-warning text-ink",
          },
          {
            name: "Tom\xe1s Vega",
            role: "Growth, Lumen Studio",
            quote:
              "Onboarded a new client in under 5 minutes. The shareable read-only view is genius — they can't break anything.",
            initials: "TV",
            accent: "bg-success text-ink",
          },
          {
            name: "Aisha Rahman",
            role: "CEO, Fashion House BD",
            quote:
              "As a client, I finally get clean weekly reports without back-and-forth emails. Game changer.",
            initials: "AR",
            accent: "bg-brand text-brand-foreground",
          },
        ];
        function C() {
          let [a, b] = (0, e.useState)(0),
            c = B.length,
            f = (a) => b((b) => (b + a + c) % c),
            g = B[a];
          return (0, d.jsx)("section", {
            className: "py-24",
            children: (0, d.jsxs)("div", {
              className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
              children: [
                (0, d.jsxs)("div", {
                  className: "mx-auto max-w-2xl text-center",
                  children: [
                    (0, d.jsx)("span", {
                      className:
                        "inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink",
                      children: "Loved by agencies",
                    }),
                    (0, d.jsx)("h2", {
                      className: "mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl",
                      children: "What our customers say",
                    }),
                  ],
                }),
                (0, d.jsxs)("div", {
                  className: "mt-12 grid gap-8 lg:grid-cols-5 lg:items-stretch",
                  children: [
                    (0, d.jsx)("div", {
                      className: "lg:col-span-3 flex",
                      children: (0, d.jsxs)("div", {
                        className:
                          "relative flex flex-col w-full rounded card-brutal bg-card p-8 sm:p-10",
                        children: [
                          (0, d.jsx)(w, {
                            className:
                              "absolute -top-4 -left-4 h-12 w-12 rounded card-brutal bg-brand p-2 text-brand-foreground",
                          }),
                          (0, d.jsx)("div", {
                            className: "flex gap-1",
                            children: Array.from({ length: 5 }).map((a, b) =>
                              (0, d.jsx)(x, { className: "h-5 w-5 fill-warning text-warning" }, b),
                            ),
                          }),
                          (0, d.jsx)(t, {
                            mode: "wait",
                            children: (0, d.jsxs)(
                              u.P.div,
                              {
                                initial: { opacity: 0, y: 12 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -12 },
                                transition: { duration: 0.25 },
                                children: [
                                  (0, d.jsxs)("p", {
                                    className:
                                      "mt-5 text-lg font-medium leading-relaxed text-foreground sm:text-xl",
                                    children: ['"', g.quote, '"'],
                                  }),
                                  (0, d.jsxs)("div", {
                                    className: "mt-7 flex items-center gap-4",
                                    children: [
                                      (0, d.jsx)("div", {
                                        className: `flex h-12 w-12 items-center justify-center rounded card-brutal text-base font-bold ${g.accent}`,
                                        children: g.initials,
                                      }),
                                      (0, d.jsxs)("div", {
                                        children: [
                                          (0, d.jsx)("div", {
                                            className: "text-base font-semibold",
                                            children: g.name,
                                          }),
                                          (0, d.jsx)("div", {
                                            className: "text-sm text-muted-foreground",
                                            children: g.role,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              a,
                            ),
                          }),
                          (0, d.jsxs)("div", {
                            className:
                              "mt-auto pt-8 flex items-center justify-between border-t-2 border-ink/10",
                            children: [
                              (0, d.jsx)("div", {
                                className: "flex gap-2",
                                children: B.map((c, e) =>
                                  (0, d.jsx)(
                                    "button",
                                    {
                                      onClick: () => b(e),
                                      "aria-label": `Show testimonial ${e + 1}`,
                                      className: `h-2.5 rounded-full transition-all ${e === a ? "w-8 bg-ink" : "w-2.5 bg-ink/25 hover:bg-ink/50"}`,
                                    },
                                    e,
                                  ),
                                ),
                              }),
                              (0, d.jsxs)("div", {
                                className: "flex gap-2",
                                children: [
                                  (0, d.jsx)(A.$, {
                                    type: "button",
                                    variant: "outline",
                                    size: "icon",
                                    onClick: () => f(-1),
                                    className: "rounded card-brutal h-10 w-10 bg-card",
                                    "aria-label": "Previous testimonial",
                                    children: (0, d.jsx)(y, { className: "h-4 w-4" }),
                                  }),
                                  (0, d.jsx)(A.$, {
                                    type: "button",
                                    variant: "outline",
                                    size: "icon",
                                    onClick: () => f(1),
                                    className: "rounded card-brutal h-10 w-10 bg-card",
                                    "aria-label": "Next testimonial",
                                    children: (0, d.jsx)(z.A, { className: "h-4 w-4" }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    (0, d.jsx)("div", {
                      className: "lg:col-span-2 space-y-3",
                      children: B.map((c, e) =>
                        (0, d.jsx)(
                          "button",
                          {
                            onClick: () => b(e),
                            className: `w-full text-left rounded card-brutal p-4 transition-all ${e === a ? "bg-brand text-brand-foreground translate-x-0" : "bg-card hover:-translate-y-0.5"}`,
                            children: (0, d.jsxs)("div", {
                              className: "flex items-center gap-3",
                              children: [
                                (0, d.jsx)("div", {
                                  className: `flex h-10 w-10 shrink-0 items-center justify-center rounded text-sm font-bold border-2 border-ink ${e === a ? "bg-card text-ink" : c.accent}`,
                                  children: c.initials,
                                }),
                                (0, d.jsxs)("div", {
                                  className: "min-w-0",
                                  children: [
                                    (0, d.jsx)("div", {
                                      className: "text-sm font-semibold truncate",
                                      children: c.name,
                                    }),
                                    (0, d.jsx)("div", {
                                      className: `text-xs truncate ${e === a ? "text-brand-foreground/80" : "text-muted-foreground"}`,
                                      children: c.role,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          },
                          c.name,
                        ),
                      ),
                    }),
                  ],
                }),
              ],
            }),
          });
        }
      },
      60967: (a, b, c) => {
        "use strict";
        (c.r(b), c.d(b, { default: () => n }));
        var d = c(75338),
          e = c(16381),
          f = c(61243),
          g = c(86186),
          h = c(84814),
          i = c(70626),
          j = c(68673),
          k = c(73551),
          l = c(12643),
          m = c(89182);
        function n() {
          return (0, d.jsxs)("div", {
            id: "top",
            className: "min-h-screen overflow-x-hidden bg-background",
            children: [
              (0, d.jsx)(e.Navbar, {}),
              (0, d.jsxs)("main", {
                children: [
                  (0, d.jsx)(f.Hero, {}),
                  (0, d.jsx)(g.HowItWorks, {}),
                  (0, d.jsx)(h.Stats, {}),
                  (0, d.jsx)(i.Features, {}),
                  (0, d.jsx)(j.Pricing, {}),
                  (0, d.jsx)(k.Testimonials, {}),
                  (0, d.jsx)(l.FAQ, {}),
                ],
              }),
              (0, d.jsx)(m.Footer, {}),
            ],
          });
        }
      },
      61243: (a, b, c) => {
        "use strict";
        c.d(b, { Hero: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call Hero() from the server but Hero is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/Hero.tsx",
          "Hero",
        );
      },
      63033: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");
      },
      67748: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("trending-up", [
          ["path", { d: "M16 7h6v6", key: "box55l" }],
          ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }],
        ]);
      },
      68120: (a, b, c) => {
        "use strict";
        c.d(b, { J: () => j });
        var d = c(21124),
          e = c(38301),
          f = c(71538),
          g = c(26691),
          h = c(44943);
        let i = (0, g.F)(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          ),
          j = e.forwardRef(({ className: a, ...b }, c) =>
            (0, d.jsx)(f.b, { ref: c, className: (0, h.cn)(i(), a), ...b }),
          );
        j.displayName = f.b.displayName;
      },
      68673: (a, b, c) => {
        "use strict";
        c.d(b, { Pricing: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call Pricing() from the server but Pricing is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/Pricing.tsx",
          "Pricing",
        );
      },
      70626: (a, b, c) => {
        "use strict";
        c.d(b, { Features: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call Features() from the server but Features is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/Features.tsx",
          "Features",
        );
      },
      71538: (a, b, c) => {
        "use strict";
        c.d(b, { b: () => i });
        var d = c(38301);
        c(23312);
        var e = c(96425),
          f = c(21124),
          g = [
            "a",
            "button",
            "div",
            "form",
            "h2",
            "h3",
            "img",
            "input",
            "label",
            "li",
            "nav",
            "ol",
            "p",
            "select",
            "span",
            "svg",
            "ul",
          ].reduce((a, b) => {
            let c = (0, e.TL)(`Primitive.${b}`),
              g = d.forwardRef((a, d) => {
                let { asChild: e, ...g } = a;
                return (
                  "undefined" != typeof window && (window[Symbol.for("radix-ui")] = !0),
                  (0, f.jsx)(e ? c : b, { ...g, ref: d })
                );
              });
            return ((g.displayName = `Primitive.${b}`), { ...a, [b]: g });
          }, {}),
          h = d.forwardRef((a, b) =>
            (0, f.jsx)(g.label, {
              ...a,
              ref: b,
              onMouseDown: (b) => {
                b.target.closest("button, input, select, textarea") ||
                  (a.onMouseDown?.(b), !b.defaultPrevented && b.detail > 1 && b.preventDefault());
              },
            }),
          );
        h.displayName = "Label";
        var i = h;
      },
      71563: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("send", [
          [
            "path",
            {
              d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
              key: "1ffxy3",
            },
          ],
          ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }],
        ]);
      },
      72809: (a, b, c) => {
        (Promise.resolve().then(c.bind(c, 12643)),
          Promise.resolve().then(c.bind(c, 70626)),
          Promise.resolve().then(c.bind(c, 89182)),
          Promise.resolve().then(c.bind(c, 61243)),
          Promise.resolve().then(c.bind(c, 86186)),
          Promise.resolve().then(c.bind(c, 16381)),
          Promise.resolve().then(c.bind(c, 68673)),
          Promise.resolve().then(c.bind(c, 84814)),
          Promise.resolve().then(c.bind(c, 73551)));
      },
      73551: (a, b, c) => {
        "use strict";
        c.d(b, { Testimonials: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call Testimonials() from the server but Testimonials is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/Testimonials.tsx",
          "Testimonials",
        );
      },
      75234: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("sparkles", [
          [
            "path",
            {
              d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
              key: "1s2grr",
            },
          ],
          ["path", { d: "M20 2v4", key: "1rf3ol" }],
          ["path", { d: "M22 4h-4", key: "gwowj6" }],
          ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }],
        ]);
      },
      75535: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("arrow-right", [
          ["path", { d: "M5 12h14", key: "1ays0h" }],
          ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }],
        ]);
      },
      84814: (a, b, c) => {
        "use strict";
        c.d(b, { Stats: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call Stats() from the server but Stats is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/Stats.tsx",
          "Stats",
        );
      },
      85351: (a, b, c) => {
        "use strict";
        c.d(b, { A: () => d });
        let d = (0, c(14959).A)("chevron-down", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]);
      },
      86186: (a, b, c) => {
        "use strict";
        c.d(b, { HowItWorks: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call HowItWorks() from the server but HowItWorks is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/HowItWorks.tsx",
          "HowItWorks",
        );
      },
      86439: (a) => {
        "use strict";
        a.exports = require("next/dist/shared/lib/no-fallback-error.external");
      },
      89182: (a, b, c) => {
        "use strict";
        c.d(b, { Footer: () => d });
        let d = (0, c(97954).registerClientReference)(
          function () {
            throw Error(
              "Attempted to call Footer() from the server but Footer is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
            );
          },
          "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/landing/Footer.tsx",
          "Footer",
        );
      },
      99483: (a, b, c) => {
        "use strict";
        c.d(b, { Footer: () => t });
        var d = c(21124),
          e = c(3991),
          f = c.n(e),
          g = c(15982),
          h = c(71563),
          i = c(46422),
          j = c(14959);
        let k = (0, j.A)("twitter", [
            [
              "path",
              {
                d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
                key: "pff0z6",
              },
            ],
          ]),
          l = (0, j.A)("github", [
            [
              "path",
              {
                d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
                key: "tonef",
              },
            ],
            ["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "9comsn" }],
          ]),
          m = (0, j.A)("linkedin", [
            [
              "path",
              {
                d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
                key: "c2jq9f",
              },
            ],
            ["rect", { width: "4", height: "12", x: "2", y: "9", key: "mk3on5" }],
            ["circle", { cx: "4", cy: "4", r: "2", key: "bt5ra8" }],
          ]);
        var n = c(46267),
          o = c(38301),
          p = c(93758),
          q = c(35284),
          r = c(42830);
        let s = [
          {
            title: "Product",
            links: [
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Changelog", href: "#" },
              { label: "Roadmap", href: "#" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Press", href: "#" },
              { label: "Contact", href: "#contact" },
            ],
          },
          {
            title: "Resources",
            links: [
              { label: "Documentation", href: "#" },
              { label: "API reference", href: "#" },
              { label: "Help center", href: "#" },
              { label: "Status", href: "#" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Security", href: "#" },
              { label: "DPA", href: "#" },
            ],
          },
        ];
        function t() {
          let [a, b] = (0, o.useState)("");
          return (0, d.jsxs)("footer", {
            className: "relative overflow-hidden bg-ink text-ink-foreground",
            children: [
              (0, d.jsx)("div", {
                "aria-hidden": !0,
                className:
                  "pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px]",
              }),
              (0, d.jsx)("div", {
                "aria-hidden": !0,
                className:
                  "pointer-events-none absolute -bottom-32 right-0 h-[320px] w-[420px] rounded-full bg-primary/15 blur-[120px]",
              }),
              (0, d.jsx)("div", {
                className: "relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8",
                children: (0, d.jsx)("div", {
                  className: "rounded card-brutal bg-card p-6 text-foreground sm:p-10",
                  children: (0, d.jsxs)("div", {
                    className: "grid gap-6 lg:grid-cols-5 lg:items-center lg:gap-10",
                    children: [
                      (0, d.jsxs)("div", {
                        className: "lg:col-span-3",
                        children: [
                          (0, d.jsxs)("span", {
                            className:
                              "inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground",
                            children: [(0, d.jsx)(g.A, { className: "h-3 w-3" }), " Newsletter"],
                          }),
                          (0, d.jsx)("h3", {
                            className:
                              "mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl",
                            children: "Get growth tips for ad agencies",
                          }),
                          (0, d.jsx)("p", {
                            className: "mt-2 text-sm text-muted-foreground sm:text-base",
                            children:
                              "Monthly playbooks, product updates, and reporting templates. No spam, ever.",
                          }),
                        ],
                      }),
                      (0, d.jsxs)("form", {
                        onSubmit: (c) => {
                          (c.preventDefault(),
                            a &&
                              (r.oR.success("Subscribed!", {
                                description: `We'll keep ${a} in the loop.`,
                              }),
                              b("")));
                        },
                        className: "flex flex-col gap-3 sm:flex-row lg:col-span-2",
                        children: [
                          (0, d.jsx)(p.p, {
                            type: "email",
                            required: !0,
                            value: a,
                            onChange: (a) => b(a.target.value),
                            placeholder: "you@agency.com",
                            className: "rounded card-brutal h-12 bg-background",
                          }),
                          (0, d.jsxs)(q.$, {
                            type: "submit",
                            className:
                              "h-12 rounded bg-brand text-brand-foreground btn-brutal hover:bg-brand sm:shrink-0",
                            children: [(0, d.jsx)(h.A, { className: "h-4 w-4" }), " Subscribe"],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              (0, d.jsxs)("div", {
                className: "relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8",
                children: [
                  (0, d.jsxs)("div", {
                    className: "grid grid-cols-2 gap-10 lg:grid-cols-6",
                    children: [
                      (0, d.jsxs)("div", {
                        className: "col-span-2 lg:col-span-2",
                        children: [
                          (0, d.jsxs)(f(), {
                            href: "/",
                            className: "flex items-center gap-2",
                            children: [
                              (0, d.jsx)("span", {
                                className:
                                  "flex h-10 w-10 items-center justify-center rounded card-brutal bg-brand text-ink",
                                children: (0, d.jsx)(i.A, { className: "h-5 w-5 fill-ink" }),
                              }),
                              (0, d.jsx)("span", {
                                className: "text-base font-bold tracking-tight",
                                children: "AdReportly",
                              }),
                            ],
                          }),
                          (0, d.jsx)("p", {
                            className: "mt-5 max-w-xs text-sm text-ink-foreground/70",
                            children:
                              "The all-in-one platform for tracking Facebook ad campaigns and sharing beautiful reports with clients.",
                          }),
                          (0, d.jsx)("div", {
                            className: "mt-6 flex gap-3",
                            children: [k, l, m].map((a, b) =>
                              (0, d.jsx)(
                                "a",
                                {
                                  href: "#",
                                  className:
                                    "group flex h-10 w-10 items-center justify-center rounded border-2 border-ink-foreground/15 bg-ink-foreground/5 text-ink-foreground transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-ink",
                                  "aria-label": "Social",
                                  children: (0, d.jsx)(a, { className: "h-4 w-4" }),
                                },
                                b,
                              ),
                            ),
                          }),
                        ],
                      }),
                      s.map((a) =>
                        (0, d.jsxs)(
                          "div",
                          {
                            children: [
                              (0, d.jsx)("h4", {
                                className: "text-xs font-bold uppercase tracking-wider text-brand",
                                children: a.title,
                              }),
                              (0, d.jsx)("ul", {
                                className: "mt-5 space-y-3",
                                children: a.links.map((a) =>
                                  (0, d.jsx)(
                                    "li",
                                    {
                                      children: (0, d.jsxs)("a", {
                                        href: a.href,
                                        className:
                                          "group inline-flex items-center gap-1 text-sm text-ink-foreground/70 transition hover:text-brand",
                                        children: [
                                          a.label,
                                          (0, d.jsx)(n.A, {
                                            className:
                                              "h-3 w-3 opacity-0 transition group-hover:opacity-100",
                                          }),
                                        ],
                                      }),
                                    },
                                    a.label,
                                  ),
                                ),
                              }),
                            ],
                          },
                          a.title,
                        ),
                      ),
                    ],
                  }),
                  (0, d.jsxs)("div", {
                    className:
                      "mt-14 flex flex-col items-center justify-between gap-3 border-t-2 border-ink-foreground/10 pt-6 text-xs text-ink-foreground/60 sm:flex-row",
                    children: [
                      (0, d.jsxs)("span", {
                        children: [
                          "\xa9 ",
                          new Date().getFullYear(),
                          " AdReportly. All rights reserved.",
                        ],
                      }),
                      (0, d.jsxs)("span", {
                        className: "flex items-center gap-2",
                        children: [
                          (0, d.jsx)("span", {
                            className: "inline-block h-2 w-2 rounded-full bg-success animate-pulse",
                          }),
                          "All systems operational",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
      },
    }));
  var b = require("../webpack-runtime.js");
  b.C(a);
  var c = b.X(0, [331, 925, 20, 85, 872, 944, 303], () => b((b.s = 48435)));
  module.exports = c;
})();
