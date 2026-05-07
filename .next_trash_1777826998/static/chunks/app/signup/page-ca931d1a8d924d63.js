(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [879],
  {
    3998: (e, r, a) => {
      "use strict";
      a.d(r, { $: () => d });
      var s = a(95155),
        t = a(12115),
        n = a(32467),
        i = a(83101),
        l = a(64269);
      let o = (0, i.F)(
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
        d = t.forwardRef((e, r) => {
          let { className: a, variant: t, size: i, asChild: d = !1, ...c } = e,
            u = d ? n.DX : "button";
          return (0, s.jsx)(u, {
            className: (0, l.cn)(o({ variant: t, size: i, className: a })),
            ref: r,
            ...c,
          });
        });
      d.displayName = "Button";
    },
    64269: (e, r, a) => {
      "use strict";
      a.d(r, { cn: () => n });
      var s = a(2821),
        t = a(75889);
      function n() {
        for (var e = arguments.length, r = Array(e), a = 0; a < e; a++) r[a] = arguments[a];
        return (0, t.QP)((0, s.$)(r));
      }
    },
    65142: (e, r, a) => {
      "use strict";
      a.d(r, { p: () => i });
      var s = a(95155),
        t = a(12115),
        n = a(64269);
      let i = t.forwardRef((e, r) => {
        let { className: a, type: t, ...i } = e;
        return (0, s.jsx)("input", {
          type: t,
          className: (0, n.cn)(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            a,
          ),
          ref: r,
          ...i,
        });
      });
      i.displayName = "Input";
    },
    74180: (e, r, a) => {
      "use strict";
      (a.r(r), a.d(r, { default: () => p }));
      var s = a(95155),
        t = a(52619),
        n = a.n(t),
        i = a(20063),
        l = a(12115),
        o = a(22544),
        d = a(56154),
        c = a(35299),
        u = a(73155),
        m = a(76924),
        h = a(3998),
        g = a(65142),
        x = a(76444),
        f = a(18720);
      function p() {
        let { signUp: e, user: r } = (0, m.A)(),
          a = (0, i.useRouter)(),
          [t, p] = (0, l.useState)(!1);
        (0, l.useEffect)(() => {
          r && a.replace("/dashboard");
        }, [r, a]);
        let {
            register: v,
            handleSubmit: b,
            formState: { errors: y },
          } = (0, o.mN)({
            defaultValues: { full_name: "", organization: "", email: "", password: "" },
          }),
          w = async (r) => {
            p(!0);
            let { error: s } = await e(r.email.trim(), r.password, {
              full_name: r.full_name.trim(),
              organization: r.organization.trim(),
            });
            (p(!1),
              s
                ? f.oR.error(s.message || "Sign up failed")
                : (f.oR.success("Account created — welcome aboard!"), a.replace("/dashboard")));
          };
        return (0, s.jsx)("div", {
          className: "flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-12",
          children: (0, s.jsxs)("div", {
            className: "w-full max-w-md",
            children: [
              (0, s.jsxs)(n(), {
                href: "/",
                className: "mb-8 flex items-center justify-center gap-2",
                children: [
                  (0, s.jsx)("span", {
                    className:
                      "flex h-10 w-10 items-center justify-center rounded card-brutal bg-brand text-ink",
                    children: (0, s.jsx)(d.A, { className: "h-4 w-4" }),
                  }),
                  (0, s.jsx)("span", { className: "text-base font-bold", children: "AdReportly" }),
                ],
              }),
              (0, s.jsxs)("div", {
                className: "rounded card-brutal bg-card p-8",
                children: [
                  (0, s.jsx)("h1", {
                    className: "text-2xl font-bold",
                    children: "Create your agency account",
                  }),
                  (0, s.jsx)("p", {
                    className: "mt-1 text-sm text-muted-foreground",
                    children: "Start tracking Facebook ads in seconds",
                  }),
                  (0, s.jsxs)("form", {
                    onSubmit: b(w),
                    className: "mt-6 space-y-4",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "grid gap-4 sm:grid-cols-2",
                        children: [
                          (0, s.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              (0, s.jsx)(x.J, { htmlFor: "full_name", children: "Your name" }),
                              (0, s.jsx)(g.p, {
                                className: "rounded",
                                id: "full_name",
                                placeholder: "Jane Doe",
                                ...v("full_name", {
                                  required: "Enter your name",
                                  minLength: { value: 2, message: "Name is too short" },
                                  maxLength: { value: 100, message: "Name is too long" },
                                }),
                              }),
                              y.full_name &&
                                (0, s.jsx)("p", {
                                  className: "text-xs text-destructive",
                                  children: y.full_name.message,
                                }),
                            ],
                          }),
                          (0, s.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              (0, s.jsx)(x.J, { htmlFor: "organization", children: "Agency" }),
                              (0, s.jsx)(g.p, {
                                className: "rounded",
                                id: "organization",
                                placeholder: "Hive Marketing",
                                ...v("organization", {
                                  required: "Enter your agency",
                                  minLength: { value: 2, message: "Agency name is too short" },
                                  maxLength: { value: 100, message: "Agency name is too long" },
                                }),
                              }),
                              y.organization &&
                                (0, s.jsx)("p", {
                                  className: "text-xs text-destructive",
                                  children: y.organization.message,
                                }),
                            ],
                          }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          (0, s.jsx)(x.J, { htmlFor: "email", children: "Email" }),
                          (0, s.jsx)(g.p, {
                            className: "rounded",
                            id: "email",
                            type: "email",
                            placeholder: "you@agency.com",
                            ...v("email", {
                              required: "Enter your email",
                              maxLength: { value: 255, message: "Email is too long" },
                              pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Enter a valid email",
                              },
                            }),
                          }),
                          y.email &&
                            (0, s.jsx)("p", {
                              className: "text-xs text-destructive",
                              children: y.email.message,
                            }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className: "space-y-1.5",
                        children: [
                          (0, s.jsx)(x.J, { htmlFor: "password", children: "Password" }),
                          (0, s.jsx)(g.p, {
                            className: "rounded",
                            id: "password",
                            type: "password",
                            placeholder: "At least 8 characters",
                            ...v("password", {
                              required: "Choose a password",
                              minLength: { value: 8, message: "Min 8 characters" },
                              maxLength: { value: 72, message: "Password is too long" },
                            }),
                          }),
                          y.password &&
                            (0, s.jsx)("p", {
                              className: "text-xs text-destructive",
                              children: y.password.message,
                            }),
                        ],
                      }),
                      (0, s.jsx)(h.$, {
                        type: "submit",
                        disabled: t,
                        className:
                          "w-full rounded bg-brand text-brand-foreground btn-brutal h-auto py-3 hover:bg-brand font-semibold",
                        children: t
                          ? (0, s.jsx)(c.A, { className: "h-4 w-4 animate-spin" })
                          : "Create account",
                      }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    className: "relative my-6",
                    children: [
                      (0, s.jsx)("div", {
                        className: "absolute inset-0 flex items-center",
                        children: (0, s.jsx)("span", {
                          className: "w-full border-t border-border",
                        }),
                      }),
                      (0, s.jsx)("div", {
                        className: "relative flex justify-center text-xs uppercase tracking-wide",
                        children: (0, s.jsx)("span", {
                          className: "bg-card px-2 text-muted-foreground",
                          children: "Or",
                        }),
                      }),
                    ],
                  }),
                  (0, s.jsx)(h.$, {
                    variant: "outline",
                    className:
                      "w-full rounded border-2 border-[#1877F2]/40 bg-background py-3 font-semibold hover:bg-[#1877F2]/5",
                    asChild: !0,
                    children: (0, s.jsxs)("a", {
                      href: "/api/auth/facebook",
                      children: [
                        (0, s.jsx)(u.A, { className: "mr-2 h-4 w-4 shrink-0 text-[#1877F2]" }),
                        "Continue with Facebook",
                      ],
                    }),
                  }),
                  (0, s.jsxs)("p", {
                    className: "mt-6 text-center text-sm text-muted-foreground",
                    children: [
                      "Already have an account?",
                      " ",
                      (0, s.jsx)(n(), {
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
    76444: (e, r, a) => {
      "use strict";
      a.d(r, { J: () => d });
      var s = a(95155),
        t = a(12115),
        n = a(32894),
        i = a(83101),
        l = a(64269);
      let o = (0, i.F)(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        ),
        d = t.forwardRef((e, r) => {
          let { className: a, ...t } = e;
          return (0, s.jsx)(n.b, { ref: r, className: (0, l.cn)(o(), a), ...t });
        });
      d.displayName = n.b.displayName;
    },
    76924: (e, r, a) => {
      "use strict";
      a.d(r, { A: () => d, AuthProvider: () => o });
      var s = a(95155),
        t = a(12115),
        n = a(96199),
        i = a(20063);
      let l = (0, t.createContext)(null);
      function o(e) {
        let { children: r } = e,
          a = (0, i.useRouter)(),
          { data: o, status: d, update: c } = (0, n.wV)(),
          u = (0, t.useMemo)(() => {
            var e, r;
            return (null == o || null == (e = o.user) ? void 0 : e.id)
              ? { id: o.user.id, email: null != (r = o.user.email) ? r : null }
              : null;
          }, [o]),
          m = async (e, r) => {
            let a = await (0, n.Jv)("credentials", { email: e.trim(), password: r, redirect: !1 });
            return (null == a ? void 0 : a.error)
              ? { error: Error("CredentialsSignin" === a.error ? "Invalid credentials" : a.error) }
              : (await c(), { error: null });
          },
          h = async (e, r, a) => {
            var s, t;
            let i = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: e,
                  password: r,
                  full_name: null != (s = null == a ? void 0 : a.full_name) ? s : "",
                  organization: null != (t = null == a ? void 0 : a.organization) ? t : "",
                }),
              }),
              l = await i.json().catch(() => ({}));
            if (!i.ok)
              return {
                error: Error(
                  "string" == typeof l.error
                    ? l.error
                    : 409 === i.status
                      ? "An account with this email already exists"
                      : "Sign up failed",
                ),
              };
            let o = await (0, n.Jv)("credentials", { email: e.trim(), password: r, redirect: !1 });
            return (null == o ? void 0 : o.error)
              ? { error: Error("Account created but sign-in failed. Please log in manually.") }
              : (await c(), { error: null });
          },
          g = async () => {
            (await (0, n.CI)({ redirect: !1 }), a.push("/login"), a.refresh());
          };
        return (0, s.jsx)(l.Provider, {
          value: {
            user: u,
            session: o,
            loading: "loading" === d,
            signIn: m,
            signUp: h,
            signOut: g,
          },
          children: r,
        });
      }
      function d() {
        let e = (0, t.useContext)(l);
        if (!e) throw Error("useAuth must be used within AuthProvider");
        return e;
      }
    },
    86284: (e, r, a) => {
      Promise.resolve().then(a.bind(a, 74180));
    },
  },
  (e) => {
    (e.O(0, [8909, 2619, 8720, 6856, 2494, 8441, 1255, 7358], () => e((e.s = 86284))),
      (_N_E = e.O()));
  },
]);
