((exports.id = 303),
  (exports.ids = [303]),
  (exports.modules = {
    2192: (a, b, c) => {
      Promise.resolve().then(c.t.bind(c, 3991, 23));
    },
    15144: (a, b, c) => {
      "use strict";
      c.d(b, { Providers: () => i });
      var d = c(21124),
        e = c(66635),
        f = c(96610),
        g = c(99400),
        h = c(38301);
      function i({ children: a }) {
        let [b] = (0, h.useState)(() => new e.E());
        return (0, d.jsx)(g.CP, {
          refetchOnWindowFocus: !0,
          children: (0, d.jsx)(f.Ht, { client: b, children: a }),
        });
      }
    },
    16617: (a, b, c) => {
      (Promise.resolve().then(c.t.bind(c, 54160, 23)),
        Promise.resolve().then(c.t.bind(c, 31603, 23)),
        Promise.resolve().then(c.t.bind(c, 68495, 23)),
        Promise.resolve().then(c.t.bind(c, 75170, 23)),
        Promise.resolve().then(c.t.bind(c, 77526, 23)),
        Promise.resolve().then(c.t.bind(c, 78922, 23)),
        Promise.resolve().then(c.t.bind(c, 29234, 23)),
        Promise.resolve().then(c.t.bind(c, 12263, 23)),
        Promise.resolve().then(c.bind(c, 82146)));
    },
    21768: (a, b, c) => {
      "use strict";
      c.d(b, { AuthProvider: () => e });
      var d = c(97954);
      let e = (0, d.registerClientReference)(
        function () {
          throw Error(
            "Attempted to call AuthProvider() from the server but AuthProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
          );
        },
        "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/lib/auth.tsx",
        "AuthProvider",
      );
      (0, d.registerClientReference)(
        function () {
          throw Error(
            "Attempted to call useAuth() from the server but useAuth is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
          );
        },
        "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/lib/auth.tsx",
        "useAuth",
      );
    },
    25825: (a, b, c) => {
      "use strict";
      c.d(b, { Toaster: () => d });
      let d = (0, c(97954).registerClientReference)(
        function () {
          throw Error(
            "Attempted to call Toaster() from the server but Toaster is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
          );
        },
        "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/components/ui/sonner.tsx",
        "Toaster",
      );
    },
    27626: (a, b, c) => {
      "use strict";
      c.d(b, { Providers: () => d });
      let d = (0, c(97954).registerClientReference)(
        function () {
          throw Error(
            "Attempted to call Providers() from the server but Providers is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
          );
        },
        "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/app/providers.tsx",
        "Providers",
      );
    },
    32573: (a, b, c) => {
      "use strict";
      c.d(b, { D: () => h, ThemeProvider: () => g });
      var d = c(21124),
        e = c(38301);
      let f = (0, e.createContext)(null);
      function g({ children: a }) {
        let [b, c] = (0, e.useState)("light");
        return (0, d.jsx)(f.Provider, {
          value: {
            theme: b,
            toggle: () => {
              c((a) => {
                let b = "light" === a ? "dark" : "light";
                return (
                  document.documentElement.classList.toggle("dark", "dark" === b),
                  localStorage.setItem("theme", b),
                  b
                );
              });
            },
          },
          children: a,
        });
      }
      function h() {
        let a = (0, e.useContext)(f);
        return a || { theme: "light", toggle: () => {} };
      }
    },
    35284: (a, b, c) => {
      "use strict";
      c.d(b, { $: () => j });
      var d = c(21124),
        e = c(38301),
        f = c(96425),
        g = c(26691),
        h = c(44943);
      let i = (0, g.F)(
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
        j = e.forwardRef(({ className: a, variant: b, size: c, asChild: e = !1, ...g }, j) => {
          let k = e ? f.DX : "button";
          return (0, d.jsx)(k, {
            className: (0, h.cn)(i({ variant: b, size: c, className: a })),
            ref: j,
            ...g,
          });
        });
      j.displayName = "Button";
    },
    44048: (a, b, c) => {
      Promise.resolve().then(c.t.bind(c, 65169, 23));
    },
    44943: (a, b, c) => {
      "use strict";
      c.d(b, { cn: () => f });
      var d = c(43249),
        e = c(58829);
      function f(...a) {
        return (0, e.QP)((0, d.$)(a));
      }
    },
    48911: (a, b, c) => {
      "use strict";
      c.d(b, { Toaster: () => f });
      var d = c(21124),
        e = c(42830);
      let f = ({ ...a }) =>
        (0, d.jsx)(e.l$, {
          className: "toaster group",
          toastOptions: {
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            },
          },
          ...a,
        });
    },
    51465: (a, b, c) => {
      (Promise.resolve().then(c.t.bind(c, 81170, 23)),
        Promise.resolve().then(c.t.bind(c, 23597, 23)),
        Promise.resolve().then(c.t.bind(c, 36893, 23)),
        Promise.resolve().then(c.t.bind(c, 89748, 23)),
        Promise.resolve().then(c.t.bind(c, 6060, 23)),
        Promise.resolve().then(c.t.bind(c, 7184, 23)),
        Promise.resolve().then(c.t.bind(c, 69576, 23)),
        Promise.resolve().then(c.t.bind(c, 73041, 23)),
        Promise.resolve().then(c.t.bind(c, 51384, 23)));
    },
    51472: (a, b, c) => {
      "use strict";
      (c.r(b), c.d(b, { default: () => k, metadata: () => j }));
      var d = c(75338),
        e = c(25825),
        f = c(21768),
        g = c(52887),
        h = c(27626);
      c(61135);
      let i =
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9e461043-3cf3-4c2e-b0ad-d0915984965b/id-preview-b3aa24a5--b0ebd5f4-f67a-4ade-9c4d-b97522b92343.lovable.app-1777655552849.png",
        j = {
          title: "AdReportly — Real-time Facebook Ads Insights for Agencies",
          description:
            "Track Facebook ad campaigns in real time, generate beautiful PDF/CSV reports, and share secure read-only dashboards with clients. AES-256 encrypted, agency-grade.",
          openGraph: {
            title: "AdReportly — Real-time Facebook Ads Insights for Agencies",
            description: "Real-time Facebook ad analytics with secure shareable client reports.",
            type: "website",
            images: [{ url: i }],
          },
          twitter: {
            card: "summary_large_image",
            title: "AdReportly — Real-time Facebook Ads Insights for Agencies",
            description:
              "AdReportly is a SaaS platform for Facebook Ads analytics, offering real-time ROI tracking and client reporting.",
            images: [i],
          },
        };
      function k({ children: a }) {
        return (0, d.jsxs)("html", {
          lang: "en",
          suppressHydrationWarning: !0,
          children: [
            (0, d.jsx)("head", {
              children: (0, d.jsx)("link", {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
              }),
            }),
            (0, d.jsx)("body", {
              children: (0, d.jsx)(h.Providers, {
                children: (0, d.jsx)(g.ThemeProvider, {
                  children: (0, d.jsxs)(f.AuthProvider, {
                    children: [a, (0, d.jsx)(e.Toaster, {})],
                  }),
                }),
              }),
            }),
          ],
        });
      }
    },
    52887: (a, b, c) => {
      "use strict";
      c.d(b, { ThemeProvider: () => e });
      var d = c(97954);
      let e = (0, d.registerClientReference)(
        function () {
          throw Error(
            "Attempted to call ThemeProvider() from the server but ThemeProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
          );
        },
        "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/lib/theme.tsx",
        "ThemeProvider",
      );
      (0, d.registerClientReference)(
        function () {
          throw Error(
            "Attempted to call useTheme() from the server but useTheme is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.",
          );
        },
        "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/lib/theme.tsx",
        "useTheme",
      );
    },
    59732: (a, b, c) => {
      "use strict";
      (c.r(b), c.d(b, { default: () => g }));
      var d = c(75338),
        e = c(65169),
        f = c.n(e);
      function g() {
        return (0, d.jsx)("div", {
          className: "flex min-h-screen items-center justify-center bg-background px-4",
          children: (0, d.jsxs)("div", {
            className: "max-w-md text-center",
            children: [
              (0, d.jsx)("h1", {
                className: "text-7xl font-bold text-gradient-primary",
                children: "404",
              }),
              (0, d.jsx)("h2", {
                className: "mt-4 text-xl font-semibold text-foreground",
                children: "Page not found",
              }),
              (0, d.jsx)("p", {
                className: "mt-2 text-sm text-muted-foreground",
                children: "The page you're looking for doesn't exist or has been moved.",
              }),
              (0, d.jsx)("div", {
                className: "mt-6",
                children: (0, d.jsx)(f(), {
                  href: "/",
                  className:
                    "inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-95",
                  children: "Go home",
                }),
              }),
            ],
          }),
        });
      }
    },
    61135: () => {},
    73610: (a, b, c) => {
      "use strict";
      c.d(b, { A: () => j, AuthProvider: () => i });
      var d = c(21124),
        e = c(38301),
        f = c(99400),
        g = c(42378);
      let h = (0, e.createContext)(null);
      function i({ children: a }) {
        let b = (0, g.useRouter)(),
          { data: c, status: i, update: j } = (0, f.wV)(),
          k = (0, e.useMemo)(
            () => (c?.user?.id ? { id: c.user.id, email: c.user.email ?? null } : null),
            [c],
          ),
          l = async (a, b) => {
            let c = await (0, f.Jv)("credentials", { email: a.trim(), password: b, redirect: !1 });
            return c?.error
              ? { error: Error("CredentialsSignin" === c.error ? "Invalid credentials" : c.error) }
              : (await j(), { error: null });
          },
          m = async (a, b, c) => {
            let d = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: a,
                  password: b,
                  full_name: c?.full_name ?? "",
                  organization: c?.organization ?? "",
                }),
              }),
              e = await d.json().catch(() => ({}));
            if (!d.ok)
              return {
                error: Error(
                  "string" == typeof e.error
                    ? e.error
                    : 409 === d.status
                      ? "An account with this email already exists"
                      : "Sign up failed",
                ),
              };
            let g = await (0, f.Jv)("credentials", { email: a.trim(), password: b, redirect: !1 });
            return g?.error
              ? { error: Error("Account created but sign-in failed. Please log in manually.") }
              : (await j(), { error: null });
          },
          n = async () => {
            (await (0, f.CI)({ redirect: !1 }), b.push("/login"), b.refresh());
          };
        return (0, d.jsx)(h.Provider, {
          value: {
            user: k,
            session: c,
            loading: "loading" === i,
            signIn: l,
            signUp: m,
            signOut: n,
          },
          children: a,
        });
      }
      function j() {
        let a = (0, e.useContext)(h);
        if (!a) throw Error("useAuth must be used within AuthProvider");
        return a;
      }
    },
    75063: (a, b, c) => {
      (Promise.resolve().then(c.bind(c, 27626)),
        Promise.resolve().then(c.bind(c, 25825)),
        Promise.resolve().then(c.bind(c, 21768)),
        Promise.resolve().then(c.bind(c, 52887)));
    },
    86735: (a, b, c) => {
      (Promise.resolve().then(c.bind(c, 15144)),
        Promise.resolve().then(c.bind(c, 48911)),
        Promise.resolve().then(c.bind(c, 73610)),
        Promise.resolve().then(c.bind(c, 32573)));
    },
    86851: (a, b, c) => {
      "use strict";
      c.d(b, { CG: () => k, Fm: () => q, cj: () => j, h: () => p, kN: () => l, qp: () => r });
      var d = c(21124),
        e = c(38301),
        f = c(6843),
        g = c(26691),
        h = c(47089),
        i = c(44943);
      let j = f.bL,
        k = f.l9,
        l = f.bm,
        m = f.ZL,
        n = e.forwardRef(({ className: a, ...b }, c) =>
          (0, d.jsx)(f.hJ, {
            className: (0, i.cn)(
              "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              a,
            ),
            ...b,
            ref: c,
          }),
        );
      n.displayName = f.hJ.displayName;
      let o = (0, g.F)(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
          {
            variants: {
              side: {
                top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                bottom:
                  "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
                right:
                  "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
              },
            },
            defaultVariants: { side: "right" },
          },
        ),
        p = e.forwardRef(({ side: a = "right", className: b, children: c, ...e }, g) =>
          (0, d.jsxs)(m, {
            children: [
              (0, d.jsx)(n, {}),
              (0, d.jsxs)(f.UC, {
                ref: g,
                className: (0, i.cn)(o({ side: a }), b),
                ...e,
                children: [
                  (0, d.jsxs)(f.bm, {
                    className:
                      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
                    children: [
                      (0, d.jsx)(h.A, { className: "h-4 w-4" }),
                      (0, d.jsx)("span", { className: "sr-only", children: "Close" }),
                    ],
                  }),
                  c,
                ],
              }),
            ],
          }),
        );
      p.displayName = f.UC.displayName;
      let q = ({ className: a, ...b }) =>
        (0, d.jsx)("div", {
          className: (0, i.cn)("flex flex-col space-y-2 text-center sm:text-left", a),
          ...b,
        });
      q.displayName = "SheetHeader";
      let r = e.forwardRef(({ className: a, ...b }, c) =>
        (0, d.jsx)(f.hE, {
          ref: c,
          className: (0, i.cn)("text-lg font-semibold text-foreground", a),
          ...b,
        }),
      );
      ((r.displayName = f.hE.displayName),
        (e.forwardRef(({ className: a, ...b }, c) =>
          (0, d.jsx)(f.VY, {
            ref: c,
            className: (0, i.cn)("text-sm text-muted-foreground", a),
            ...b,
          }),
        ).displayName = f.VY.displayName));
    },
    93758: (a, b, c) => {
      "use strict";
      c.d(b, { p: () => g });
      var d = c(21124),
        e = c(38301),
        f = c(44943);
      let g = e.forwardRef(({ className: a, type: b, ...c }, e) =>
        (0, d.jsx)("input", {
          type: b,
          className: (0, f.cn)(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            a,
          ),
          ref: e,
          ...c,
        }),
      );
      g.displayName = "Input";
    },
  }));
