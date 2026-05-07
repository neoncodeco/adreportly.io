(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [3272],
  {
    3998: (e, t, s) => {
      "use strict";
      s.d(t, { $: () => d });
      var r = s(95155),
        a = s(12115),
        n = s(32467),
        c = s(83101),
        i = s(64269);
      let l = (0, c.F)(
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
        d = a.forwardRef((e, t) => {
          let { className: s, variant: a, size: c, asChild: d = !1, ...o } = e,
            u = d ? n.DX : "button";
          return (0, r.jsx)(u, {
            className: (0, i.cn)(l({ variant: a, size: c, className: s })),
            ref: t,
            ...o,
          });
        });
      d.displayName = "Button";
    },
    20063: (e, t, s) => {
      "use strict";
      var r = s(47260);
      (s.o(r, "useParams") &&
        s.d(t, {
          useParams: function () {
            return r.useParams;
          },
        }),
        s.o(r, "usePathname") &&
          s.d(t, {
            usePathname: function () {
              return r.usePathname;
            },
          }),
        s.o(r, "useRouter") &&
          s.d(t, {
            useRouter: function () {
              return r.useRouter;
            },
          }),
        s.o(r, "useSearchParams") &&
          s.d(t, {
            useSearchParams: function () {
              return r.useSearchParams;
            },
          }));
    },
    35299: (e, t, s) => {
      "use strict";
      s.d(t, { A: () => r });
      let r = (0, s(5121).A)("loader-circle", [
        ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
      ]);
    },
    64269: (e, t, s) => {
      "use strict";
      s.d(t, { cn: () => n });
      var r = s(2821),
        a = s(75889);
      function n() {
        for (var e = arguments.length, t = Array(e), s = 0; s < e; s++) t[s] = arguments[s];
        return (0, a.QP)((0, r.$)(t));
      }
    },
    73155: (e, t, s) => {
      "use strict";
      s.d(t, { A: () => r });
      let r = (0, s(5121).A)("facebook", [
        [
          "path",
          { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", key: "1jg4f8" },
        ],
      ]);
    },
    78108: (e, t, s) => {
      "use strict";
      s.d(t, { Z: () => a });
      var r = s(12115);
      function a(e) {
        let t = r.useRef({ value: e, previous: e });
        return r.useMemo(
          () => (
            t.current.value !== e &&
              ((t.current.previous = t.current.value), (t.current.value = e)),
            t.current.previous
          ),
          [e],
        );
      }
    },
    84288: (e, t, s) => {
      "use strict";
      s.d(t, { X: () => n });
      var r = s(12115),
        a = s(4129);
      function n(e) {
        let [t, s] = r.useState(void 0);
        return (
          (0, a.N)(() => {
            if (e) {
              s({ width: e.offsetWidth, height: e.offsetHeight });
              let t = new ResizeObserver((t) => {
                let r, a;
                if (!Array.isArray(t) || !t.length) return;
                let n = t[0];
                if ("borderBoxSize" in n) {
                  let e = n.borderBoxSize,
                    t = Array.isArray(e) ? e[0] : e;
                  ((r = t.inlineSize), (a = t.blockSize));
                } else ((r = e.offsetWidth), (a = e.offsetHeight));
                s({ width: r, height: a });
              });
              return (t.observe(e, { box: "border-box" }), () => t.unobserve(e));
            }
            s(void 0);
          }, [e]),
          t
        );
      }
    },
    84676: (e, t, s) => {
      Promise.resolve().then(s.bind(s, 87278));
    },
    87278: (e, t, s) => {
      "use strict";
      s.d(t, { MetaConnectPage: () => z });
      var r = s(95155),
        a = s(12115),
        n = s(20063),
        c = s(9924),
        i = s(73155),
        l = s(35299),
        d = s(5121);
      let o = (0, d.A)("ellipsis-vertical", [
          ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
          ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
          ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }],
        ]),
        u = (0, d.A)("refresh-cw", [
          ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
          ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
          ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
          ["path", { d: "M8 16H3v5", key: "1cv678" }],
        ]);
      var x = s(3998),
        h = s(92556),
        m = s(94446),
        f = s(3468),
        p = s(23558),
        b = s(78108),
        v = s(84288),
        g = s(88142),
        y = "Switch",
        [j, N] = (0, f.A)(y),
        [w, k] = j(y),
        A = a.forwardRef((e, t) => {
          let {
              __scopeSwitch: s,
              name: n,
              checked: c,
              defaultChecked: i,
              required: l,
              disabled: d,
              value: o = "on",
              onCheckedChange: u,
              form: x,
              ...f
            } = e,
            [b, v] = a.useState(null),
            j = (0, m.s)(t, (e) => v(e)),
            N = a.useRef(!1),
            k = !b || x || !!b.closest("form"),
            [A, C] = (0, p.i)({ prop: c, defaultProp: null != i && i, onChange: u, caller: y });
          return (0, r.jsxs)(w, {
            scope: s,
            checked: A,
            disabled: d,
            children: [
              (0, r.jsx)(g.sG.button, {
                type: "button",
                role: "switch",
                "aria-checked": A,
                "aria-required": l,
                "data-state": R(A),
                "data-disabled": d ? "" : void 0,
                disabled: d,
                value: o,
                ...f,
                ref: j,
                onClick: (0, h.mK)(e.onClick, (e) => {
                  (C((e) => !e),
                    k &&
                      ((N.current = e.isPropagationStopped()), N.current || e.stopPropagation()));
                }),
              }),
              k &&
                (0, r.jsx)(S, {
                  control: b,
                  bubbles: !N.current,
                  name: n,
                  value: o,
                  checked: A,
                  required: l,
                  disabled: d,
                  form: x,
                  style: { transform: "translateX(-100%)" },
                }),
            ],
          });
        });
      A.displayName = y;
      var C = "SwitchThumb",
        P = a.forwardRef((e, t) => {
          let { __scopeSwitch: s, ...a } = e,
            n = k(C, s);
          return (0, r.jsx)(g.sG.span, {
            "data-state": R(n.checked),
            "data-disabled": n.disabled ? "" : void 0,
            ...a,
            ref: t,
          });
        });
      P.displayName = C;
      var S = a.forwardRef((e, t) => {
        let { __scopeSwitch: s, control: n, checked: c, bubbles: i = !0, ...l } = e,
          d = a.useRef(null),
          o = (0, m.s)(d, t),
          u = (0, b.Z)(c),
          x = (0, v.X)(n);
        return (
          a.useEffect(() => {
            let e = d.current;
            if (!e) return;
            let t = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "checked",
            ).set;
            if (u !== c && t) {
              let s = new Event("click", { bubbles: i });
              (t.call(e, c), e.dispatchEvent(s));
            }
          }, [u, c, i]),
          (0, r.jsx)("input", {
            type: "checkbox",
            "aria-hidden": !0,
            defaultChecked: c,
            ...l,
            tabIndex: -1,
            ref: o,
            style: {
              ...l.style,
              ...x,
              position: "absolute",
              pointerEvents: "none",
              opacity: 0,
              margin: 0,
            },
          })
        );
      });
      function R(e) {
        return e ? "checked" : "unchecked";
      }
      S.displayName = "SwitchBubbleInput";
      var E = s(64269);
      let F = a.forwardRef((e, t) => {
        let { className: s, ...a } = e;
        return (0, r.jsx)(A, {
          className: (0, E.cn)(
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
            s,
          ),
          ...a,
          ref: t,
          children: (0, r.jsx)(P, {
            className: (0, E.cn)(
              "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
            ),
          }),
        });
      });
      function _(e) {
        switch (e) {
          case 1:
          case 101:
            return "active";
          case 2:
            return "disabled";
          case 3:
            return "unsettled";
          case 7:
            return "pending review";
          case 8:
            return "grace period";
          case 9:
            return "pending closure";
          case 100:
            return "closed";
          case 201:
            return "verifying";
          default:
            return "inactive";
        }
      }
      function M(e) {
        return "active" === e ? "bg-success/15 text-success" : "bg-muted text-muted-foreground";
      }
      function z() {
        let e = (0, n.useSearchParams)(),
          [t, s] = (0, a.useState)([]),
          [d, h] = (0, a.useState)(!0),
          [m, f] = (0, a.useState)(null),
          [p, b] = (0, a.useState)(null),
          v = (0, a.useCallback)(async () => {
            (h(!0), f(null));
            try {
              var e;
              let t = await fetch("/api/ad-accounts", { credentials: "include" }),
                r = await t.json();
              if (!t.ok || !1 === r.success) {
                (f("string" == typeof r.error ? r.error : "Could not load ad accounts"), s([]));
                return;
              }
              s(null != (e = r.adAccounts) ? e : []);
            } catch (e) {
              (f("Network error"), s([]));
            } finally {
              h(!1);
            }
          }, []);
        ((0, a.useEffect)(() => {
          v();
        }, [v]),
          (0, a.useEffect)(() => {
            "1" === e.get("connected") &&
              (b({ kind: "ok", text: "Facebook connected. Ad accounts refreshed below." }), v());
            let t = e.get("error");
            t &&
              b({
                kind: "err",
                text:
                  "oauth" === t
                    ? "OAuth state mismatch — try Connect again."
                    : "secrets" === t
                      ? "Set JWT_SECRET and ENCRYPTION_KEY in .env for Meta OAuth."
                      : "token" === t
                        ? "Could not exchange code for token — check FACEBOOK_APP_ID / SECRET and redirect URI."
                        : "Connection failed (".concat(t, ")."),
              });
          }, [e, v]));
        let g = "/api/auth/facebook";
        return (0, r.jsxs)(c.P.div, {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35 },
          className: "space-y-5",
          children: [
            p
              ? (0, r.jsx)("div", {
                  role: "status",
                  className:
                    "ok" === p.kind
                      ? "rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground"
                      : "rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
                  children: p.text,
                })
              : null,
            (0, r.jsxs)("div", {
              className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
              children: [
                (0, r.jsxs)("div", {
                  children: [
                    (0, r.jsx)("h1", {
                      className: "text-xl font-bold sm:text-2xl",
                      children: "Meta Connection",
                    }),
                    (0, r.jsx)("p", {
                      className: "text-xs text-muted-foreground sm:text-sm",
                      children:
                        "Connect and manage your Facebook Ad Accounts. Sign in first so Meta links to your user (MongoDB User.agencyId); then APIs and share links resolve the same agency id as the JWT.",
                    }),
                  ],
                }),
                (0, r.jsx)(x.$, {
                  className: "rounded-full bg-[#1877F2] text-white shadow-glow hover:opacity-95",
                  asChild: !0,
                  children: (0, r.jsxs)("a", {
                    href: g,
                    children: [(0, r.jsx)(i.A, { className: "mr-2 h-4 w-4" }), " Connect Facebook"],
                  }),
                }),
              ],
            }),
            0 === t.length &&
              !d &&
              (0, r.jsxs)("div", {
                className:
                  "relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-soft sm:p-12",
                children: [
                  (0, r.jsx)("div", {
                    className:
                      "pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1877F2]/10 via-transparent to-primary/10",
                  }),
                  (0, r.jsx)("div", {
                    className:
                      "pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#1877F2]/15 blur-3xl",
                  }),
                  (0, r.jsx)("div", {
                    className:
                      "pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl",
                  }),
                  (0, r.jsx)("div", {
                    className:
                      "relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-glow sm:h-20 sm:w-20",
                    children: (0, r.jsx)(i.A, { className: "h-8 w-8 sm:h-10 sm:w-10" }),
                  }),
                  (0, r.jsx)("h3", {
                    className: "relative mt-5 text-lg font-bold sm:text-xl",
                    children: m ? "Could not load accounts" : "No Ad Accounts Yet",
                  }),
                  (0, r.jsx)("p", {
                    className: "relative mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground",
                    children:
                      null != m
                        ? m
                        : "Connect your Facebook account to sync the ad accounts you manage.",
                  }),
                  (0, r.jsx)(x.$, {
                    className:
                      "relative mt-6 rounded-full bg-[#1877F2] text-white shadow-glow hover:opacity-95",
                    asChild: !0,
                    children: (0, r.jsxs)("a", {
                      href: g,
                      children: [
                        (0, r.jsx)(i.A, { className: "mr-2 h-4 w-4" }),
                        " Connect Facebook Account",
                      ],
                    }),
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
                          children: "Ad Accounts",
                        }),
                        (0, r.jsx)("p", {
                          className: "text-xs text-muted-foreground",
                          children: "From Meta (live)",
                        }),
                      ],
                    }),
                    (0, r.jsx)("span", {
                      className:
                        "inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary",
                      children: d ? "…" : t.length,
                    }),
                  ],
                }),
                d
                  ? (0, r.jsx)("div", {
                      className: "flex justify-center py-12",
                      children: (0, r.jsx)(l.A, {
                        className: "h-8 w-8 animate-spin text-muted-foreground",
                        "aria-label": "Loading",
                      }),
                    })
                  : m
                    ? (0, r.jsxs)("div", {
                        className: "flex flex-col items-center gap-3 py-8",
                        children: [
                          (0, r.jsx)("p", {
                            className: "text-center text-sm text-destructive",
                            children: m,
                          }),
                          (0, r.jsx)(x.$, {
                            type: "button",
                            variant: "outline",
                            size: "sm",
                            onClick: () => void v(),
                            children: "Retry",
                          }),
                        ],
                      })
                    : 0 === t.length
                      ? (0, r.jsx)("p", {
                          className: "text-sm text-muted-foreground",
                          children:
                            "No ad accounts returned yet. Connect Facebook above, then refresh this list.",
                        })
                      : (0, r.jsxs)(r.Fragment, {
                          children: [
                            (0, r.jsx)("div", {
                              className: "space-y-3 lg:hidden",
                              children: t.map((e) => {
                                let t = _(e.account_status),
                                  s = e.id.replace(/^act_/, "");
                                return (0, r.jsxs)(
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
                                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/15 text-[#1877F2]",
                                            children: (0, r.jsx)(i.A, { className: "h-5 w-5" }),
                                          }),
                                          (0, r.jsxs)("div", {
                                            className: "min-w-0 flex-1",
                                            children: [
                                              (0, r.jsxs)("div", {
                                                className: "flex items-start justify-between gap-2",
                                                children: [
                                                  (0, r.jsxs)("div", {
                                                    className: "min-w-0",
                                                    children: [
                                                      (0, r.jsx)("p", {
                                                        className: "truncate text-sm font-bold",
                                                        children: e.name,
                                                      }),
                                                      (0, r.jsx)("p", {
                                                        className:
                                                          "truncate text-xs text-muted-foreground",
                                                        children: s,
                                                      }),
                                                    ],
                                                  }),
                                                  (0, r.jsx)(x.$, {
                                                    variant: "ghost",
                                                    size: "icon",
                                                    className: "-mr-2 h-7 w-7 shrink-0",
                                                    children: (0, r.jsx)(o, {
                                                      className: "h-4 w-4",
                                                    }),
                                                  }),
                                                ],
                                              }),
                                              (0, r.jsxs)("div", {
                                                className:
                                                  "mt-2 flex flex-wrap items-center gap-1.5",
                                                children: [
                                                  (0, r.jsx)("span", {
                                                    className:
                                                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ".concat(
                                                        M(t),
                                                      ),
                                                    children: t,
                                                  }),
                                                  (0, r.jsx)("span", {
                                                    className:
                                                      "rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold",
                                                    children: e.currency,
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      (0, r.jsxs)("div", {
                                        className:
                                          "mt-4 flex items-center justify-between border-t border-border/60 pt-3",
                                        children: [
                                          (0, r.jsxs)("div", {
                                            children: [
                                              (0, r.jsx)("div", {
                                                className:
                                                  "text-[10px] uppercase tracking-wider text-muted-foreground",
                                                children: "Last synced",
                                              }),
                                              (0, r.jsx)("div", {
                                                className:
                                                  "text-xs font-semibold text-muted-foreground",
                                                children: "Live via API",
                                              }),
                                            ],
                                          }),
                                          (0, r.jsxs)("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                              (0, r.jsx)(F, {
                                                defaultChecked: !0,
                                                disabled: !0,
                                                "aria-label": "Active (read-only)",
                                              }),
                                              (0, r.jsxs)(x.$, {
                                                size: "sm",
                                                variant: "outline",
                                                className: "rounded-full",
                                                type: "button",
                                                onClick: () => void v(),
                                                children: [
                                                  (0, r.jsx)(u, {
                                                    className: "mr-1.5 h-3.5 w-3.5",
                                                  }),
                                                  " Refresh",
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  e.id,
                                );
                              }),
                            }),
                            (0, r.jsx)("div", {
                              className: "hidden overflow-x-auto lg:block",
                              children: (0, r.jsxs)("table", {
                                className: "w-full text-sm",
                                children: [
                                  (0, r.jsx)("thead", {
                                    children: (0, r.jsxs)("tr", {
                                      className:
                                        "text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                                      children: [
                                        (0, r.jsx)("th", {
                                          className: "pb-3 pr-4",
                                          children: "Account",
                                        }),
                                        (0, r.jsx)("th", {
                                          className: "pb-3 pr-4",
                                          children: "Currency",
                                        }),
                                        (0, r.jsx)("th", {
                                          className: "pb-3 pr-4",
                                          children: "Status",
                                        }),
                                        (0, r.jsx)("th", {
                                          className: "pb-3 pr-4",
                                          children: "Last synced",
                                        }),
                                        (0, r.jsx)("th", {
                                          className: "pb-3 pr-4 text-center",
                                          children: "Active",
                                        }),
                                        (0, r.jsx)("th", {
                                          className: "pb-3 text-right",
                                          children: "Actions",
                                        }),
                                      ],
                                    }),
                                  }),
                                  (0, r.jsx)("tbody", {
                                    children: t.map((e) => {
                                      let t = _(e.account_status),
                                        s = e.id.replace(/^act_/, "");
                                      return (0, r.jsxs)(
                                        "tr",
                                        {
                                          className: "border-t border-border/60",
                                          children: [
                                            (0, r.jsxs)("td", {
                                              className: "py-4 pr-4",
                                              children: [
                                                (0, r.jsx)("div", {
                                                  className: "font-semibold",
                                                  children: e.name,
                                                }),
                                                (0, r.jsx)("div", {
                                                  className: "text-xs text-muted-foreground",
                                                  children: s,
                                                }),
                                              ],
                                            }),
                                            (0, r.jsx)("td", {
                                              className: "py-4 pr-4",
                                              children: e.currency,
                                            }),
                                            (0, r.jsx)("td", {
                                              className: "py-4 pr-4",
                                              children: (0, r.jsx)("span", {
                                                className:
                                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ".concat(
                                                    M(t),
                                                  ),
                                                children: t,
                                              }),
                                            }),
                                            (0, r.jsx)("td", {
                                              className: "py-4 pr-4 text-muted-foreground",
                                              children: "Live via API",
                                            }),
                                            (0, r.jsx)("td", {
                                              className: "py-4 pr-4 text-center",
                                              children: (0, r.jsx)(F, {
                                                defaultChecked: !0,
                                                disabled: !0,
                                                "aria-label": "Active (read-only)",
                                              }),
                                            }),
                                            (0, r.jsx)("td", {
                                              className: "py-4 text-right",
                                              children: (0, r.jsxs)("button", {
                                                type: "button",
                                                className:
                                                  "inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-primary hover:underline",
                                                onClick: () => void v(),
                                                children: [
                                                  (0, r.jsx)(u, { className: "h-3.5 w-3.5" }),
                                                  " Refresh",
                                                ],
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
                          ],
                        }),
              ],
            }),
          ],
        });
      }
      F.displayName = A.displayName;
    },
  },
  (e) => {
    (e.O(0, [8909, 9924, 3503, 8441, 1255, 7358], () => e((e.s = 84676))), (_N_E = e.O()));
  },
]);
