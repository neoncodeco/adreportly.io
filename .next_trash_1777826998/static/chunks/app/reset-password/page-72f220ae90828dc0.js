(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [4700],
  {
    3998: (e, r, t) => {
      "use strict";
      t.d(r, { $: () => d });
      var n = t(95155),
        a = t(12115),
        s = t(32467),
        l = t(83101),
        o = t(64269);
      let i = (0, l.F)(
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
        d = a.forwardRef((e, r) => {
          let { className: t, variant: a, size: l, asChild: d = !1, ...u } = e,
            c = d ? s.DX : "button";
          return (0, n.jsx)(c, {
            className: (0, o.cn)(i({ variant: a, size: l, className: t })),
            ref: r,
            ...u,
          });
        });
      d.displayName = "Button";
    },
    20063: (e, r, t) => {
      "use strict";
      var n = t(47260);
      (t.o(n, "useParams") &&
        t.d(r, {
          useParams: function () {
            return n.useParams;
          },
        }),
        t.o(n, "usePathname") &&
          t.d(r, {
            usePathname: function () {
              return n.usePathname;
            },
          }),
        t.o(n, "useRouter") &&
          t.d(r, {
            useRouter: function () {
              return n.useRouter;
            },
          }),
        t.o(n, "useSearchParams") &&
          t.d(r, {
            useSearchParams: function () {
              return n.useSearchParams;
            },
          }));
    },
    22440: (e, r, t) => {
      Promise.resolve().then(t.bind(t, 69046));
    },
    32467: (e, r, t) => {
      "use strict";
      t.d(r, { DX: () => c, TL: () => u });
      var n,
        a = t(12115),
        s = t(94446),
        l = t(95155),
        o = Symbol.for("react.lazy"),
        i = (n || (n = t.t(a, 2)))[" use ".trim().toString()];
      function d(e) {
        var r;
        return (
          null != e &&
          "object" == typeof e &&
          "$$typeof" in e &&
          e.$$typeof === o &&
          "_payload" in e &&
          "object" == typeof (r = e._payload) &&
          null !== r &&
          "then" in r
        );
      }
      function u(e) {
        let r = (function (e) {
            let r = a.forwardRef((e, r) => {
              let { children: t, ...n } = e;
              if ((d(t) && "function" == typeof i && (t = i(t._payload)), a.isValidElement(t))) {
                var l;
                let e,
                  o,
                  i =
                    ((l = t),
                    (o =
                      (e = Object.getOwnPropertyDescriptor(l.props, "ref")?.get) &&
                      "isReactWarning" in e &&
                      e.isReactWarning)
                      ? l.ref
                      : (o =
                            (e = Object.getOwnPropertyDescriptor(l, "ref")?.get) &&
                            "isReactWarning" in e &&
                            e.isReactWarning)
                        ? l.props.ref
                        : l.props.ref || l.ref),
                  d = (function (e, r) {
                    let t = { ...r };
                    for (let n in r) {
                      let a = e[n],
                        s = r[n];
                      /^on[A-Z]/.test(n)
                        ? a && s
                          ? (t[n] = (...e) => {
                              let r = s(...e);
                              return (a(...e), r);
                            })
                          : a && (t[n] = a)
                        : "style" === n
                          ? (t[n] = { ...a, ...s })
                          : "className" === n && (t[n] = [a, s].filter(Boolean).join(" "));
                    }
                    return { ...e, ...t };
                  })(n, t.props);
                return (
                  t.type !== a.Fragment && (d.ref = r ? (0, s.t)(r, i) : i),
                  a.cloneElement(t, d)
                );
              }
              return a.Children.count(t) > 1 ? a.Children.only(null) : null;
            });
            return ((r.displayName = `${e}.SlotClone`), r);
          })(e),
          t = a.forwardRef((e, t) => {
            let { children: n, ...s } = e;
            d(n) && "function" == typeof i && (n = i(n._payload));
            let o = a.Children.toArray(n),
              u = o.find(p);
            if (u) {
              let e = u.props.children,
                n = o.map((r) =>
                  r !== u
                    ? r
                    : a.Children.count(e) > 1
                      ? a.Children.only(null)
                      : a.isValidElement(e)
                        ? e.props.children
                        : null,
                );
              return (0, l.jsx)(r, {
                ...s,
                ref: t,
                children: a.isValidElement(e) ? a.cloneElement(e, void 0, n) : null,
              });
            }
            return (0, l.jsx)(r, { ...s, ref: t, children: n });
          });
        return ((t.displayName = `${e}.Slot`), t);
      }
      var c = u("Slot"),
        f = Symbol("radix.slottable");
      function p(e) {
        return (
          a.isValidElement(e) &&
          "function" == typeof e.type &&
          "__radixId" in e.type &&
          e.type.__radixId === f
        );
      }
    },
    32894: (e, r, t) => {
      "use strict";
      t.d(r, { b: () => i });
      var n = t(12115);
      t(47650);
      var a = t(32467),
        s = t(95155),
        l = [
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
        ].reduce((e, r) => {
          let t = (0, a.TL)(`Primitive.${r}`),
            l = n.forwardRef((e, n) => {
              let { asChild: a, ...l } = e;
              return (
                "undefined" != typeof window && (window[Symbol.for("radix-ui")] = !0),
                (0, s.jsx)(a ? t : r, { ...l, ref: n })
              );
            });
          return ((l.displayName = `Primitive.${r}`), { ...e, [r]: l });
        }, {}),
        o = n.forwardRef((e, r) =>
          (0, s.jsx)(l.label, {
            ...e,
            ref: r,
            onMouseDown: (r) => {
              var t;
              r.target.closest("button, input, select, textarea") ||
                (null == (t = e.onMouseDown) || t.call(e, r),
                !r.defaultPrevented && r.detail > 1 && r.preventDefault());
            },
          }),
        );
      o.displayName = "Label";
      var i = o;
    },
    35299: (e, r, t) => {
      "use strict";
      t.d(r, { A: () => n });
      let n = (0, t(5121).A)("loader-circle", [
        ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
      ]);
    },
    56154: (e, r, t) => {
      "use strict";
      t.d(r, { A: () => n });
      let n = (0, t(5121).A)("zap", [
        [
          "path",
          {
            d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
            key: "1xq2db",
          },
        ],
      ]);
    },
    64269: (e, r, t) => {
      "use strict";
      t.d(r, { cn: () => s });
      var n = t(2821),
        a = t(75889);
      function s() {
        for (var e = arguments.length, r = Array(e), t = 0; t < e; t++) r[t] = arguments[t];
        return (0, a.QP)((0, n.$)(r));
      }
    },
    65142: (e, r, t) => {
      "use strict";
      t.d(r, { p: () => l });
      var n = t(95155),
        a = t(12115),
        s = t(64269);
      let l = a.forwardRef((e, r) => {
        let { className: t, type: a, ...l } = e;
        return (0, n.jsx)("input", {
          type: a,
          className: (0, s.cn)(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            t,
          ),
          ref: r,
          ...l,
        });
      });
      l.displayName = "Input";
    },
    69046: (e, r, t) => {
      "use strict";
      t.d(r, { ResetPasswordForm: () => m });
      var n = t(95155),
        a = t(52619),
        s = t.n(a),
        l = t(20063),
        o = t(12115),
        i = t(56154),
        d = t(35299),
        u = t(3998),
        c = t(65142),
        f = t(76444),
        p = t(18720);
      function m() {
        let e = (0, l.useRouter)(),
          r = (0, l.useSearchParams)(),
          [t, a] = (0, o.useState)(""),
          [m, b] = (0, o.useState)(!1),
          h = async (n) => {
            n.preventDefault();
            let a = r.get("token");
            if (!a) return void p.oR.error("Invalid or expired reset link");
            if (t.length < 8) return void p.oR.error("Password must be at least 8 characters");
            b(!0);
            let s = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: a, password: t }),
              }),
              l = await s.json().catch(() => ({}));
            (b(!1),
              s.ok
                ? (p.oR.success("Password updated — you can sign in now."), e.replace("/login"))
                : p.oR.error("string" == typeof l.error ? l.error : "Could not reset password"));
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
                    children: "Set a new password",
                  }),
                  (0, n.jsxs)("form", {
                    onSubmit: h,
                    className: "mt-6 space-y-4",
                    children: [
                      (0, n.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          (0, n.jsx)(f.J, { htmlFor: "password", children: "New password" }),
                          (0, n.jsx)(c.p, {
                            className: "rounded",
                            id: "password",
                            type: "password",
                            required: !0,
                            minLength: 8,
                            value: t,
                            onChange: (e) => a(e.target.value),
                          }),
                        ],
                      }),
                      (0, n.jsx)(u.$, {
                        type: "submit",
                        disabled: m,
                        className:
                          "w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand font-semibold",
                        children: m
                          ? (0, n.jsx)(d.A, { className: "h-4 w-4 animate-spin" })
                          : "Update password",
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
    76444: (e, r, t) => {
      "use strict";
      t.d(r, { J: () => d });
      var n = t(95155),
        a = t(12115),
        s = t(32894),
        l = t(83101),
        o = t(64269);
      let i = (0, l.F)(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        ),
        d = a.forwardRef((e, r) => {
          let { className: t, ...a } = e;
          return (0, n.jsx)(s.b, { ref: r, className: (0, o.cn)(i(), t), ...a });
        });
      d.displayName = s.b.displayName;
    },
    83101: (e, r, t) => {
      "use strict";
      t.d(r, { F: () => l });
      var n = t(2821);
      let a = (e) => ("boolean" == typeof e ? `${e}` : 0 === e ? "0" : e),
        s = n.$,
        l = (e, r) => (t) => {
          var n;
          if ((null == r ? void 0 : r.variants) == null)
            return s(e, null == t ? void 0 : t.class, null == t ? void 0 : t.className);
          let { variants: l, defaultVariants: o } = r,
            i = Object.keys(l).map((e) => {
              let r = null == t ? void 0 : t[e],
                n = null == o ? void 0 : o[e];
              if (null === r) return null;
              let s = a(r) || a(n);
              return l[e][s];
            }),
            d =
              t &&
              Object.entries(t).reduce((e, r) => {
                let [t, n] = r;
                return (void 0 === n || (e[t] = n), e);
              }, {});
          return s(
            e,
            i,
            null == r || null == (n = r.compoundVariants)
              ? void 0
              : n.reduce((e, r) => {
                  let { class: t, className: n, ...a } = r;
                  return Object.entries(a).every((e) => {
                    let [r, t] = e;
                    return Array.isArray(t)
                      ? t.includes({ ...o, ...d }[r])
                      : { ...o, ...d }[r] === t;
                  })
                    ? [...e, t, n]
                    : e;
                }, []),
            null == t ? void 0 : t.class,
            null == t ? void 0 : t.className,
          );
        };
    },
    94446: (e, r, t) => {
      "use strict";
      t.d(r, { s: () => l, t: () => s });
      var n = t(12115);
      function a(e, r) {
        if ("function" == typeof e) return e(r);
        null != e && (e.current = r);
      }
      function s(...e) {
        return (r) => {
          let t = !1,
            n = e.map((e) => {
              let n = a(e, r);
              return (t || "function" != typeof n || (t = !0), n);
            });
          if (t)
            return () => {
              for (let r = 0; r < n.length; r++) {
                let t = n[r];
                "function" == typeof t ? t() : a(e[r], null);
              }
            };
        };
      }
      function l(...e) {
        return n.useCallback(s(...e), e);
      }
    },
  },
  (e) => {
    (e.O(0, [8909, 2619, 8720, 8441, 1255, 7358], () => e((e.s = 22440))), (_N_E = e.O()));
  },
]);
