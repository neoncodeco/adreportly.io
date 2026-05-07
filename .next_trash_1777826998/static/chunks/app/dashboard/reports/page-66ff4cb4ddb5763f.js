(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [5589],
  {
    3998: (e, a, s) => {
      "use strict";
      s.d(a, { $: () => o });
      var t = s(95155),
        r = s(12115),
        l = s(32467),
        i = s(83101),
        n = s(64269);
      let d = (0, i.F)(
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
        o = r.forwardRef((e, a) => {
          let { className: s, variant: r, size: i, asChild: o = !1, ...c } = e,
            m = o ? l.DX : "button";
          return (0, t.jsx)(m, {
            className: (0, n.cn)(d({ variant: r, size: i, className: s })),
            ref: a,
            ...c,
          });
        });
      o.displayName = "Button";
    },
    11921: (e, a, s) => {
      "use strict";
      s.d(a, { ReportsPage: () => A });
      var t = s(95155),
        r = s(12115),
        l = s(9924),
        i = s(89715),
        n = s(39867),
        d = s(17181),
        o = s(4788),
        c = s(3998),
        m = s(65142),
        u = s(76444),
        p = s(48786),
        x = s(24033),
        h = s(12108),
        f = s(5917),
        g = s(64269);
      let b = p.bL;
      p.YJ;
      let v = p.WT,
        y = r.forwardRef((e, a) => {
          let { className: s, children: r, ...l } = e;
          return (0, t.jsxs)(p.l9, {
            ref: a,
            className: (0, g.cn)(
              "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
              s,
            ),
            ...l,
            children: [
              r,
              (0, t.jsx)(p.In, {
                asChild: !0,
                children: (0, t.jsx)(x.A, { className: "h-4 w-4 opacity-50" }),
              }),
            ],
          });
        });
      y.displayName = p.l9.displayName;
      let j = r.forwardRef((e, a) => {
        let { className: s, ...r } = e;
        return (0, t.jsx)(p.PP, {
          ref: a,
          className: (0, g.cn)("flex cursor-default items-center justify-center py-1", s),
          ...r,
          children: (0, t.jsx)(h.A, { className: "h-4 w-4" }),
        });
      });
      j.displayName = p.PP.displayName;
      let N = r.forwardRef((e, a) => {
        let { className: s, ...r } = e;
        return (0, t.jsx)(p.wn, {
          ref: a,
          className: (0, g.cn)("flex cursor-default items-center justify-center py-1", s),
          ...r,
          children: (0, t.jsx)(x.A, { className: "h-4 w-4" }),
        });
      });
      N.displayName = p.wn.displayName;
      let w = r.forwardRef((e, a) => {
        let { className: s, children: r, position: l = "popper", ...i } = e;
        return (0, t.jsx)(p.ZL, {
          children: (0, t.jsxs)(p.UC, {
            ref: a,
            className: (0, g.cn)(
              "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
              "popper" === l &&
                "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
              s,
            ),
            position: l,
            ...i,
            children: [
              (0, t.jsx)(j, {}),
              (0, t.jsx)(p.LM, {
                className: (0, g.cn)(
                  "p-1",
                  "popper" === l &&
                    "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
                ),
                children: r,
              }),
              (0, t.jsx)(N, {}),
            ],
          }),
        });
      });
      ((w.displayName = p.UC.displayName),
        (r.forwardRef((e, a) => {
          let { className: s, ...r } = e;
          return (0, t.jsx)(p.JU, {
            ref: a,
            className: (0, g.cn)("px-2 py-1.5 text-sm font-semibold", s),
            ...r,
          });
        }).displayName = p.JU.displayName));
      let C = r.forwardRef((e, a) => {
        let { className: s, children: r, ...l } = e;
        return (0, t.jsxs)(p.q7, {
          ref: a,
          className: (0, g.cn)(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            s,
          ),
          ...l,
          children: [
            (0, t.jsx)("span", {
              className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
              children: (0, t.jsx)(p.VF, { children: (0, t.jsx)(f.A, { className: "h-4 w-4" }) }),
            }),
            (0, t.jsx)(p.p4, { children: r }),
          ],
        });
      });
      ((C.displayName = p.q7.displayName),
        (r.forwardRef((e, a) => {
          let { className: s, ...r } = e;
          return (0, t.jsx)(p.wv, {
            ref: a,
            className: (0, g.cn)("-mx-1 my-1 h-px bg-muted", s),
            ...r,
          });
        }).displayName = p.wv.displayName));
      var k = s(18720),
        R = s(30926);
      let S = (0, R.createServerReference)(
        "4089769ceb7d2f953e8a02f7627779fc39242c274a",
        R.callServer,
        void 0,
        R.findSourceMapURL,
        "createShareLinkAction",
      );
      function A() {
        let [e, a] = (0, r.useState)([]),
          [s, p] = (0, r.useState)(""),
          [x, h] = (0, r.useState)(""),
          [f, g] = (0, r.useState)(30),
          [j, N] = (0, r.useState)(!1),
          R = (0, r.useCallback)(async () => {
            try {
              var e, s;
              let t = await fetch("/api/dashboard/overview", { credentials: "include" }),
                r = await t.json(),
                l = (
                  (null == (e = r.campaigns) ? void 0 : e.length)
                    ? r.campaigns
                    : null != (s = r.recentCampaigns)
                      ? s
                      : []
                ).map((e) => ({ id: e.id, name: e.name }));
              (a(l),
                p((e) => {
                  var a, s;
                  return e || (null != (s = null == (a = l[0]) ? void 0 : a.id) ? s : "");
                }));
            } catch (e) {
              a([]);
            }
          }, []);
        return (
          (0, r.useEffect)(() => {
            R();
          }, [R]),
          (0, t.jsxs)(l.P.div, {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.35 },
            className: "space-y-5",
            children: [
              (0, t.jsxs)("div", {
                children: [
                  (0, t.jsx)("h1", {
                    className: "text-xl font-bold sm:text-2xl",
                    children: "Reports",
                  }),
                  (0, t.jsx)("p", {
                    className: "text-xs text-muted-foreground sm:text-sm",
                    children:
                      "PDF/CSV export is planned; share links use live Meta campaign ids from your account.",
                  }),
                ],
              }),
              (0, t.jsxs)("div", {
                className: "grid gap-5 lg:grid-cols-2",
                children: [
                  (0, t.jsxs)("div", {
                    className:
                      "relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6",
                    children: [
                      (0, t.jsx)("div", {
                        className:
                          "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl",
                      }),
                      (0, t.jsxs)("div", {
                        className: "relative flex items-center gap-3",
                        children: [
                          (0, t.jsx)("span", {
                            className:
                              "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow",
                            children: (0, t.jsx)(i.A, { className: "h-5 w-5" }),
                          }),
                          (0, t.jsxs)("div", {
                            children: [
                              (0, t.jsx)("h3", {
                                className: "text-base font-bold sm:text-lg",
                                children: "Generate Report",
                              }),
                              (0, t.jsx)("p", {
                                className: "text-xs text-muted-foreground",
                                children: "PDF or CSV (coming soon)",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, t.jsxs)("div", {
                        className: "relative mt-5 space-y-4",
                        children: [
                          (0, t.jsx)("p", {
                            className: "text-sm text-muted-foreground",
                            children:
                              "Use Meta Ads Manager or add an export job later. Buttons stay disabled until wired.",
                          }),
                          (0, t.jsxs)("div", {
                            className: "grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2",
                            children: [
                              (0, t.jsxs)(c.$, {
                                type: "button",
                                disabled: !0,
                                title: "Not implemented yet",
                                className:
                                  "h-11 rounded-full bg-foreground text-background opacity-60",
                                children: [(0, t.jsx)(n.A, { className: "mr-2 h-4 w-4" }), " PDF"],
                              }),
                              (0, t.jsxs)(c.$, {
                                type: "button",
                                disabled: !0,
                                title: "Not implemented yet",
                                variant: "outline",
                                className: "h-11 rounded-full opacity-60",
                                children: [(0, t.jsx)(n.A, { className: "mr-2 h-4 w-4" }), " CSV"],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, t.jsxs)("div", {
                    className:
                      "relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6",
                    children: [
                      (0, t.jsx)("div", {
                        className:
                          "pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-success/10 blur-3xl",
                      }),
                      (0, t.jsxs)("div", {
                        className: "relative flex items-center gap-3",
                        children: [
                          (0, t.jsx)("span", {
                            className:
                              "flex h-11 w-11 items-center justify-center rounded-2xl bg-success/15 text-success",
                            children: (0, t.jsx)(d.A, { className: "h-5 w-5" }),
                          }),
                          (0, t.jsxs)("div", {
                            children: [
                              (0, t.jsx)("h3", {
                                className: "text-base font-bold sm:text-lg",
                                children: "Shareable Link",
                              }),
                              (0, t.jsx)("p", {
                                className: "text-xs text-muted-foreground",
                                children: "Client opens read-only metrics (no login)",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, t.jsxs)("div", {
                        className: "relative mt-5 space-y-4",
                        children: [
                          (0, t.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              (0, t.jsx)(u.J, { children: "Campaign" }),
                              (0, t.jsxs)(b, {
                                value: s || void 0,
                                onValueChange: p,
                                disabled: 0 === e.length,
                                children: [
                                  (0, t.jsx)(y, {
                                    className: "h-11 rounded-xl",
                                    children: (0, t.jsx)(v, {
                                      placeholder: e.length
                                        ? "Select campaign"
                                        : "No campaigns (connect Meta)",
                                    }),
                                  }),
                                  (0, t.jsx)(w, {
                                    children: e.map((e) =>
                                      (0, t.jsx)(C, { value: e.id, children: e.name }, e.id),
                                    ),
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              (0, t.jsx)(u.J, { htmlFor: "share-email", children: "Client email" }),
                              (0, t.jsx)(m.p, {
                                id: "share-email",
                                type: "email",
                                placeholder: "client@company.com",
                                value: x,
                                onChange: (e) => h(e.target.value),
                                className: "h-11 rounded-xl",
                              }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className: "space-y-1.5",
                            children: [
                              (0, t.jsx)(u.J, { htmlFor: "exp", children: "Expires in (days)" }),
                              (0, t.jsx)(m.p, {
                                id: "exp",
                                type: "number",
                                value: f,
                                min: 1,
                                max: 365,
                                onChange: (e) =>
                                  g(Math.min(365, Math.max(1, Number(e.target.value) || 30))),
                                className: "h-11 rounded-xl",
                              }),
                            ],
                          }),
                          (0, t.jsxs)(c.$, {
                            type: "button",
                            disabled: j || !s || !x.trim(),
                            className:
                              "h-11 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-50",
                            onClick: async () => {
                              N(!0);
                              let e = await S({
                                campaignId: s,
                                clientEmail: x.trim(),
                                expiryDays: f,
                              });
                              if ((N(!1), e.ok)) {
                                try {
                                  await navigator.clipboard.writeText(e.shareUrl);
                                } catch (e) {}
                                k.oR.success("Share link created and copied", {
                                  description: e.shareUrl,
                                });
                              } else k.oR.error(e.error);
                            },
                            children: [
                              (0, t.jsx)(o.A, { className: "mr-2 h-4 w-4" }),
                              " Create link",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }
    },
    43412: (e, a, s) => {
      Promise.resolve().then(s.bind(s, 11921));
    },
    64269: (e, a, s) => {
      "use strict";
      s.d(a, { cn: () => l });
      var t = s(2821),
        r = s(75889);
      function l() {
        for (var e = arguments.length, a = Array(e), s = 0; s < e; s++) a[s] = arguments[s];
        return (0, r.QP)((0, t.$)(a));
      }
    },
    65142: (e, a, s) => {
      "use strict";
      s.d(a, { p: () => i });
      var t = s(95155),
        r = s(12115),
        l = s(64269);
      let i = r.forwardRef((e, a) => {
        let { className: s, type: r, ...i } = e;
        return (0, t.jsx)("input", {
          type: r,
          className: (0, l.cn)(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            s,
          ),
          ref: a,
          ...i,
        });
      });
      i.displayName = "Input";
    },
    76444: (e, a, s) => {
      "use strict";
      s.d(a, { J: () => o });
      var t = s(95155),
        r = s(12115),
        l = s(32894),
        i = s(83101),
        n = s(64269);
      let d = (0, i.F)(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        ),
        o = r.forwardRef((e, a) => {
          let { className: s, ...r } = e;
          return (0, t.jsx)(l.b, { ref: a, className: (0, n.cn)(d(), s), ...r });
        });
      o.displayName = l.b.displayName;
    },
  },
  (e) => {
    (e.O(0, [8909, 9924, 8720, 3503, 884, 5014, 6109, 8441, 1255, 7358], () => e((e.s = 43412))),
      (_N_E = e.O()));
  },
]);
