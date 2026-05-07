(() => {
  var a = {};
  ((a.id = 38),
    (a.ids = [38]),
    (a.modules = {
      261: (a) => {
        "use strict";
        a.exports = require("next/dist/shared/lib/router/utils/app-paths");
      },
      3295: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");
      },
      4573: (a) => {
        "use strict";
        a.exports = require("node:buffer");
      },
      10846: (a) => {
        "use strict";
        a.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js");
      },
      16822: (a, b, c) => {
        "use strict";
        c.d(b, { a4: () => p, yD: () => r, TP: () => q });
        var d = c(77598),
          e = c(56037),
          f = c.n(e),
          g = c(72977);
        let h = "aes-256-gcm";
        function i() {
          let a = process.env.ENCRYPTION_KEY;
          if (!a || a.length < 16)
            throw Error(
              "ENCRYPTION_KEY must be set (min 16 characters) for AES-256 token encryption.",
            );
          return (0, d.scryptSync)(a, "adreportly-token-salt", 32);
        }
        let j = new e.Schema(
            {
              agencyId: { type: String, required: !0, unique: !0, index: !0 },
              name: { type: String },
              email: { type: String },
              encryptedToken: { type: String, required: !0 },
              fbUserId: { type: String, unique: !0, sparse: !0 },
              appUserId: { type: String, sparse: !0, index: !0 },
            },
            { versionKey: !1 },
          ),
          k = f().models.Agency ?? f().model("Agency", j);
        var l = c(77492);
        let m = new Map(),
          n = new Map(),
          o = new Map();
        async function p(a) {
          let b = o.get(a);
          if (b) return b;
          if (!process.env.MONGODB_URI || (await (0, g.J)(), !f().Types.ObjectId.isValid(a)))
            return null;
          let c = await l.F.findById(a).select("agencyId").lean().exec(),
            d = c?.agencyId;
          return "string" == typeof d && d.length > 0 ? d : null;
        }
        async function q(a) {
          let b,
            c = (function (a) {
              let b = (0, d.randomBytes)(12),
                c = (0, d.createCipheriv)(h, i(), b),
                e = Buffer.concat([c.update(a, "utf8"), c.final()]),
                f = c.getAuthTag();
              return Buffer.concat([b, f, e]).toString("base64url");
            })(a.accessToken);
          if (process.env.MONGODB_URI) {
            await (0, g.J)();
            let e = await k.findOne({ fbUserId: a.fbUserId }).lean().exec(),
              h = {
                agencyId: (b = e?.agencyId ?? (0, d.randomUUID)()),
                encryptedToken: c,
                fbUserId: a.fbUserId,
                name: a.name,
                email: a.email,
              };
            (a.appUserId && (h.appUserId = a.appUserId),
              await k.findOneAndUpdate(
                { fbUserId: a.fbUserId },
                { $set: h },
                { upsert: !0, new: !0 },
              ),
              a.appUserId &&
                f().Types.ObjectId.isValid(a.appUserId) &&
                (await l.F.findByIdAndUpdate(a.appUserId, { $set: { agencyId: b } }).exec()));
          } else
            ((b = n.get(a.fbUserId) ?? (0, d.randomUUID)()), a.appUserId && o.set(a.appUserId, b));
          let e = {
            agencyId: b,
            encryptedToken: c,
            fbUserId: a.fbUserId,
            name: a.name,
            email: a.email,
          };
          return (m.set(b, e), n.set(a.fbUserId, b), b);
        }
        async function r(a) {
          let b = m.get(a);
          if (!b && process.env.MONGODB_URI) {
            await (0, g.J)();
            let c = await k.findOne({ agencyId: a }).lean().exec();
            c &&
              (b = {
                agencyId: c.agencyId,
                encryptedToken: c.encryptedToken,
                fbUserId: c.fbUserId,
                name: c.name ?? void 0,
                email: c.email ?? void 0,
              });
          }
          if (!b) return null;
          try {
            return (function (a) {
              let b = Buffer.from(a, "base64url"),
                c = b.subarray(0, 12),
                e = b.subarray(12, 28),
                f = b.subarray(28),
                g = (0, d.createDecipheriv)(h, i(), c);
              return (g.setAuthTag(e), Buffer.concat([g.update(f), g.final()]).toString("utf8"));
            })(b.encryptedToken);
          } catch {
            return null;
          }
        }
      },
      19121: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/action-async-storage.external.js");
      },
      29294: (a) => {
        "use strict";
        a.exports = require("next/dist/server/app-render/work-async-storage.external.js");
      },
      32070: (a, b, c) => {
        "use strict";
        c.d(b, { Xe: () => m, Y7: () => l, tg: () => o, d4: () => n, KJ: () => k });
        var d = c(77598),
          e = c(72977),
          f = c(56037),
          g = c.n(f);
        let h = new f.Schema(
            {
              token: { type: String, required: !0, unique: !0, index: !0 },
              campaignId: { type: String, required: !0 },
              agencyId: { type: String, required: !0 },
              clientEmail: { type: String, required: !0 },
              expiresAt: { type: Date, required: !0 },
              createdAt: { type: Date, required: !0 },
            },
            { versionKey: !1 },
          ),
          i = g().models.SharedLink ?? g().model("SharedLink", h),
          j = new Map();
        async function k(a) {
          (j.set(a.shareToken, a),
            process.env.MONGODB_URI &&
              (await (0, e.J)(),
              await i.create({
                token: a.shareToken,
                campaignId: a.campaignId,
                agencyId: a.agencyId,
                clientEmail: a.clientEmail,
                expiresAt: a.expiresAt,
                createdAt: a.createdAt,
              })));
        }
        async function l(a) {
          let b = j.get(a);
          if (b) return b;
          if (!process.env.MONGODB_URI) return null;
          await (0, e.J)();
          let c = await i.findOne({ token: a }).lean().exec();
          return c
            ? {
                shareToken: c.token,
                campaignId: c.campaignId,
                agencyId: c.agencyId,
                clientEmail: c.clientEmail,
                expiresAt: c.expiresAt,
                createdAt: c.createdAt,
              }
            : null;
        }
        function m(a) {
          let b =
            process.env.NEXT_PUBLIC_SITE_URL ??
            (process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : "http://localhost:3000");
          return `${b.replace(/\/$/, "")}/view/${a}`;
        }
        function n() {
          return (0, d.randomUUID)();
        }
        async function o(a) {
          if (process.env.MONGODB_URI)
            return (
              await (0, e.J)(),
              (
                await i
                  .aggregate([
                    { $match: { agencyId: a } },
                    {
                      $group: {
                        _id: "$clientEmail",
                        shareCount: { $sum: 1 },
                        lastShared: { $max: "$createdAt" },
                      },
                    },
                    { $sort: { _id: 1 } },
                  ])
                  .exec()
              ).map((a) => ({ email: a._id, shareCount: a.shareCount, lastShared: a.lastShared }))
            );
          let b = new Map();
          for (let c of j.values()) {
            if (c.agencyId !== a) continue;
            let d = b.get(c.clientEmail),
              e = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
            d
              ? ((d.shareCount += 1), e > d.lastShared && (d.lastShared = e))
              : b.set(c.clientEmail, { shareCount: 1, lastShared: e });
          }
          return [...b.entries()]
            .map(([a, b]) => ({ email: a, ...b }))
            .sort((a, b) => a.email.localeCompare(b.email));
        }
      },
      40858: (a, b, c) => {
        "use strict";
        c.d(b, { E: () => g });
        var d = c(60524),
          e = c(16822),
          f = c(82213);
        async function g(a) {
          let b = a.headers.get("authorization");
          if (b?.startsWith("Bearer ")) {
            let a = await (0, f.Gi)(b.slice(7));
            if (a?.agencyId) return a.agencyId;
          }
          let c = a.cookies.get(f.z4)?.value;
          if (c) {
            let a = await (0, f.Gi)(c);
            if (a?.agencyId) return a.agencyId;
          }
          let g = await (0, d.j2)(),
            h = g?.user?.id;
          return h ? (0, e.a4)(h) : null;
        }
      },
      44870: (a) => {
        "use strict";
        a.exports = require("next/dist/compiled/next-server/app-route.runtime.prod.js");
      },
      55511: (a) => {
        "use strict";
        a.exports = require("crypto");
      },
      56037: (a) => {
        "use strict";
        a.exports = require("mongoose");
      },
      57975: (a) => {
        "use strict";
        a.exports = require("node:util");
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
      76807: (a, b, c) => {
        "use strict";
        (c.r(b),
          c.d(b, {
            handler: () => D,
            patchFetch: () => C,
            routeModule: () => y,
            serverHooks: () => B,
            workAsyncStorage: () => z,
            workUnitAsyncStorage: () => A,
          }));
        var d = {};
        (c.r(d), c.d(d, { POST: () => x }));
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
          v = c(40858),
          w = c(32070);
        async function x(a) {
          let b,
            c = await (0, v.E)(a);
          if (!c)
            return u.NextResponse.json(
              {
                success: !1,
                error: "Unauthorized — sign in and connect Meta, or send Bearer agency JWT",
              },
              { status: 401 },
            );
          try {
            b = await a.json();
          } catch {
            return u.NextResponse.json({ success: !1, error: "Invalid JSON" }, { status: 400 });
          }
          let d = b.campaignId,
            e = b.clientEmail,
            f = b.expiryDays ?? 30;
          if (!d || !e)
            return u.NextResponse.json(
              { success: !1, error: "campaignId and clientEmail are required" },
              { status: 400 },
            );
          let g = (0, w.d4)(),
            h = new Date(),
            i = new Date(h.getTime() + 864e5 * f);
          return (
            await (0, w.KJ)({
              shareToken: g,
              campaignId: d,
              agencyId: c,
              clientEmail: e,
              expiresAt: i,
              createdAt: h,
            }),
            u.NextResponse.json({
              success: !0,
              shareUrl: (0, w.Xe)(g),
              token: g,
              shareToken: g,
              expiresAt: i.toISOString(),
            })
          );
        }
        let y = new e.AppRouteRouteModule({
            definition: {
              kind: f.RouteKind.APP_ROUTE,
              page: "/api/generate-share-link/route",
              pathname: "/api/generate-share-link",
              filename: "route",
              bundlePath: "app/api/generate-share-link/route",
            },
            distDir: ".next",
            relativeProjectDir: "",
            resolvedPagePath:
              "/media/iqbalxrr/Project Disk/Agency Work/ad_reportly/src/app/api/generate-share-link/route.ts",
            nextConfigOutput: "",
            userland: d,
          }),
          { workAsyncStorage: z, workUnitAsyncStorage: A, serverHooks: B } = y;
        function C() {
          return (0, g.patchFetch)({ workAsyncStorage: z, workUnitAsyncStorage: A });
        }
        async function D(a, b, c) {
          var d;
          let e = "/api/generate-share-link/route";
          "/index" === e && (e = "/");
          let g = await y.prepare(a, b, { srcPage: e, multiZoneDraftMode: !1 });
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
              prerenderManifest: z,
              routerServerContext: A,
              isOnDemandRevalidate: B,
              revalidateOnlyGenerated: C,
              resolvedPathname: D,
            } = g,
            E = (0, j.normalizeAppPath)(e),
            F = !!(z.dynamicRoutes[E] || z.routes[D]);
          if (F && !x) {
            let a = !!z.routes[D],
              b = z.dynamicRoutes[E];
            if (b && !1 === b.fallback && !a) throw new s.NoFallbackError();
          }
          let G = null;
          !F || y.isDev || x || (G = "/index" === (G = D) ? "/" : G);
          let H = !0 === y.isDev || !F,
            I = F && !H,
            J = a.method || "GET",
            K = (0, i.getTracer)(),
            L = K.getActiveScopeSpan(),
            M = {
              params: v,
              prerenderManifest: z,
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
                onInstrumentationRequestError: (b, c, d) => y.onRequestError(a, b, d, A),
              },
              sharedContext: { buildId: u },
            },
            N = new k.NodeNextRequest(a),
            O = new k.NodeNextResponse(b),
            P = l.NextRequestAdapter.fromNodeNextRequest(N, (0, l.signalFromNodeResponse)(b));
          try {
            let d = async (c) =>
                y.handle(P, M).finally(() => {
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
                      if (!(0, h.getRequestMeta)(a, "minimalMode") && B && C && !f)
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
                          (await y.onRequestError(
                            a,
                            b,
                            {
                              routerKind: "App Router",
                              routePath: e,
                              routeType: "route",
                              revalidateReason: (0, n.c)({
                                isRevalidate: I,
                                isOnDemandRevalidate: B,
                              }),
                            },
                            A,
                          )),
                        b
                      );
                    }
                  },
                  l = await y.handleResponse({
                    req: a,
                    nextConfig: w,
                    cacheKey: G,
                    routeKind: f.RouteKind.APP_ROUTE,
                    isFallback: !1,
                    prerenderManifest: z,
                    isRoutePPREnabled: !1,
                    isOnDemandRevalidate: B,
                    revalidateOnlyGenerated: C,
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
                    B ? "REVALIDATED" : l.isMiss ? "MISS" : l.isStale ? "STALE" : "HIT",
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
                (await y.onRequestError(a, b, {
                  routerKind: "App Router",
                  routePath: E,
                  routeType: "route",
                  revalidateReason: (0, n.c)({ isRevalidate: I, isOnDemandRevalidate: B }),
                })),
              F)
            )
              throw b;
            return (await (0, o.I)(N, O, new Response(null, { status: 500 })), null);
          }
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
      77598: (a) => {
        "use strict";
        a.exports = require("node:crypto");
      },
      78335: () => {},
      82213: (a, b, c) => {
        "use strict";
        c.d(b, { Gi: () => j, Mp: () => i, z4: () => f });
        var d = c(42570),
          e = c(94069);
        let f = "ar_agency",
          g = "adreportly";
        function h() {
          let a = process.env.JWT_SECRET;
          return !a || a.length < 16 ? null : new TextEncoder().encode(a);
        }
        async function i(a, b = "30d") {
          let c = h();
          if (!c) throw Error("JWT_SECRET must be set (min 16 characters).");
          return new d.P({ agencyId: a.agencyId })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setIssuer(g)
            .setExpirationTime(b)
            .sign(c);
        }
        async function j(a) {
          let b = h();
          if (!b) return null;
          try {
            let { payload: c } = await (0, e.V)(a, b, { issuer: g }),
              d = c.agencyId;
            if (!d) return null;
            return { agencyId: d, sub: c.sub };
          } catch {
            return null;
          }
        }
      },
      86439: (a) => {
        "use strict";
        a.exports = require("next/dist/shared/lib/no-fallback-error.external");
      },
      96487: () => {},
    }));
  var b = require("../../../webpack-runtime.js");
  b.C(a);
  var c = b.X(0, [331, 692, 28, 271, 840], () => b((b.s = 76807)));
  module.exports = c;
})();
