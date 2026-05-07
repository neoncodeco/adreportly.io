(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [5105],
  {
    1524: (e, s, t) => {
      "use strict";
      t.d(s, { A: () => r });
      let r = (0, t(5121).A)("trending-up", [
        ["path", { d: "M16 7h6v6", key: "box55l" }],
        ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }],
      ]);
    },
    7013: (e, s, t) => {
      "use strict";
      t.d(s, { A: () => r });
      let r = (0, t(5121).A)("arrow-up-right", [
        ["path", { d: "M7 7h10v10", key: "1tivn9" }],
        ["path", { d: "M7 17 17 7", key: "1vkiza" }],
      ]);
    },
    24033: (e, s, t) => {
      "use strict";
      t.d(s, { A: () => r });
      let r = (0, t(5121).A)("chevron-down", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]);
    },
    35299: (e, s, t) => {
      "use strict";
      t.d(s, { A: () => r });
      let r = (0, t(5121).A)("loader-circle", [
        ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
      ]);
    },
    51002: (e, s, t) => {
      "use strict";
      t.d(s, { DashboardHome: () => L });
      var r = t(95155),
        a = t(52619),
        l = t.n(a),
        d = t(12115),
        n = t(9924),
        i = t(26991),
        o = t(73850),
        c = t(68425),
        x = t(47734),
        m = t(73697),
        h = t(23508),
        u = t(77568),
        p = t(95740),
        g = t(91761),
        b = t(5121);
      let v = (0, b.A)("target", [
          ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
          ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
          ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
        ]),
        f = (0, b.A)("activity", [
          [
            "path",
            {
              d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
              key: "169zse",
            },
          ],
        ]),
        y = (0, b.A)("mouse-pointer-click", [
          ["path", { d: "M14 4.1 12 6", key: "ita8i4" }],
          ["path", { d: "m5.1 8-2.9-.8", key: "1go3kf" }],
          ["path", { d: "m6 12-1.9 2", key: "mnht97" }],
          ["path", { d: "M7.2 2.2 8 5.1", key: "1cfko1" }],
          [
            "path",
            {
              d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
              key: "s0h3yz",
            },
          ],
        ]);
      var j = t(35299),
        N = t(1524);
      let k = (0, b.A)("trending-down", [
        ["path", { d: "M16 17h6v-6", key: "t6n2it" }],
        ["path", { d: "m22 17-8.5-8.5-5 5L2 7", key: "x473p" }],
      ]);
      var w = t(24033),
        A = t(7013),
        S = t(64269);
      let C = [
          { key: "overview", label: "Live overview \xb7 30d", icon: p.A, highlight: !0 },
          { key: "total", label: "Total Spend", icon: g.A, highlight: !1 },
          { key: "conversions", label: "Conversions", icon: v, highlight: !1 },
          { key: "roas", label: "Avg ROAS", icon: f, highlight: !1 },
          { key: "cpc", label: "Avg CPC", icon: y, highlight: !1 },
        ],
        M = {
          overview: {
            accent: "from-primary/25 to-primary/5",
            iconBg: "bg-primary/15 text-primary",
          },
          total: {
            accent: "from-violet-500/20 to-fuchsia-500/10",
            iconBg: "bg-violet-500/15 text-violet-500",
          },
          conversions: {
            accent: "from-emerald-500/20 to-teal-500/10",
            iconBg: "bg-emerald-500/15 text-emerald-500",
          },
          roas: {
            accent: "from-amber-500/20 to-orange-500/10",
            iconBg: "bg-amber-500/15 text-amber-500",
          },
          cpc: { accent: "from-sky-500/20 to-blue-500/10", iconBg: "bg-sky-500/15 text-sky-500" },
        };
      function L() {
        var e, s, t, a, p, g;
        let [b, v] = (0, d.useState)(null),
          [f, y] = (0, d.useState)(!0),
          [L, F] = (0, d.useState)(null),
          O = (0, d.useCallback)(async () => {
            (y(!0), F(null));
            try {
              let e = await fetch("/api/dashboard/overview", { credentials: "include" }),
                s = await e.json();
              if (!e.ok || !1 === s.success) {
                (F("string" == typeof s.error ? s.error : "Could not load dashboard"), v(null));
                return;
              }
              v(s);
            } catch (e) {
              (F("Network error"), v(null));
            } finally {
              y(!1);
            }
          }, []);
        (0, d.useEffect)(() => {
          O();
        }, [O]);
        let z = null != (s = null == b ? void 0 : b.currencySymbol) ? s : "৳",
          R = null != (t = null == b ? void 0 : b.spendTrend) ? t : [],
          B = null != (a = null == b ? void 0 : b.topCampaigns) ? a : [],
          D = null != (p = null == b ? void 0 : b.recentCampaigns) ? p : [],
          _ = null == b ? void 0 : b.kpis,
          H = null != (g = null == (e = B[0]) ? void 0 : e.spend) ? g : 0,
          K = (0, d.useMemo)(() => {
            var e, s;
            let t = null != (e = null == _ ? void 0 : _.totalSpend) ? e : 0,
              r = null != (s = null == _ ? void 0 : _.conversions) ? s : 0;
            return C.map((e) => {
              var s, a;
              let l = "—";
              return (
                "overview" === e.key || "total" === e.key
                  ? (l = "".concat(z).concat(Math.round(t).toLocaleString()))
                  : "conversions" === e.key
                    ? (l = r > 0 ? r.toLocaleString() : "0")
                    : "roas" === e.key
                      ? (l = null != (s = null == _ ? void 0 : _.avgRoas) ? s : "—")
                      : "cpc" === e.key &&
                        (l = null != (a = null == _ ? void 0 : _.avgCpc) ? a : "—"),
                { ...e, ...M[e.key], value: l, delta: null, up: !0 }
              );
            });
          }, [_, z]);
        return f && !b
          ? (0, r.jsx)("div", {
              className:
                "flex min-h-[40vh] items-center justify-center rounded-3xl border border-border bg-card",
              children: (0, r.jsx)(j.A, {
                className: "h-8 w-8 animate-spin text-muted-foreground",
                "aria-label": "Loading",
              }),
            })
          : L
            ? (0, r.jsxs)("div", {
                className:
                  "rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center",
                children: [
                  (0, r.jsx)("p", {
                    className: "text-sm font-medium text-destructive",
                    children: L,
                  }),
                  (0, r.jsx)("button", {
                    type: "button",
                    className: "mt-4 text-sm font-semibold text-primary underline",
                    onClick: () => void O(),
                    children: "Try again",
                  }),
                ],
              })
            : (0, r.jsxs)(n.P.div, {
                initial: { opacity: 0, y: 12 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.35 },
                className: "space-y-5 sm:space-y-6",
                children: [
                  (null == b ? void 0 : b.connected) === !1 &&
                    (0, r.jsxs)("div", {
                      className:
                        "rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground",
                      children: [
                        "Connect Facebook under",
                        " ",
                        (0, r.jsx)(l(), {
                          href: "/dashboard/meta-connect",
                          className: "font-semibold text-primary hover:underline",
                          children: "Meta Connect",
                        }),
                        " ",
                        "to load live ad account data.",
                      ],
                    }),
                  (0, r.jsx)("div", {
                    className: "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5",
                    children: K.map((e) =>
                      (0, r.jsxs)(
                        "div",
                        {
                          className: (0, S.cn)(
                            "group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant sm:p-5",
                            e.highlight && "col-span-2 lg:col-span-1",
                          ),
                          children: [
                            (0, r.jsx)("div", {
                              className: (0, S.cn)(
                                "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl",
                                e.accent,
                              ),
                            }),
                            (0, r.jsxs)("div", {
                              className: "relative flex items-start justify-between",
                              children: [
                                (0, r.jsx)("span", {
                                  className: (0, S.cn)(
                                    "flex h-9 w-9 items-center justify-center rounded-xl",
                                    e.iconBg,
                                  ),
                                  children: (0, r.jsx)(e.icon, { className: "h-4 w-4" }),
                                }),
                                e.delta
                                  ? (0, r.jsxs)("span", {
                                      className: (0, S.cn)(
                                        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs",
                                        e.up
                                          ? "bg-success/15 text-success"
                                          : "bg-destructive/15 text-destructive",
                                      ),
                                      children: [
                                        e.up
                                          ? (0, r.jsx)(N.A, { className: "h-3 w-3" })
                                          : (0, r.jsx)(k, { className: "h-3 w-3" }),
                                        e.delta,
                                      ],
                                    })
                                  : null,
                              ],
                            }),
                            (0, r.jsxs)("div", {
                              className: "relative mt-3 sm:mt-4",
                              children: [
                                (0, r.jsx)("div", {
                                  className: "text-xl font-bold leading-tight sm:text-2xl",
                                  children: e.value,
                                }),
                                (0, r.jsx)("div", {
                                  className: "mt-0.5 truncate text-xs text-muted-foreground",
                                  children: e.label,
                                }),
                              ],
                            }),
                          ],
                        },
                        e.key,
                      ),
                    ),
                  }),
                  (0, r.jsxs)("div", {
                    className: "grid gap-5 sm:gap-6 lg:grid-cols-3",
                    children: [
                      (0, r.jsxs)("div", {
                        className:
                          "rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6 lg:col-span-2",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "flex flex-wrap items-start justify-between gap-3",
                            children: [
                              (0, r.jsxs)("div", {
                                children: [
                                  (0, r.jsx)("h3", {
                                    className: "text-base font-bold sm:text-lg",
                                    children: "Ad Spend Trend",
                                  }),
                                  (0, r.jsx)("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: "Daily spend vs. clicks (last 30 days)",
                                  }),
                                ],
                              }),
                              (0, r.jsxs)("button", {
                                type: "button",
                                className:
                                  "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground",
                                children: [
                                  "Last 30 Days ",
                                  (0, r.jsx)(w.A, { className: "h-3.5 w-3.5" }),
                                ],
                              }),
                            ],
                          }),
                          (0, r.jsx)("div", {
                            className: "mt-5 h-56 w-full sm:h-72",
                            children:
                              0 === R.length
                                ? (0, r.jsx)("div", {
                                    className:
                                      "flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground",
                                    children: "No spend series yet for this period.",
                                  })
                                : (0, r.jsx)(i.u, {
                                    width: "100%",
                                    height: "100%",
                                    children: (0, r.jsxs)(o.Q, {
                                      data: R,
                                      margin: { top: 5, right: 0, left: 0, bottom: 0 },
                                      children: [
                                        (0, r.jsxs)("defs", {
                                          children: [
                                            (0, r.jsxs)("linearGradient", {
                                              id: "spendFill",
                                              x1: "0",
                                              y1: "0",
                                              x2: "0",
                                              y2: "1",
                                              children: [
                                                (0, r.jsx)("stop", {
                                                  offset: "0%",
                                                  stopColor: "var(--chart-1)",
                                                  stopOpacity: 0.5,
                                                }),
                                                (0, r.jsx)("stop", {
                                                  offset: "100%",
                                                  stopColor: "var(--chart-1)",
                                                  stopOpacity: 0,
                                                }),
                                              ],
                                            }),
                                            (0, r.jsxs)("linearGradient", {
                                              id: "resultsFill",
                                              x1: "0",
                                              y1: "0",
                                              x2: "0",
                                              y2: "1",
                                              children: [
                                                (0, r.jsx)("stop", {
                                                  offset: "0%",
                                                  stopColor: "var(--chart-2)",
                                                  stopOpacity: 0.4,
                                                }),
                                                (0, r.jsx)("stop", {
                                                  offset: "100%",
                                                  stopColor: "var(--chart-2)",
                                                  stopOpacity: 0,
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        (0, r.jsx)(c.d, {
                                          stroke: "var(--border)",
                                          vertical: !1,
                                          strokeDasharray: "3 3",
                                        }),
                                        (0, r.jsx)(x.W, {
                                          dataKey: "label",
                                          interval: 4,
                                          tickLine: !1,
                                          axisLine: !1,
                                          stroke: "var(--muted-foreground)",
                                          fontSize: 10,
                                        }),
                                        (0, r.jsx)(m.h, { hide: !0 }),
                                        (0, r.jsx)(h.m, {
                                          cursor: { stroke: "var(--border)", strokeWidth: 1 },
                                          contentStyle: {
                                            background: "var(--card)",
                                            border: "1px solid var(--border)",
                                            borderRadius: 12,
                                            fontSize: 12,
                                          },
                                        }),
                                        (0, r.jsx)(u.G, {
                                          type: "monotone",
                                          dataKey: "spend",
                                          stroke: "var(--chart-1)",
                                          strokeWidth: 2,
                                          fill: "url(#spendFill)",
                                        }),
                                        (0, r.jsx)(u.G, {
                                          type: "monotone",
                                          dataKey: "results",
                                          stroke: "var(--chart-2)",
                                          strokeWidth: 2,
                                          fill: "url(#resultsFill)",
                                        }),
                                      ],
                                    }),
                                  }),
                          }),
                        ],
                      }),
                      (0, r.jsxs)("div", {
                        className:
                          "rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "flex items-start justify-between",
                            children: [
                              (0, r.jsxs)("div", {
                                children: [
                                  (0, r.jsx)("h3", {
                                    className: "text-base font-bold sm:text-lg",
                                    children: "Top Campaigns",
                                  }),
                                  (0, r.jsx)("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: "By spend \xb7 30 days",
                                  }),
                                ],
                              }),
                              (0, r.jsx)("span", {
                                className:
                                  "inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary",
                                children: B.length,
                              }),
                            ],
                          }),
                          (0, r.jsx)("div", {
                            className: "mt-4 space-y-3",
                            children:
                              0 === B.length
                                ? (0, r.jsx)("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: "No campaign spend in the last 30 days.",
                                  })
                                : B.map((e, s) => {
                                    let t = H > 0 ? (e.spend / H) * 100 : 0,
                                      a = {
                                        primary: "bg-gradient-primary",
                                        dark: "bg-foreground",
                                        muted: "bg-gradient-to-r from-amber-500 to-orange-500",
                                      };
                                    return (0, r.jsx)(
                                      "div",
                                      {
                                        className:
                                          "rounded-2xl border border-border/60 bg-background/40 p-3 transition hover:border-border hover:bg-background",
                                        children: (0, r.jsxs)("div", {
                                          className: "flex items-center gap-3",
                                          children: [
                                            (0, r.jsx)("span", {
                                              className: (0, S.cn)(
                                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground",
                                                a[e.color],
                                              ),
                                              children: e.code,
                                            }),
                                            (0, r.jsxs)("div", {
                                              className: "min-w-0 flex-1",
                                              children: [
                                                (0, r.jsxs)("div", {
                                                  className:
                                                    "flex items-center justify-between gap-2",
                                                  children: [
                                                    (0, r.jsx)("p", {
                                                      className: "truncate text-sm font-semibold",
                                                      children: e.name,
                                                    }),
                                                    (0, r.jsxs)("span", {
                                                      className:
                                                        "shrink-0 text-xs font-bold tabular-nums",
                                                      children: [
                                                        z,
                                                        e.spend >= 1e3
                                                          ? "".concat(
                                                              (e.spend / 1e3).toFixed(1),
                                                              "K",
                                                            )
                                                          : e.spend.toLocaleString(void 0, {
                                                              maximumFractionDigits: 0,
                                                            }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, r.jsxs)("div", {
                                                  className: "mt-1.5 flex items-center gap-2",
                                                  children: [
                                                    (0, r.jsx)("div", {
                                                      className:
                                                        "h-1.5 flex-1 overflow-hidden rounded-full bg-muted",
                                                      children: (0, r.jsx)("div", {
                                                        className: (0, S.cn)(
                                                          "h-full rounded-full",
                                                          a[e.color],
                                                        ),
                                                        style: { width: "".concat(t, "%") },
                                                      }),
                                                    }),
                                                    (0, r.jsxs)("span", {
                                                      className:
                                                        "text-[10px] font-semibold text-muted-foreground",
                                                      children: ["#", s + 1],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      },
                                      e.id,
                                    );
                                  }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, r.jsxs)("div", {
                    className: "rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "mb-4 flex items-center justify-between",
                        children: [
                          (0, r.jsxs)("div", {
                            children: [
                              (0, r.jsx)("h3", {
                                className: "text-base font-bold sm:text-lg",
                                children: "Recent Campaigns",
                              }),
                              (0, r.jsx)("p", {
                                className: "text-xs text-muted-foreground",
                                children: "Highest spend \xb7 last 30 days",
                              }),
                            ],
                          }),
                          (0, r.jsxs)(l(), {
                            href: "/dashboard/campaigns",
                            className:
                              "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline",
                            children: ["View all ", (0, r.jsx)(A.A, { className: "h-3.5 w-3.5" })],
                          }),
                        ],
                      }),
                      (0, r.jsx)("div", {
                        className: "space-y-3 lg:hidden",
                        children:
                          0 === D.slice(0, 3).length
                            ? (0, r.jsx)("p", {
                                className: "text-sm text-muted-foreground",
                                children: "No campaigns to show.",
                              })
                            : D.slice(0, 3).map((e) =>
                                (0, r.jsxs)(
                                  "div",
                                  {
                                    className:
                                      "rounded-2xl border border-border/60 bg-background/40 p-4",
                                    children: [
                                      (0, r.jsxs)("div", {
                                        className: "flex items-start gap-3",
                                        children: [
                                          (0, r.jsx)("span", {
                                            className:
                                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary",
                                            children: e.code,
                                          }),
                                          (0, r.jsxs)("div", {
                                            className: "min-w-0 flex-1",
                                            children: [
                                              (0, r.jsx)("p", {
                                                className: "truncate text-sm font-semibold",
                                                children: e.name,
                                              }),
                                              (0, r.jsxs)("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: [
                                                  e.accounts,
                                                  " ad account",
                                                  1 === e.accounts ? "" : "s",
                                                ],
                                              }),
                                            ],
                                          }),
                                          (0, r.jsx)("span", {
                                            className: (0, S.cn)(
                                              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                                              "active" === e.status && "bg-success/15 text-success",
                                              "paused" === e.status &&
                                                "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                                              ("completed" === e.status || "other" === e.status) &&
                                                "bg-muted text-muted-foreground",
                                            ),
                                            children: e.status,
                                          }),
                                        ],
                                      }),
                                      (0, r.jsxs)("div", {
                                        className:
                                          "mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center",
                                        children: [
                                          (0, r.jsxs)("div", {
                                            children: [
                                              (0, r.jsx)("div", {
                                                className:
                                                  "text-[10px] uppercase tracking-wider text-muted-foreground",
                                                children: "Spend",
                                              }),
                                              (0, r.jsxs)("div", {
                                                className: "mt-0.5 text-sm font-bold tabular-nums",
                                                children: [
                                                  z,
                                                  e.spend >= 1e3
                                                    ? "".concat((e.spend / 1e3).toFixed(1), "K")
                                                    : e.spend.toLocaleString(void 0, {
                                                        maximumFractionDigits: 0,
                                                      }),
                                                ],
                                              }),
                                            ],
                                          }),
                                          (0, r.jsxs)("div", {
                                            className: "border-x border-border/60",
                                            children: [
                                              (0, r.jsx)("div", {
                                                className:
                                                  "text-[10px] uppercase tracking-wider text-muted-foreground",
                                                children: "Results",
                                              }),
                                              (0, r.jsx)("div", {
                                                className: "mt-0.5 text-sm font-bold tabular-nums",
                                                children: e.results,
                                              }),
                                            ],
                                          }),
                                          (0, r.jsxs)("div", {
                                            children: [
                                              (0, r.jsx)("div", {
                                                className:
                                                  "text-[10px] uppercase tracking-wider text-muted-foreground",
                                                children: "ROAS",
                                              }),
                                              (0, r.jsx)("div", {
                                                className:
                                                  "mt-0.5 text-sm font-bold tabular-nums text-success",
                                                children:
                                                  e.roas > 0
                                                    ? "".concat(e.roas.toFixed(2), "\xd7")
                                                    : "—",
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  e.id,
                                ),
                              ),
                      }),
                      (0, r.jsx)("div", {
                        className: "hidden lg:block",
                        children: (0, r.jsx)("div", {
                          className: "overflow-x-auto",
                          children: (0, r.jsxs)("table", {
                            className: "w-full text-sm",
                            children: [
                              (0, r.jsx)("thead", {
                                children: (0, r.jsxs)("tr", {
                                  className:
                                    "text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                                  children: [
                                    (0, r.jsx)("th", { className: "pb-3 pr-4", children: "No" }),
                                    (0, r.jsx)("th", {
                                      className: "pb-3 pr-4",
                                      children: "Campaign Name",
                                    }),
                                    (0, r.jsx)("th", {
                                      className: "pb-3 pr-4 text-right",
                                      children: "Spend",
                                    }),
                                    (0, r.jsx)("th", {
                                      className: "pb-3 pr-4 text-right",
                                      children: "Results",
                                    }),
                                    (0, r.jsx)("th", {
                                      className: "pb-3 text-right",
                                      children: "ROAS",
                                    }),
                                  ],
                                }),
                              }),
                              (0, r.jsx)("tbody", {
                                children:
                                  0 === D.slice(0, 3).length
                                    ? (0, r.jsx)("tr", {
                                        children: (0, r.jsx)("td", {
                                          colSpan: 5,
                                          className: "py-8 text-center text-muted-foreground",
                                          children: "No campaigns to show.",
                                        }),
                                      })
                                    : D.slice(0, 3).map((e, s) =>
                                        (0, r.jsxs)(
                                          "tr",
                                          {
                                            className: "border-t border-border/60",
                                            children: [
                                              (0, r.jsx)("td", {
                                                className: "py-4 pr-4 text-muted-foreground",
                                                children: s + 1,
                                              }),
                                              (0, r.jsx)("td", {
                                                className: "py-4 pr-4",
                                                children: (0, r.jsxs)("div", {
                                                  className: "flex items-center gap-3",
                                                  children: [
                                                    (0, r.jsx)("span", {
                                                      className:
                                                        "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary",
                                                      children: e.code,
                                                    }),
                                                    (0, r.jsxs)("div", {
                                                      children: [
                                                        (0, r.jsx)("div", {
                                                          className: "font-medium",
                                                          children: e.name,
                                                        }),
                                                        (0, r.jsxs)("div", {
                                                          className:
                                                            "text-xs text-muted-foreground",
                                                          children: [
                                                            e.accounts,
                                                            " ad account",
                                                            1 === e.accounts ? "" : "s",
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              }),
                                              (0, r.jsxs)("td", {
                                                className:
                                                  "py-4 pr-4 text-right font-medium tabular-nums",
                                                children: [
                                                  z,
                                                  e.spend.toLocaleString(void 0, {
                                                    minimumFractionDigits: 2,
                                                  }),
                                                ],
                                              }),
                                              (0, r.jsx)("td", {
                                                className: "py-4 pr-4 text-right tabular-nums",
                                                children: e.results,
                                              }),
                                              (0, r.jsx)("td", {
                                                className:
                                                  "py-4 text-right font-semibold tabular-nums",
                                                children:
                                                  e.roas > 0
                                                    ? "".concat(e.roas.toFixed(2), "\xd7")
                                                    : "—",
                                              }),
                                            ],
                                          },
                                          e.id,
                                        ),
                                      ),
                              }),
                            ],
                          }),
                        }),
                      }),
                    ],
                  }),
                ],
              });
      }
    },
    64269: (e, s, t) => {
      "use strict";
      t.d(s, { cn: () => l });
      var r = t(2821),
        a = t(75889);
      function l() {
        for (var e = arguments.length, s = Array(e), t = 0; t < e; t++) s[t] = arguments[t];
        return (0, a.QP)((0, r.$)(s));
      }
    },
    64686: (e, s, t) => {
      Promise.resolve().then(t.bind(t, 51002));
    },
    91761: (e, s, t) => {
      "use strict";
      t.d(s, { A: () => r });
      let r = (0, t(5121).A)("dollar-sign", [
        ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
        ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }],
      ]);
    },
    95740: (e, s, t) => {
      "use strict";
      t.d(s, { A: () => r });
      let r = (0, t(5121).A)("sparkles", [
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
  },
  (e) => {
    (e.O(0, [8909, 2619, 9924, 1583, 5346, 8441, 1255, 7358], () => e((e.s = 64686))),
      (_N_E = e.O()));
  },
]);
