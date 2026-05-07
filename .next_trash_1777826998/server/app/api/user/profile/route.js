(() => {
  var a = {};
  ((a.id = 397),
    (a.ids = [397]),
    (a.modules = {
      261: (a) => {
        "use strict";
        a.exports = require("next/dist/shared/lib/router/utils/app-paths");
      },
      3295: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");
      },
      10846: (a) => {
        "use strict";
        a.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js");
      },
      19121: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/action-async-storage.external.js");
      },
      29294: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/work-async-storage.external.js");
      },
      44870: (a) => {
        "use strict";
        a.exports = require("next/dist/compiled/next-server/app-route.runtime.prod.js");
      },
      55511: (a) => {
        "use strict";
        a.exports = require("crypto");
      },
      55738: (a, b, c) => {
        "use strict";
        (c.r(b),
          c.d(b, {
            handler: () => H,
            patchFetch: () => G,
            routeModule: () => C,
            serverHooks: () => F,
            workAsyncStorage: () => D,
            workUnitAsyncStorage: () => E,
          }));
        var d = {};
        (c.r(d), c.d(d, { GET: () => z, PATCH: () => B }));
        var e = c(95736),
          f = c(9117),
          g = c(4044),
          h = c(39326),
          i = c(32324),
          j = c(261),
          k = c(54290),
          l = c(85328),
          m = c(38928),
          n = c(46595),
          o = c(3421),
          p = c(17679),
          q = c(41681),
          r = c(63446),
          s = c(86439),
          t = c(51356),
          u = c(10641),
          v = c(45711),
          w = c(60524),
          x = c(72977),
          y = c(77492);
        async function z() {
          let a = await (0, w.j2)();
          if (!a?.user?.id) return u.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          try {
            await (0, x.I)();
          } catch (b) {
            let a = b instanceof Error ? b.message : "Database unavailable";
            return u.NextResponse.json({ error: a }, { status: 503 });
          }
          let b = await y.F.findById(a.user.id).lean().exec();
          return b
            ? u.NextResponse.json({
                email: b.email ?? "",
                full_name: b.fullName ?? "",
                organization: b.organization ?? "",
              })
            : u.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        let A = v.Ik({
          full_name: v.Yj().trim().max(100).optional(),
          organization: v.Yj().trim().max(100).optional(),
        });
        async function B(a) {
          let b,
            c = await (0, w.j2)();
          if (!c?.user?.id) return u.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          try {
            b = await a.json();
          } catch {
            return u.NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
          }
          let d = A.safeParse(b);
          if (!d.success)
            return u.NextResponse.json({ error: d.error.flatten().fieldErrors }, { status: 400 });
          try {
            await (0, x.I)();
          } catch (b) {
            let a = b instanceof Error ? b.message : "Database unavailable";
            return u.NextResponse.json({ error: a }, { status: 503 });
          }
          let e = {};
          return (
            void 0 !== d.data.full_name && (e.fullName = d.data.full_name),
            void 0 !== d.data.organization && (e.organization = d.data.organization),
            await y.F.updateOne({ _id: c.user.id }, { $set: e }),
            u.NextResponse.json({ ok: !0 })
          );
        }
        let C = new e.AppRouteRouteModule({
            definition: {
              kind: f.RouteKind.APP_ROUTE,
              page: "/api/user/profile/route",
              pathname: "/api/user/profile",
              filename: "route",
              bundlePath: "app/api/user/profile/route",
            },
            distDir: ".next",
            relativeProjectDir: "",
            resolvedPagePath:
              "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/app/api/user/profile/route.ts",
            nextConfigOutput: "",
            userland: d,
          }),
          { workAsyncStorage: D, workUnitAsyncStorage: E, serverHooks: F } = C;
        function G() {
          return (0, g.patchFetch)({ workAsyncStorage: D, workUnitAsyncStorage: E });
        }
        async function H(a, b, c) {
          var d;
          let e = "/api/user/profile/route";
          "/index" === e && (e = "/");
          let g = await C.prepare(a, b, { srcPage: e, multiZoneDraftMode: !1 });
          if (!g)
            return (
              (b.statusCode = 400),
              b.end("Bad Request"),
              null == c.waitUntil || c.waitUntil.call(c, Promise.resolve()),
              null
            );
          let {
              buildId: u,
              params: v,
              nextConfig: w,
              isDraftMode: x,
              prerenderManifest: y,
              routerServerContext: z,
              isOnDemandRevalidate: A,
              revalidateOnlyGenerated: B,
              resolvedPathname: D,
            } = g,
            E = (0, j.normalizeAppPath)(e),
            F = !!(y.dynamicRoutes[E] || y.routes[D]);
          if (F && !x) {
            let a = !!y.routes[D],
              b = y.dynamicRoutes[E];
            if (b && !1 === b.fallback && !a) throw new s.NoFallbackError();
          }
          let G = null;
          !F || C.isDev || x || (G = "/index" === (G = D) ? "/" : G);
          let H = !0 === C.isDev || !F,
            I = F && !H,
            J = a.method || "GET",
            K = (0, i.getTracer)(),
            L = K.getActiveScopeSpan(),
            M = {
              params: v,
              prerenderManifest: y,
              renderOpts: {
                experimental: {
                  cacheComponents: !!w.experimental.cacheComponents,
                  authInterrupts: !!w.experimental.authInterrupts,
                },
                supportsDynamicResponse: H,
                incrementalCache: (0, h.getRequestMeta)(a, "incrementalCache"),
                cacheLifeProfiles: null == (d = w.experimental) ? void 0 : d.cacheLife,
                isRevalidate: I,
                waitUntil: c.waitUntil,
                onClose: (a) => {
                  b.on("close", a);
                },
                onAfterTaskError: void 0,
                onInstrumentationRequestError: (b, c, d) => C.onRequestError(a, b, d, z),
              },
              sharedContext: { buildId: u },
            },
            N = new k.NodeNextRequest(a),
            O = new k.NodeNextResponse(b),
            P = l.NextRequestAdapter.fromNodeNextRequest(N, (0, l.signalFromNodeResponse)(b));
          try {
            let d = async (c) =>
                C.handle(P, M).finally(() => {
                  if (!c) return;
                  c.setAttributes({ "http.status_code": b.statusCode, "next.rsc": !1 });
                  let d = K.getRootSpanAttributes();
                  if (!d) return;
                  if (d.get("next.span_type") !== m.BaseServerSpan.handleRequest)
                    return void console.warn(
                      `Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`,
                    );
                  let e = d.get("next.route");
                  if (e) {
                    let a = `${J} ${e}`;
                    (c.setAttributes({ "next.route": e, "http.route": e, "next.span_name": a }),
                      c.updateName(a));
                  } else c.updateName(`${J} ${a.url}`);
                }),
              g = async (g) => {
                var i, j;
                let k = async ({ previousCacheEntry: f }) => {
                    try {
                      if (!(0, h.getRequestMeta)(a, "minimalMode") && A && B && !f)
                        return (
                          (b.statusCode = 404),
                          b.setHeader("x-nextjs-cache", "REVALIDATED"),
                          b.end("This page could not be found"),
                          null
                        );
                      let e = await d(g);
                      a.fetchMetrics = M.renderOpts.fetchMetrics;
                      let i = M.renderOpts.pendingWaitUntil;
                      i && c.waitUntil && (c.waitUntil(i), (i = void 0));
                      let j = M.renderOpts.collectedTags;
                      if (!F) return (await (0, o.I)(N, O, e, M.renderOpts.pendingWaitUntil), null);
                      {
                        let a = await e.blob(),
                          b = (0, p.toNodeOutgoingHttpHeaders)(e.headers);
                        (j && (b[r.NEXT_CACHE_TAGS_HEADER] = j),
                          !b["content-type"] && a.type && (b["content-type"] = a.type));
                        let c =
                            void 0 !== M.renderOpts.collectedRevalidate &&
                            !(M.renderOpts.collectedRevalidate >= r.INFINITE_CACHE) &&
                            M.renderOpts.collectedRevalidate,
                          d =
                            void 0 === M.renderOpts.collectedExpire ||
                            M.renderOpts.collectedExpire >= r.INFINITE_CACHE
                              ? void 0
                              : M.renderOpts.collectedExpire;
                        return {
                          value: {
                            kind: t.CachedRouteKind.APP_ROUTE,
                            status: e.status,
                            body: Buffer.from(await a.arrayBuffer()),
                            headers: b,
                          },
                          cacheControl: { revalidate: c, expire: d },
                        };
                      }
                    } catch (b) {
                      throw (
                        (null == f ? void 0 : f.isStale) &&
                          (await C.onRequestError(
                            a,
                            b,
                            {
                              routerKind: "App Router",
                              routePath: e,
                              routeType: "route",
                              revalidateReason: (0, n.c)({
                                isRevalidate: I,
                                isOnDemandRevalidate: A,
                              }),
                            },
                            z,
                          )),
                        b
                      );
                    }
                  },
                  l = await C.handleResponse({
                    req: a,
                    nextConfig: w,
                    cacheKey: G,
                    routeKind: f.RouteKind.APP_ROUTE,
                    isFallback: !1,
                    prerenderManifest: y,
                    isRoutePPREnabled: !1,
                    isOnDemandRevalidate: A,
                    revalidateOnlyGenerated: B,
                    responseGenerator: k,
                    waitUntil: c.waitUntil,
                  });
                if (!F) return null;
                if (
                  (null == l || null == (i = l.value) ? void 0 : i.kind) !==
                  t.CachedRouteKind.APP_ROUTE
                )
                  throw Object.defineProperty(
                    Error(
                      `Invariant: app-route received invalid cache entry ${null == l || null == (j = l.value) ? void 0 : j.kind}`,
                    ),
                    "__NEXT_ERROR_CODE",
                    { value: "E701", enumerable: !1, configurable: !0 },
                  );
                ((0, h.getRequestMeta)(a, "minimalMode") ||
                  b.setHeader(
                    "x-nextjs-cache",
                    A ? "REVALIDATED" : l.isMiss ? "MISS" : l.isStale ? "STALE" : "HIT",
                  ),
                  x &&
                    b.setHeader(
                      "Cache-Control",
                      "private, no-cache, no-store, max-age=0, must-revalidate",
                    ));
                let m = (0, p.fromNodeOutgoingHttpHeaders)(l.value.headers);
                return (
                  ((0, h.getRequestMeta)(a, "minimalMode") && F) ||
                    m.delete(r.NEXT_CACHE_TAGS_HEADER),
                  !l.cacheControl ||
                    b.getHeader("Cache-Control") ||
                    m.get("Cache-Control") ||
                    m.set("Cache-Control", (0, q.getCacheControlHeader)(l.cacheControl)),
                  await (0, o.I)(
                    N,
                    O,
                    new Response(l.value.body, { headers: m, status: l.value.status || 200 }),
                  ),
                  null
                );
              };
            L
              ? await g(L)
              : await K.withPropagatedContext(a.headers, () =>
                  K.trace(
                    m.BaseServerSpan.handleRequest,
                    {
                      spanName: `${J} ${a.url}`,
                      kind: i.SpanKind.SERVER,
                      attributes: { "http.method": J, "http.target": a.url },
                    },
                    g,
                  ),
                );
          } catch (b) {
            if (
              (b instanceof s.NoFallbackError ||
                (await C.onRequestError(a, b, {
                  routerKind: "App Router",
                  routePath: E,
                  routeType: "route",
                  revalidateReason: (0, n.c)({ isRevalidate: I, isOnDemandRevalidate: A }),
                })),
              F)
            )
              throw b;
            return (await (0, o.I)(N, O, new Response(null, { status: 500 })), null);
          }
        }
      },
      56037: (a) => {
        "use strict";
        a.exports = require("mongoose");
      },
      60524: (a, b, c) => {
        "use strict";
        c.d(b, { j2: () => k, Y9: () => j });
        var d = c(13062),
          e = c(14838),
          f = c(7028),
          g = c(72977),
          h = c(77492);
        let i = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
        (!i || i.length < 16) &&
          console.warn(
            "[auth] Set AUTH_SECRET (or NEXTAUTH_SECRET) in .env — at least 16 characters. Generate: openssl rand -base64 32. Without it, sessions break after restarts and you may see JWTSessionError / no matching decryption secret on old cookies.",
          );
        let {
          handlers: j,
          auth: k,
          signIn: l,
          signOut: m,
        } = (0, d.Ay)({
          trustHost: !0,
          secret: i,
          session: { strategy: "jwt", maxAge: 2592e3 },
          pages: { signIn: "/login" },
          providers: [
            (0, e.A)({
              name: "credentials",
              credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
              },
              async authorize(a) {
                let b = a?.email,
                  c = a?.password;
                if (!b?.trim() || !c) return null;
                await (0, g.I)();
                let d = await h.F.findOne({ email: b.trim().toLowerCase() }).lean();
                return d?.passwordHash && (await f.Ay.compare(c, d.passwordHash))
                  ? {
                      id: d._id.toString(),
                      email: d.email,
                      name: d.fullName || void 0,
                      full_name: d.fullName ?? null,
                      organization: d.organization ?? null,
                    }
                  : null;
              },
            }),
          ],
          callbacks: {
            jwt: async ({ token: a, user: b }) => (
              b &&
                ((a.sub = b.id),
                (a.email = b.email),
                (a.name = b.name),
                (a.full_name = b.full_name ?? null),
                (a.organization = b.organization ?? null)),
              a
            ),
            session: async ({ session: a, token: b }) => (
              a.user &&
                b.sub &&
                ((a.user.id = b.sub),
                (a.user.email = b.email ?? a.user.email),
                (a.user.name = b.name ?? a.user.name),
                (a.user.full_name = b.full_name ?? null),
                (a.user.organization = b.organization ?? null)),
              a
            ),
          },
        });
      },
      63033: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");
      },
      72977: (a, b, c) => {
        "use strict";
        c.d(b, { J: () => h, I: () => i });
        var d = c(56037),
          e = c.n(d);
        let f = process.env.MONGODB_URI,
          g = null;
        async function h() {
          return f ? g || (g = await e().connect(f)) : null;
        }
        async function i() {
          if (!f)
            throw Error("MONGODB_URI is not set. Add it to .env for authentication and profiles.");
          let a = await h();
          if (!a) throw Error("MongoDB connection failed.");
          return a;
        }
      },
      77492: (a, b, c) => {
        "use strict";
        c.d(b, { F: () => g });
        var d = c(56037),
          e = c.n(d);
        let f = new d.Schema(
            {
              email: { type: String, required: !0, unique: !0, lowercase: !0, trim: !0, index: !0 },
              passwordHash: { type: String, required: !0 },
              fullName: { type: String, default: "" },
              organization: { type: String, default: "" },
              agencyId: { type: String, default: null, sparse: !0, index: !0 },
              resetPasswordToken: { type: String, default: null },
              resetPasswordExpires: { type: Date, default: null },
            },
            { timestamps: !0, versionKey: !1 },
          ),
          g = e().models.User ?? e().model("User", f);
      },
      78335: () => {},
      86439: (a) => {
        "use strict";
        a.exports = require("next/dist/shared/lib/no-fallback-error.external");
      },
      96487: () => {},
    }));
  var b = require("../../../../webpack-runtime.js");
  b.C(a);
  var c = b.X(0, [331, 692, 28, 271, 711], () => b((b.s = 55738)));
  module.exports = c;
})();
