(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [2162],
  {
    3998: (e, t, r) => {
      "use strict";
      r.d(t, { $: () => d });
      var n = r(95155),
        l = r(12115),
        s = r(32467),
        a = r(83101),
        i = r(64269);
      let o = (0, a.F)(
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
        d = l.forwardRef((e, t) => {
          let { className: r, variant: l, size: a, asChild: d = !1, ...u } = e,
            c = d ? s.DX : "button";
          return (0, n.jsx)(c, {
            className: (0, i.cn)(o({ variant: l, size: a, className: r })),
            ref: t,
            ...u,
          });
        });
      d.displayName = "Button";
    },
    17427: (e, t, r) => {
      "use strict";
      (r.r(t), r.d(t, { default: () => p }));
      var n = r(95155),
        l = r(52619),
        s = r.n(l),
        a = r(12115),
        i = r(56154),
        o = r(35299),
        d = r(3998),
        u = r(65142),
        c = r(76444),
        f = r(18720);
      function p() {
        let [e, t] = (0, a.useState)(""),
          [r, l] = (0, a.useState)(!1),
          [p, m] = (0, a.useState)(!1),
          y = async (t) => {
            (t.preventDefault(), l(!0));
            let r = await fetch("/api/auth/forgot-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: e }),
            });
            if ((l(!1), r.ok)) (m(!0), f.oR.success("Check your inbox for the reset link"));
            else {
              let e = await r.json().catch(() => ({}));
              f.oR.error("string" == typeof e.error ? e.error : "Something went wrong");
            }
          };
        return (0, n.jsx)("div", {
          className: "flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-12",
          children: (0, n.jsxs)("div", {
            className: "w-full max-w-md",
            children: [
              (0, n.jsxs)(s(), {
                href: "/",
                className: "mb-8 flex items-center justify-center gap-2",
                children: [
                  (0, n.jsx)("span", {
                    className:
                      "flex h-10 w-10 items-center justify-center rounded card-brutal bg-brand text-ink",
                    children: (0, n.jsx)(i.A, { className: "h-4 w-4" }),
                  }),
                  (0, n.jsx)("span", { className: "text-base font-bold", children: "AdReportly" }),
                ],
              }),
              (0, n.jsxs)("div", {
                className: "rounded card-brutal bg-card p-8",
                children: [
                  (0, n.jsx)("h1", {
                    className: "text-2xl font-bold",
                    children: "Reset your password",
                  }),
                  (0, n.jsx)("p", {
                    className: "mt-1 text-sm text-muted-foreground",
                    children: "We'll email you a link to set a new one.",
                  }),
                  p
                    ? (0, n.jsxs)("div", {
                        className:
                          "mt-6 rounded-2xl bg-success/10 p-4 text-sm text-success-foreground",
                        children: [
                          "If ",
                          (0, n.jsx)("strong", { children: e }),
                          " has an account, a reset link is on its way.",
                        ],
                      })
                    : (0, n.jsxs)("form", {
                        onSubmit: y,
                        className: "mt-6 space-y-4",
                        children: [
                          (0, n.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              (0, n.jsx)(c.J, { htmlFor: "email", children: "Email" }),
                              (0, n.jsx)(u.p, {
                                className: "rounded",
                                id: "email",
                                type: "email",
                                required: !0,
                                placeholder: "you@agency.com",
                                value: e,
                                onChange: (e) => t(e.target.value),
                              }),
                            ],
                          }),
                          (0, n.jsx)(d.$, {
                            type: "submit",
                            disabled: r,
                            className:
                              "w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand font-semibold",
                            children: r
                              ? (0, n.jsx)(o.A, { className: "h-4 w-4 animate-spin" })
                              : "Send reset link",
                          }),
                        ],
                      }),
                  (0, n.jsxs)("p", {
                    className: "mt-6 text-center text-sm text-muted-foreground",
                    children: [
                      "Remembered it?",
                      " ",
                      (0, n.jsx)(s(), {
                        href: "/login",
                        className: "font-medium text-primary hover:underline",
                        children: "Sign in",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        });
      }
    },
    32467: (e, t, r) => {
      "use strict";
      r.d(t, { DX: () => c, TL: () => u });
      var n,
        l = r(12115),
        s = r(94446),
        a = r(95155),
        i = Symbol.for("react.lazy"),
        o = (n || (n = r.t(l, 2)))[" use ".trim().toString()];
      function d(e) {
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
      function u(e) {
        let t = (function (e) {
            let t = l.forwardRef((e, t) => {
              let { children: r, ...n } = e;
              if ((d(r) && "function" == typeof o && (r = o(r._payload)), l.isValidElement(r))) {
                var a;
                let e,
                  i,
                  o =
                    ((a = r),
                    (i =
                      (e = Object.getOwnPropertyDescriptor(a.props, "ref")?.get) &&
                      "isReactWarning" in e &&
                      e.isReactWarning)
                      ? a.ref
                      : (i =
                            (e = Object.getOwnPropertyDescriptor(a, "ref")?.get) &&
                            "isReactWarning" in e &&
                            e.isReactWarning)
                        ? a.props.ref
                        : a.props.ref || a.ref),
                  d = (function (e, t) {
                    let r = { ...t };
                    for (let n in t) {
                      let l = e[n],
                        s = t[n];
                      /^on[A-Z]/.test(n)
                        ? l && s
                          ? (r[n] = (...e) => {
                              let t = s(...e);
                              return (l(...e), t);
                            })
                          : l && (r[n] = l)
                        : "style" === n
                          ? (r[n] = { ...l, ...s })
                          : "className" === n && (r[n] = [l, s].filter(Boolean).join(" "));
                    }
                    return { ...e, ...r };
                  })(n, r.props);
                return (
                  r.type !== l.Fragment && (d.ref = t ? (0, s.t)(t, o) : o),
                  l.cloneElement(r, d)
                );
              }
              return l.Children.count(r) > 1 ? l.Children.only(null) : null;
            });
            return ((t.displayName = `${e}.SlotClone`), t);
          })(e),
          r = l.forwardRef((e, r) => {
            let { children: n, ...s } = e;
            d(n) && "function" == typeof o && (n = o(n._payload));
            let i = l.Children.toArray(n),
              u = i.find(p);
            if (u) {
              let e = u.props.children,
                n = i.map((t) =>
                  t !== u
                    ? t
                    : l.Children.count(e) > 1
                      ? l.Children.only(null)
                      : l.isValidElement(e)
                        ? e.props.children
                        : null,
                );
              return (0, a.jsx)(t, {
                ...s,
                ref: r,
                children: l.isValidElement(e) ? l.cloneElement(e, void 0, n) : null,
              });
            }
            return (0, a.jsx)(t, { ...s, ref: r, children: n });
          });
        return ((r.displayName = `${e}.Slot`), r);
      }
      var c = u("Slot"),
        f = Symbol("radix.slottable");
      function p(e) {
        return (
          l.isValidElement(e) &&
          "function" == typeof e.type &&
          "__radixId" in e.type &&
          e.type.__radixId === f
        );
      }
    },
    32894: (e, t, r) => {
      "use strict";
      r.d(t, { b: () => o });
      var n = r(12115);
      r(47650);
      var l = r(32467),
        s = r(95155),
        a = [
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
        ].reduce((e, t) => {
          let r = (0, l.TL)(`Primitive.${t}`),
            a = n.forwardRef((e, n) => {
              let { asChild: l, ...a } = e;
              return (
                "undefined" != typeof window && (window[Symbol.for("radix-ui")] = !0),
                (0, s.jsx)(l ? r : t, { ...a, ref: n })
              );
            });
          return ((a.displayName = `Primitive.${t}`), { ...e, [t]: a });
        }, {}),
        i = n.forwardRef((e, t) =>
          (0, s.jsx)(a.label, {
            ...e,
            ref: t,
            onMouseDown: (t) => {
              var r;
              t.target.closest("button, input, select, textarea") ||
                (null == (r = e.onMouseDown) || r.call(e, t),
                !t.defaultPrevented && t.detail > 1 && t.preventDefault());
            },
          }),
        );
      i.displayName = "Label";
      var o = i;
    },
    35299: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => n });
      let n = (0, r(5121).A)("loader-circle", [
        ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
      ]);
    },
    56154: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => n });
      let n = (0, r(5121).A)("zap", [
        [
          "path",
          {
            d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
            key: "1xq2db",
          },
        ],
      ]);
    },
    64269: (e, t, r) => {
      "use strict";
      r.d(t, { cn: () => s });
      var n = r(2821),
        l = r(75889);
      function s() {
        for (var e = arguments.length, t = Array(e), r = 0; r < e; r++) t[r] = arguments[r];
        return (0, l.QP)((0, n.$)(t));
      }
    },
    65142: (e, t, r) => {
      "use strict";
      r.d(t, { p: () => a });
      var n = r(95155),
        l = r(12115),
        s = r(64269);
      let a = l.forwardRef((e, t) => {
        let { className: r, type: l, ...a } = e;
        return (0, n.jsx)("input", {
          type: l,
          className: (0, s.cn)(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            r,
          ),
          ref: t,
          ...a,
        });
      });
      a.displayName = "Input";
    },
    65457: (e, t, r) => {
      Promise.resolve().then(r.bind(r, 17427));
    },
    76444: (e, t, r) => {
      "use strict";
      r.d(t, { J: () => d });
      var n = r(95155),
        l = r(12115),
        s = r(32894),
        a = r(83101),
        i = r(64269);
      let o = (0, a.F)(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        ),
        d = l.forwardRef((e, t) => {
          let { className: r, ...l } = e;
          return (0, n.jsx)(s.b, { ref: t, className: (0, i.cn)(o(), r), ...l });
        });
      d.displayName = s.b.displayName;
    },
    83101: (e, t, r) => {
      "use strict";
      r.d(t, { F: () => a });
      var n = r(2821);
      let l = (e) => ("boolean" == typeof e ? `${e}` : 0 === e ? "0" : e),
        s = n.$,
        a = (e, t) => (r) => {
          var n;
          if ((null == t ? void 0 : t.variants) == null)
            return s(e, null == r ? void 0 : r.class, null == r ? void 0 : r.className);
          let { variants: a, defaultVariants: i } = t,
            o = Object.keys(a).map((e) => {
              let t = null == r ? void 0 : r[e],
                n = null == i ? void 0 : i[e];
              if (null === t) return null;
              let s = l(t) || l(n);
              return a[e][s];
            }),
            d =
              r &&
              Object.entries(r).reduce((e, t) => {
                let [r, n] = t;
                return (void 0 === n || (e[r] = n), e);
              }, {});
          return s(
            e,
            o,
            null == t || null == (n = t.compoundVariants)
              ? void 0
              : n.reduce((e, t) => {
                  let { class: r, className: n, ...l } = t;
                  return Object.entries(l).every((e) => {
                    let [t, r] = e;
                    return Array.isArray(r)
                      ? r.includes({ ...i, ...d }[t])
                      : { ...i, ...d }[t] === r;
                  })
                    ? [...e, r, n]
                    : e;
                }, []),
            null == r ? void 0 : r.class,
            null == r ? void 0 : r.className,
          );
        };
    },
    94446: (e, t, r) => {
      "use strict";
      r.d(t, { s: () => a, t: () => s });
      var n = r(12115);
      function l(e, t) {
        if ("function" == typeof e) return e(t);
        null != e && (e.current = t);
      }
      function s(...e) {
        return (t) => {
          let r = !1,
            n = e.map((e) => {
              let n = l(e, t);
              return (r || "function" != typeof n || (r = !0), n);
            });
          if (r)
            return () => {
              for (let t = 0; t < n.length; t++) {
                let r = n[t];
                "function" == typeof r ? r() : l(e[t], null);
              }
            };
        };
      }
      function a(...e) {
        return n.useCallback(s(...e), e);
      }
    },
  },
  (e) => {
    (e.O(0, [8909, 2619, 8720, 8441, 1255, 7358], () => e((e.s = 65457))), (_N_E = e.O()));
  },
]);
