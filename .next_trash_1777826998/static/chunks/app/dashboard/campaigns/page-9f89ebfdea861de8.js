(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [5381],
  {
    3998: (e, t, r) => {
      "use strict";
      r.d(t, { $: () => c });
      var s = r(95155),
        n = r(12115),
        a = r(32467),
        l = r(83101),
        i = r(64269);
      let d = (0, l.F)(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          {
            variants: {
              variant: {
                default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                destructive:
                  "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                  "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
              },
              size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
              },
            },
            defaultVariants: { variant: "default", size: "default" },
          },
        ),
        c = n.forwardRef((e, t) => {
          let { className: r, variant: n, size: l, asChild: c = !1, ...o } = e,
            u = c ? a.DX : "button";
          return (0, s.jsx)(u, {
            className: (0, i.cn)(d({ variant: n, size: l, className: r })),
            ref: t,
            ...o,
          });
        });
      c.displayName = "Button";
    },
    10696: (e, t, r) => {
      "use strict";
      r.d(t, { CampaignsPage: () => b });
      var s = r(95155),
        n = r(52619),
        a = r.n(n),
        l = r(12115),
        i = r(9924),
        d = r(35299),
        c = r(86651),
        o = r(5121);
      let u = (0, o.A)("sliders-horizontal", [
          ["path", { d: "M10 5H3", key: "1qgfaw" }],
          ["path", { d: "M12 19H3", key: "yhmn1j" }],
          ["path", { d: "M14 3v4", key: "1sua03" }],
          ["path", { d: "M16 17v4", key: "1q0r14" }],
          ["path", { d: "M21 12h-9", key: "1o4lsq" }],
          ["path", { d: "M21 19h-5", key: "1rlt1p" }],
          ["path", { d: "M21 5h-7", key: "1oszz2" }],
          ["path", { d: "M8 10v4", key: "tgpxqk" }],
          ["path", { d: "M8 12H3", key: "a7s4jb" }],
        ]),
        m = (0, o.A)("ellipsis", [
          ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
          ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
          ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }],
        ]);
      var x = r(17181),
        p = r(3998),
        h = r(65142),
        f = r(64269);
      let g = {
        active: "bg-success/15 text-success",
        paused: "bg-warning/15 text-warning-foreground",
        completed: "bg-muted text-muted-foreground",
        other: "bg-muted text-muted-foreground",
      };
      function b() {
        let [e, t] = (0, l.useState)([]),
          [r, n] = (0, l.useState)("৳"),
          [o, b] = (0, l.useState)(!0),
          [y, v] = (0, l.useState)(null),
          [j, N] = (0, l.useState)(""),
          w = (0, l.useCallback)(async () => {
            (b(!0), v(null));
            try {
              var e, r, s;
              let a = await fetch("/api/dashboard/overview", { credentials: "include" }),
                l = await a.json();
              if (!a.ok || !1 === l.success) {
                (v("string" == typeof l.error ? l.error : "Could not load campaigns"), t([]));
                return;
              }
              (n(null != (r = l.currencySymbol) ? r : "৳"),
                t(
                  (null == (e = l.campaigns) ? void 0 : e.length)
                    ? l.campaigns
                    : null != (s = l.recentCampaigns)
                      ? s
                      : [],
                ));
            } catch (e) {
              (v("Network error"), t([]));
            } finally {
              b(!1);
            }
          }, []);
        (0, l.useEffect)(() => {
          w();
        }, [w]);
        let k = (0, l.useMemo)(() => {
            let t = j.trim().toLowerCase();
            return t ? e.filter((e) => e.name.toLowerCase().includes(t) || e.id.includes(t)) : e;
          }, [e, j]),
          C = k.filter((e) => "active" === e.status).length;
        return o
          ? (0, s.jsx)("div", {
              className: "flex min-h-[40vh] items-center justify-center",
              children: (0, s.jsx)(d.A, {
                className: "h-8 w-8 animate-spin text-muted-foreground",
                "aria-label": "Loading",
              }),
            })
          : y
            ? (0, s.jsx)("div", {
                className:
                  "rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive",
                children: y,
              })
            : (0, s.jsxs)(i.P.div, {
                initial: { opacity: 0, y: 12 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.35 },
                className: "space-y-5",
                children: [
                  (0, s.jsxs)("div", {
                    className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
                    children: [
                      (0, s.jsxs)("div", {
                        children: [
                          (0, s.jsx)("h1", {
                            className: "text-xl font-bold sm:text-2xl",
                            children: "Campaigns",
                          }),
                          (0, s.jsx)("p", {
                            className: "text-xs text-muted-foreground sm:text-sm",
                            children:
                              "Facebook campaigns (last 30 days) from your connected Meta accounts",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className: "flex flex-wrap gap-2",
                        children: [
                          (0, s.jsxs)("span", {
                            className:
                              "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold",
                            children: [
                              (0, s.jsx)("span", {
                                className: "h-1.5 w-1.5 rounded-full bg-success",
                              }),
                              " ",
                              C,
                              " Active",
                            ],
                          }),
                          (0, s.jsxs)("span", {
                            className:
                              "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold",
                            children: ["Total: ", k.length],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    className: "flex items-center gap-2",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "relative flex-1",
                        children: [
                          (0, s.jsx)(c.A, {
                            className:
                              "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                          }),
                          (0, s.jsx)(h.p, {
                            placeholder: "Search campaigns…",
                            value: j,
                            onChange: (e) => N(e.target.value),
                            className: "h-10 rounded-full border-border bg-card pl-9",
                          }),
                        ],
                      }),
                      (0, s.jsx)(p.$, {
                        variant: "outline",
                        size: "icon",
                        className: "h-10 w-10 shrink-0 rounded-full",
                        type: "button",
                        children: (0, s.jsx)(u, { className: "h-4 w-4" }),
                      }),
                    ],
                  }),
                  0 === k.length
                    ? (0, s.jsxs)("p", {
                        className: "text-sm text-muted-foreground",
                        children: [
                          "No campaigns in the last 30 days.",
                          " ",
                          (0, s.jsx)(a(), {
                            href: "/dashboard/meta-connect",
                            className: "font-semibold text-primary hover:underline",
                            children: "Connect Meta",
                          }),
                          " ",
                          "or check spend in Ads Manager.",
                        ],
                      })
                    : null,
                  (0, s.jsx)("div", {
                    className: "space-y-3 lg:hidden",
                    children: k.map((e) => {
                      var t;
                      return (0, s.jsxs)(
                        "div",
                        {
                          className: "rounded-2xl border border-border bg-card p-4 shadow-soft",
                          children: [
                            (0, s.jsxs)("div", {
                              className: "flex items-start gap-3",
                              children: [
                                (0, s.jsx)("span", {
                                  className:
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow",
                                  children: e.code,
                                }),
                                (0, s.jsxs)("div", {
                                  className: "min-w-0 flex-1",
                                  children: [
                                    (0, s.jsxs)("div", {
                                      className: "flex items-center justify-between gap-2",
                                      children: [
                                        (0, s.jsx)("p", {
                                          className: "truncate text-sm font-semibold",
                                          children: e.name,
                                        }),
                                        (0, s.jsx)(p.$, {
                                          variant: "ghost",
                                          size: "icon",
                                          className: "-mr-2 h-7 w-7 shrink-0 rounded-full",
                                          type: "button",
                                          children: (0, s.jsx)(m, { className: "h-4 w-4" }),
                                        }),
                                      ],
                                    }),
                                    (0, s.jsxs)("div", {
                                      className: "mt-1 flex flex-wrap items-center gap-1.5",
                                      children: [
                                        (0, s.jsx)("span", {
                                          className: (0, f.cn)(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                                            null != (t = g[e.status]) ? t : g.other,
                                          ),
                                          children: e.status,
                                        }),
                                        (0, s.jsxs)("span", {
                                          className: "text-xs text-muted-foreground",
                                          children: ["\xb7 ", e.accounts, " ad accounts"],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, s.jsxs)("div", {
                              className:
                                "mt-4 grid grid-cols-2 gap-3 rounded-xl bg-background/50 p-3",
                              children: [
                                (0, s.jsxs)("div", {
                                  children: [
                                    (0, s.jsx)("div", {
                                      className:
                                        "text-[10px] uppercase tracking-wider text-muted-foreground",
                                      children: "Spend",
                                    }),
                                    (0, s.jsxs)("div", {
                                      className: "text-sm font-bold tabular-nums",
                                      children: [
                                        r,
                                        e.spend.toLocaleString(void 0, {
                                          maximumFractionDigits: 0,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  children: [
                                    (0, s.jsx)("div", {
                                      className:
                                        "text-[10px] uppercase tracking-wider text-muted-foreground",
                                      children: "Results",
                                    }),
                                    (0, s.jsx)("div", {
                                      className: "text-sm font-bold tabular-nums",
                                      children: e.results,
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  children: [
                                    (0, s.jsx)("div", {
                                      className:
                                        "text-[10px] uppercase tracking-wider text-muted-foreground",
                                      children: "CTR \xb7 CPC",
                                    }),
                                    (0, s.jsxs)("div", {
                                      className: "text-sm font-bold tabular-nums",
                                      children: [e.ctr.toFixed(2), "% \xb7 ", r, e.cpc.toFixed(2)],
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  children: [
                                    (0, s.jsx)("div", {
                                      className:
                                        "text-[10px] uppercase tracking-wider text-muted-foreground",
                                      children: "ROAS",
                                    }),
                                    (0, s.jsx)("div", {
                                      className: "text-sm font-bold tabular-nums text-success",
                                      children:
                                        e.roas > 0 ? "".concat(e.roas.toFixed(2), "\xd7") : "—",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, s.jsx)(p.$, {
                              variant: "outline",
                              size: "sm",
                              className: "mt-3 w-full rounded-full",
                              asChild: !0,
                              children: (0, s.jsxs)(a(), {
                                href: "/dashboard/reports",
                                children: [
                                  (0, s.jsx)(x.A, { className: "mr-2 h-3.5 w-3.5" }),
                                  " Share",
                                ],
                              }),
                            }),
                          ],
                        },
                        e.id,
                      );
                    }),
                  }),
                  (0, s.jsx)("div", {
                    className:
                      "hidden rounded-3xl border border-border bg-card p-6 shadow-soft lg:block",
                    children: (0, s.jsx)("div", {
                      className: "overflow-x-auto",
                      children: (0, s.jsxs)("table", {
                        className: "w-full text-sm",
                        children: [
                          (0, s.jsx)("thead", {
                            children: (0, s.jsxs)("tr", {
                              className:
                                "text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                              children: [
                                (0, s.jsx)("th", { className: "pb-3 pr-4", children: "Campaign" }),
                                (0, s.jsx)("th", { className: "pb-3 pr-4", children: "Status" }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 pr-4 text-right",
                                  children: "Spend",
                                }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 pr-4 text-right",
                                  children: "Results",
                                }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 pr-4 text-right",
                                  children: "CTR",
                                }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 pr-4 text-right",
                                  children: "CPC",
                                }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 pr-4 text-right",
                                  children: "ROAS",
                                }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 text-right",
                                  children: "Actions",
                                }),
                              ],
                            }),
                          }),
                          (0, s.jsx)("tbody", {
                            children: k.map((e) => {
                              var t;
                              return (0, s.jsxs)(
                                "tr",
                                {
                                  className: "border-t border-border/60",
                                  children: [
                                    (0, s.jsx)("td", {
                                      className: "py-4 pr-4",
                                      children: (0, s.jsxs)("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                          (0, s.jsx)("span", {
                                            className:
                                              "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary",
                                            children: e.code,
                                          }),
                                          (0, s.jsxs)("div", {
                                            children: [
                                              (0, s.jsx)("div", {
                                                className: "font-medium",
                                                children: e.name,
                                              }),
                                              (0, s.jsxs)("div", {
                                                className: "text-xs text-muted-foreground",
                                                children: [e.accounts, " ad accounts"],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 pr-4",
                                      children: (0, s.jsx)("span", {
                                        className: (0, f.cn)(
                                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                                          null != (t = g[e.status]) ? t : g.other,
                                        ),
                                        children: e.status,
                                      }),
                                    }),
                                    (0, s.jsxs)("td", {
                                      className: "py-4 pr-4 text-right font-medium tabular-nums",
                                      children: [
                                        r,
                                        e.spend.toLocaleString(void 0, {
                                          minimumFractionDigits: 2,
                                        }),
                                      ],
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 pr-4 text-right tabular-nums",
                                      children: e.results,
                                    }),
                                    (0, s.jsxs)("td", {
                                      className: "py-4 pr-4 text-right tabular-nums",
                                      children: [e.ctr.toFixed(2), "%"],
                                    }),
                                    (0, s.jsxs)("td", {
                                      className: "py-4 pr-4 text-right tabular-nums",
                                      children: [r, e.cpc.toFixed(2)],
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 pr-4 text-right font-semibold tabular-nums",
                                      children:
                                        e.roas > 0 ? "".concat(e.roas.toFixed(2), "\xd7") : "—",
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 text-right",
                                      children: (0, s.jsx)(p.$, {
                                        variant: "outline",
                                        size: "sm",
                                        className: "rounded-full",
                                        asChild: !0,
                                        children: (0, s.jsxs)(a(), {
                                          href: "/dashboard/reports",
                                          children: [
                                            (0, s.jsx)(x.A, { className: "mr-1.5 h-3.5 w-3.5" }),
                                            " Share",
                                          ],
                                        }),
                                      }),
                                    }),
                                  ],
                                },
                                e.id,
                              );
                            }),
                          }),
                        ],
                      }),
                    }),
                  }),
                ],
              });
      }
    },
    17181: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => s });
      let s = (0, r(5121).A)("share-2", [
        ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
        ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
        ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
        ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
        ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }],
      ]);
    },
    32467: (e, t, r) => {
      "use strict";
      r.d(t, { DX: () => u, TL: () => o });
      var s,
        n = r(12115),
        a = r(94446),
        l = r(95155),
        i = Symbol.for("react.lazy"),
        d = (s || (s = r.t(n, 2)))[" use ".trim().toString()];
      function c(e) {
        var t;
        return (
          null != e &&
          "object" == typeof e &&
          "$$typeof" in e &&
          e.$$typeof === i &&
          "_payload" in e &&
          "object" == typeof (t = e._payload) &&
          null !== t &&
          "then" in t
        );
      }
      function o(e) {
        let t = (function (e) {
            let t = n.forwardRef((e, t) => {
              let { children: r, ...s } = e;
              if ((c(r) && "function" == typeof d && (r = d(r._payload)), n.isValidElement(r))) {
                var l;
                let e,
                  i,
                  d =
                    ((l = r),
                    (i =
                      (e = Object.getOwnPropertyDescriptor(l.props, "ref")?.get) &&
                      "isReactWarning" in e &&
                      e.isReactWarning)
                      ? l.ref
                      : (i =
                            (e = Object.getOwnPropertyDescriptor(l, "ref")?.get) &&
                            "isReactWarning" in e &&
                            e.isReactWarning)
                        ? l.props.ref
                        : l.props.ref || l.ref),
                  c = (function (e, t) {
                    let r = { ...t };
                    for (let s in t) {
                      let n = e[s],
                        a = t[s];
                      /^on[A-Z]/.test(s)
                        ? n && a
                          ? (r[s] = (...e) => {
                              let t = a(...e);
                              return (n(...e), t);
                            })
                          : n && (r[s] = n)
                        : "style" === s
                          ? (r[s] = { ...n, ...a })
                          : "className" === s && (r[s] = [n, a].filter(Boolean).join(" "));
                    }
                    return { ...e, ...r };
                  })(s, r.props);
                return (
                  r.type !== n.Fragment && (c.ref = t ? (0, a.t)(t, d) : d),
                  n.cloneElement(r, c)
                );
              }
              return n.Children.count(r) > 1 ? n.Children.only(null) : null;
            });
            return ((t.displayName = `${e}.SlotClone`), t);
          })(e),
          r = n.forwardRef((e, r) => {
            let { children: s, ...a } = e;
            c(s) && "function" == typeof d && (s = d(s._payload));
            let i = n.Children.toArray(s),
              o = i.find(x);
            if (o) {
              let e = o.props.children,
                s = i.map((t) =>
                  t !== o
                    ? t
                    : n.Children.count(e) > 1
                      ? n.Children.only(null)
                      : n.isValidElement(e)
                        ? e.props.children
                        : null,
                );
              return (0, l.jsx)(t, {
                ...a,
                ref: r,
                children: n.isValidElement(e) ? n.cloneElement(e, void 0, s) : null,
              });
            }
            return (0, l.jsx)(t, { ...a, ref: r, children: s });
          });
        return ((r.displayName = `${e}.Slot`), r);
      }
      var u = o("Slot"),
        m = Symbol("radix.slottable");
      function x(e) {
        return (
          n.isValidElement(e) &&
          "function" == typeof e.type &&
          "__radixId" in e.type &&
          e.type.__radixId === m
        );
      }
    },
    35299: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => s });
      let s = (0, r(5121).A)("loader-circle", [
        ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
      ]);
    },
    62508: (e, t, r) => {
      Promise.resolve().then(r.bind(r, 10696));
    },
    64269: (e, t, r) => {
      "use strict";
      r.d(t, { cn: () => a });
      var s = r(2821),
        n = r(75889);
      function a() {
        for (var e = arguments.length, t = Array(e), r = 0; r < e; r++) t[r] = arguments[r];
        return (0, n.QP)((0, s.$)(t));
      }
    },
    65142: (e, t, r) => {
      "use strict";
      r.d(t, { p: () => l });
      var s = r(95155),
        n = r(12115),
        a = r(64269);
      let l = n.forwardRef((e, t) => {
        let { className: r, type: n, ...l } = e;
        return (0, s.jsx)("input", {
          type: n,
          className: (0, a.cn)(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            r,
          ),
          ref: t,
          ...l,
        });
      });
      l.displayName = "Input";
    },
    83101: (e, t, r) => {
      "use strict";
      r.d(t, { F: () => l });
      var s = r(2821);
      let n = (e) => ("boolean" == typeof e ? `${e}` : 0 === e ? "0" : e),
        a = s.$,
        l = (e, t) => (r) => {
          var s;
          if ((null == t ? void 0 : t.variants) == null)
            return a(e, null == r ? void 0 : r.class, null == r ? void 0 : r.className);
          let { variants: l, defaultVariants: i } = t,
            d = Object.keys(l).map((e) => {
              let t = null == r ? void 0 : r[e],
                s = null == i ? void 0 : i[e];
              if (null === t) return null;
              let a = n(t) || n(s);
              return l[e][a];
            }),
            c =
              r &&
              Object.entries(r).reduce((e, t) => {
                let [r, s] = t;
                return (void 0 === s || (e[r] = s), e);
              }, {});
          return a(
            e,
            d,
            null == t || null == (s = t.compoundVariants)
              ? void 0
              : s.reduce((e, t) => {
                  let { class: r, className: s, ...n } = t;
                  return Object.entries(n).every((e) => {
                    let [t, r] = e;
                    return Array.isArray(r)
                      ? r.includes({ ...i, ...c }[t])
                      : { ...i, ...c }[t] === r;
                  })
                    ? [...e, r, s]
                    : e;
                }, []),
            null == r ? void 0 : r.class,
            null == r ? void 0 : r.className,
          );
        };
    },
    86651: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => s });
      let s = (0, r(5121).A)("search", [
        ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
        ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ]);
    },
    94446: (e, t, r) => {
      "use strict";
      r.d(t, { s: () => l, t: () => a });
      var s = r(12115);
      function n(e, t) {
        if ("function" == typeof e) return e(t);
        null != e && (e.current = t);
      }
      function a(...e) {
        return (t) => {
          let r = !1,
            s = e.map((e) => {
              let s = n(e, t);
              return (r || "function" != typeof s || (r = !0), s);
            });
          if (r)
            return () => {
              for (let t = 0; t < s.length; t++) {
                let r = s[t];
                "function" == typeof r ? r() : n(e[t], null);
              }
            };
        };
      }
      function l(...e) {
        return s.useCallback(a(...e), e);
      }
    },
  },
  (e) => {
    (e.O(0, [8909, 2619, 9924, 8441, 1255, 7358], () => e((e.s = 62508))), (_N_E = e.O()));
  },
]);
