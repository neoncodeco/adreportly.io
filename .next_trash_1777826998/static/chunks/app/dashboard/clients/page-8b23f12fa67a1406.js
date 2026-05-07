(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [7814],
  {
    3998: (e, t, r) => {
      "use strict";
      r.d(t, { $: () => o });
      var s = r(95155),
        l = r(12115),
        a = r(32467),
        n = r(83101),
        i = r(64269);
      let d = (0, n.F)(
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
        o = l.forwardRef((e, t) => {
          let { className: r, variant: l, size: n, asChild: o = !1, ...c } = e,
            u = o ? a.DX : "button";
          return (0, s.jsx)(u, {
            className: (0, i.cn)(d({ variant: l, size: n, className: r })),
            ref: t,
            ...c,
          });
        });
      o.displayName = "Button";
    },
    6191: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => s });
      let s = (0, r(5121).A)("plus", [
        ["path", { d: "M5 12h14", key: "1ays0h" }],
        ["path", { d: "M12 5v14", key: "s699le" }],
      ]);
    },
    23664: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => s });
      let s = (0, r(5121).A)("mail", [
        ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
        ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }],
      ]);
    },
    32467: (e, t, r) => {
      "use strict";
      r.d(t, { DX: () => u, TL: () => c });
      var s,
        l = r(12115),
        a = r(94446),
        n = r(95155),
        i = Symbol.for("react.lazy"),
        d = (s || (s = r.t(l, 2)))[" use ".trim().toString()];
      function o(e) {
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
      function c(e) {
        let t = (function (e) {
            let t = l.forwardRef((e, t) => {
              let { children: r, ...s } = e;
              if ((o(r) && "function" == typeof d && (r = d(r._payload)), l.isValidElement(r))) {
                var n;
                let e,
                  i,
                  d =
                    ((n = r),
                    (i =
                      (e = Object.getOwnPropertyDescriptor(n.props, "ref")?.get) &&
                      "isReactWarning" in e &&
                      e.isReactWarning)
                      ? n.ref
                      : (i =
                            (e = Object.getOwnPropertyDescriptor(n, "ref")?.get) &&
                            "isReactWarning" in e &&
                            e.isReactWarning)
                        ? n.props.ref
                        : n.props.ref || n.ref),
                  o = (function (e, t) {
                    let r = { ...t };
                    for (let s in t) {
                      let l = e[s],
                        a = t[s];
                      /^on[A-Z]/.test(s)
                        ? l && a
                          ? (r[s] = (...e) => {
                              let t = a(...e);
                              return (l(...e), t);
                            })
                          : l && (r[s] = l)
                        : "style" === s
                          ? (r[s] = { ...l, ...a })
                          : "className" === s && (r[s] = [l, a].filter(Boolean).join(" "));
                    }
                    return { ...e, ...r };
                  })(s, r.props);
                return (
                  r.type !== l.Fragment && (o.ref = t ? (0, a.t)(t, d) : d),
                  l.cloneElement(r, o)
                );
              }
              return l.Children.count(r) > 1 ? l.Children.only(null) : null;
            });
            return ((t.displayName = `${e}.SlotClone`), t);
          })(e),
          r = l.forwardRef((e, r) => {
            let { children: s, ...a } = e;
            o(s) && "function" == typeof d && (s = d(s._payload));
            let i = l.Children.toArray(s),
              c = i.find(h);
            if (c) {
              let e = c.props.children,
                s = i.map((t) =>
                  t !== c
                    ? t
                    : l.Children.count(e) > 1
                      ? l.Children.only(null)
                      : l.isValidElement(e)
                        ? e.props.children
                        : null,
                );
              return (0, n.jsx)(t, {
                ...a,
                ref: r,
                children: l.isValidElement(e) ? l.cloneElement(e, void 0, s) : null,
              });
            }
            return (0, n.jsx)(t, { ...a, ref: r, children: s });
          });
        return ((r.displayName = `${e}.Slot`), r);
      }
      var u = c("Slot"),
        m = Symbol("radix.slottable");
      function h(e) {
        return (
          l.isValidElement(e) &&
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
    45288: (e, t, r) => {
      "use strict";
      r.d(t, { ClientsPage: () => y });
      var s = r(95155),
        l = r(12115),
        a = r(9924),
        n = r(35299),
        i = r(6191),
        d = r(86651),
        o = r(5121);
      let c = (0, o.A)("funnel", [
        [
          "path",
          {
            d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
            key: "sc7q7i",
          },
        ],
      ]);
      var u = r(23664);
      let m = (0, o.A)("eye", [
          [
            "path",
            {
              d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
              key: "1nclc0",
            },
          ],
          ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
        ]),
        h = (0, o.A)("pencil", [
          [
            "path",
            {
              d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
              key: "1a8usu",
            },
          ],
          ["path", { d: "m15 5 4 4", key: "1mk7zo" }],
        ]);
      var x = r(52619),
        p = r.n(x),
        f = r(3998),
        b = r(65142);
      function y() {
        let [e, t] = (0, l.useState)([]),
          [r, o] = (0, l.useState)(!0),
          [x, y] = (0, l.useState)(null),
          [v, g] = (0, l.useState)(""),
          j = (0, l.useCallback)(async () => {
            (o(!0), y(null));
            try {
              var e;
              let r = await fetch("/api/clients", { credentials: "include" }),
                s = await r.json();
              if (!r.ok || !1 === s.success) {
                (y("string" == typeof s.error ? s.error : "Could not load clients"), t([]));
                return;
              }
              t(null != (e = s.clients) ? e : []);
            } catch (e) {
              (y("Network error"), t([]));
            } finally {
              o(!1);
            }
          }, []);
        (0, l.useEffect)(() => {
          j();
        }, [j]);
        let N = v.trim()
          ? e.filter(
              (e) =>
                e.name.toLowerCase().includes(v.toLowerCase()) ||
                e.email.toLowerCase().includes(v.toLowerCase()),
            )
          : e;
        return r
          ? (0, s.jsx)("div", {
              className: "flex min-h-[40vh] items-center justify-center",
              children: (0, s.jsx)(n.A, {
                className: "h-8 w-8 animate-spin text-muted-foreground",
                "aria-label": "Loading",
              }),
            })
          : x
            ? (0, s.jsx)("div", {
                className:
                  "rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive",
                children: x,
              })
            : (0, s.jsxs)(a.P.div, {
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
                            children: "Clients",
                          }),
                          (0, s.jsx)("p", {
                            className: "text-xs text-muted-foreground sm:text-sm",
                            children: "Emails you have shared campaign links with (from MongoDB)",
                          }),
                        ],
                      }),
                      (0, s.jsx)(f.$, {
                        className:
                          "rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 sm:w-auto",
                        asChild: !0,
                        children: (0, s.jsxs)(p(), {
                          href: "/dashboard/reports",
                          children: [
                            (0, s.jsx)(i.A, { className: "mr-2 h-4 w-4" }),
                            " New share link",
                          ],
                        }),
                      }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    className: "flex items-center gap-2",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "relative flex-1",
                        children: [
                          (0, s.jsx)(d.A, {
                            className:
                              "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                          }),
                          (0, s.jsx)(b.p, {
                            placeholder: "Search clients…",
                            value: v,
                            onChange: (e) => g(e.target.value),
                            className: "h-10 rounded-full border-border bg-card pl-9",
                          }),
                        ],
                      }),
                      (0, s.jsx)(f.$, {
                        variant: "outline",
                        size: "icon",
                        className: "h-10 w-10 shrink-0 rounded-full",
                        type: "button",
                        children: (0, s.jsx)(c, { className: "h-4 w-4" }),
                      }),
                    ],
                  }),
                  0 === N.length
                    ? (0, s.jsxs)("p", {
                        className: "text-sm text-muted-foreground",
                        children: [
                          "No shared clients yet. Create a link under",
                          " ",
                          (0, s.jsx)(p(), {
                            href: "/dashboard/reports",
                            className: "font-semibold text-primary hover:underline",
                            children: "Reports",
                          }),
                          ".",
                        ],
                      })
                    : null,
                  (0, s.jsx)("div", {
                    className: "grid gap-3 sm:grid-cols-2 lg:hidden",
                    children: N.map((e) =>
                      (0, s.jsxs)(
                        "div",
                        {
                          className:
                            "group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant",
                          children: [
                            (0, s.jsx)("div", {
                              className:
                                "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl",
                            }),
                            (0, s.jsxs)("div", {
                              className: "relative flex items-start gap-3",
                              children: [
                                (0, s.jsx)("span", {
                                  className:
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow",
                                  children: e.initials,
                                }),
                                (0, s.jsxs)("div", {
                                  className: "min-w-0 flex-1",
                                  children: [
                                    (0, s.jsx)("p", {
                                      className: "truncate text-sm font-bold",
                                      children: e.name,
                                    }),
                                    (0, s.jsx)("p", {
                                      className: "truncate text-xs text-muted-foreground",
                                      children: e.organization,
                                    }),
                                    (0, s.jsx)("span", {
                                      className:
                                        "mt-1.5 inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-success",
                                      children: e.status,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, s.jsxs)("div", {
                              className:
                                "relative mt-3 flex items-center gap-1.5 text-xs text-muted-foreground",
                              children: [
                                (0, s.jsx)(u.A, { className: "h-3.5 w-3.5 shrink-0" }),
                                (0, s.jsx)("span", { className: "truncate", children: e.email }),
                              ],
                            }),
                            (0, s.jsxs)("div", {
                              className:
                                "relative mt-3 flex items-center justify-between border-t border-border/60 pt-3",
                              children: [
                                (0, s.jsxs)("div", {
                                  children: [
                                    (0, s.jsx)("div", {
                                      className:
                                        "text-[10px] uppercase tracking-wider text-muted-foreground",
                                      children: "Shares",
                                    }),
                                    (0, s.jsx)("div", {
                                      className: "text-base font-bold tabular-nums",
                                      children: e.accounts,
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  className: "flex gap-1",
                                  children: [
                                    (0, s.jsx)(f.$, {
                                      variant: "ghost",
                                      size: "icon",
                                      className: "h-9 w-9 rounded-full",
                                      type: "button",
                                      disabled: !0,
                                      children: (0, s.jsx)(m, { className: "h-4 w-4" }),
                                    }),
                                    (0, s.jsx)(f.$, {
                                      variant: "ghost",
                                      size: "icon",
                                      className: "h-9 w-9 rounded-full",
                                      type: "button",
                                      disabled: !0,
                                      children: (0, s.jsx)(h, { className: "h-4 w-4" }),
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
                                (0, s.jsx)("th", { className: "pb-3 pr-4", children: "Client" }),
                                (0, s.jsx)("th", { className: "pb-3 pr-4", children: "Email" }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 pr-4 text-center",
                                  children: "Shares",
                                }),
                                (0, s.jsx)("th", { className: "pb-3 pr-4", children: "Status" }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 pr-4",
                                  children: "Last shared",
                                }),
                                (0, s.jsx)("th", {
                                  className: "pb-3 text-right",
                                  children: "Actions",
                                }),
                              ],
                            }),
                          }),
                          (0, s.jsx)("tbody", {
                            children: N.map((e) =>
                              (0, s.jsxs)(
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
                                            children: e.initials,
                                          }),
                                          (0, s.jsxs)("div", {
                                            children: [
                                              (0, s.jsx)("div", {
                                                className: "font-semibold",
                                                children: e.name,
                                              }),
                                              (0, s.jsx)("div", {
                                                className: "text-xs text-muted-foreground",
                                                children: e.organization,
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 pr-4 text-muted-foreground",
                                      children: e.email,
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 pr-4 text-center tabular-nums",
                                      children: e.accounts,
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 pr-4",
                                      children: (0, s.jsx)("span", {
                                        className:
                                          "inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success",
                                        children: e.status,
                                      }),
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 pr-4 text-xs text-muted-foreground",
                                      children: new Date(e.lastShared).toLocaleDateString(),
                                    }),
                                    (0, s.jsx)("td", {
                                      className: "py-4 text-right",
                                      children: (0, s.jsx)(f.$, {
                                        variant: "ghost",
                                        size: "sm",
                                        className: "rounded-full",
                                        asChild: !0,
                                        children: (0, s.jsx)(p(), {
                                          href: "/dashboard/reports",
                                          children: "Reports",
                                        }),
                                      }),
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
              });
      }
    },
    64269: (e, t, r) => {
      "use strict";
      r.d(t, { cn: () => a });
      var s = r(2821),
        l = r(75889);
      function a() {
        for (var e = arguments.length, t = Array(e), r = 0; r < e; r++) t[r] = arguments[r];
        return (0, l.QP)((0, s.$)(t));
      }
    },
    65142: (e, t, r) => {
      "use strict";
      r.d(t, { p: () => n });
      var s = r(95155),
        l = r(12115),
        a = r(64269);
      let n = l.forwardRef((e, t) => {
        let { className: r, type: l, ...n } = e;
        return (0, s.jsx)("input", {
          type: l,
          className: (0, a.cn)(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            r,
          ),
          ref: t,
          ...n,
        });
      });
      n.displayName = "Input";
    },
    83101: (e, t, r) => {
      "use strict";
      r.d(t, { F: () => n });
      var s = r(2821);
      let l = (e) => ("boolean" == typeof e ? `${e}` : 0 === e ? "0" : e),
        a = s.$,
        n = (e, t) => (r) => {
          var s;
          if ((null == t ? void 0 : t.variants) == null)
            return a(e, null == r ? void 0 : r.class, null == r ? void 0 : r.className);
          let { variants: n, defaultVariants: i } = t,
            d = Object.keys(n).map((e) => {
              let t = null == r ? void 0 : r[e],
                s = null == i ? void 0 : i[e];
              if (null === t) return null;
              let a = l(t) || l(s);
              return n[e][a];
            }),
            o =
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
                  let { class: r, className: s, ...l } = t;
                  return Object.entries(l).every((e) => {
                    let [t, r] = e;
                    return Array.isArray(r)
                      ? r.includes({ ...i, ...o }[t])
                      : { ...i, ...o }[t] === r;
                  })
                    ? [...e, r, s]
                    : e;
                }, []),
            null == r ? void 0 : r.class,
            null == r ? void 0 : r.className,
          );
        };
    },
    83854: (e, t, r) => {
      Promise.resolve().then(r.bind(r, 45288));
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
      r.d(t, { s: () => n, t: () => a });
      var s = r(12115);
      function l(e, t) {
        if ("function" == typeof e) return e(t);
        null != e && (e.current = t);
      }
      function a(...e) {
        return (t) => {
          let r = !1,
            s = e.map((e) => {
              let s = l(e, t);
              return (r || "function" != typeof s || (r = !0), s);
            });
          if (r)
            return () => {
              for (let t = 0; t < s.length; t++) {
                let r = s[t];
                "function" == typeof r ? r() : l(e[t], null);
              }
            };
        };
      }
      function n(...e) {
        return s.useCallback(a(...e), e);
      }
    },
  },
  (e) => {
    (e.O(0, [8909, 2619, 9924, 8441, 1255, 7358], () => e((e.s = 83854))), (_N_E = e.O()));
  },
]);
