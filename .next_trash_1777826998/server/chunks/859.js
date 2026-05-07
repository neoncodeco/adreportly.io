"use strict";
((exports.id = 859),
  (exports.ids = [859]),
  (exports.modules = {
    7550: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("chart-pie", [
        [
          "path",
          {
            d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
            key: "pzmjnu",
          },
        ],
        ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83", key: "k2fpak" }],
      ]);
    },
    8849: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("plus", [
        ["path", { d: "M5 12h14", key: "1ays0h" }],
        ["path", { d: "M12 5v14", key: "s699le" }],
      ]);
    },
    19710: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("log-out", [
        ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
        ["path", { d: "M21 12H9", key: "dn1m92" }],
        ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }],
      ]);
    },
    25122: (a, b, c) => {
      let d;
      c.d(b, { Mz: () => aX, i3: () => aZ, UC: () => aY, bL: () => aW, Bk: () => aG });
      var e = c(38301);
      let f = ["top", "right", "bottom", "left"],
        g = Math.min,
        h = Math.max,
        i = Math.round,
        j = Math.floor,
        k = (a) => ({ x: a, y: a }),
        l = { left: "right", right: "left", bottom: "top", top: "bottom" };
      function m(a, b) {
        return "function" == typeof a ? a(b) : a;
      }
      function n(a) {
        return a.split("-")[0];
      }
      function o(a) {
        return a.split("-")[1];
      }
      function p(a) {
        return "x" === a ? "y" : "x";
      }
      function q(a) {
        return "y" === a ? "height" : "width";
      }
      function r(a) {
        let b = a[0];
        return "t" === b || "b" === b ? "y" : "x";
      }
      function s(a) {
        return a.includes("start") ? a.replace("start", "end") : a.replace("end", "start");
      }
      let t = ["left", "right"],
        u = ["right", "left"],
        v = ["top", "bottom"],
        w = ["bottom", "top"];
      function x(a) {
        let b = n(a);
        return l[b] + a.slice(b.length);
      }
      function y(a) {
        return "number" != typeof a
          ? { top: 0, right: 0, bottom: 0, left: 0, ...a }
          : { top: a, right: a, bottom: a, left: a };
      }
      function z(a) {
        let { x: b, y: c, width: d, height: e } = a;
        return { width: d, height: e, top: c, left: b, right: b + d, bottom: c + e, x: b, y: c };
      }
      function A(a, b, c) {
        let d,
          { reference: e, floating: f } = a,
          g = r(b),
          h = p(r(b)),
          i = q(h),
          j = n(b),
          k = "y" === g,
          l = e.x + e.width / 2 - f.width / 2,
          m = e.y + e.height / 2 - f.height / 2,
          s = e[i] / 2 - f[i] / 2;
        switch (j) {
          case "top":
            d = { x: l, y: e.y - f.height };
            break;
          case "bottom":
            d = { x: l, y: e.y + e.height };
            break;
          case "right":
            d = { x: e.x + e.width, y: m };
            break;
          case "left":
            d = { x: e.x - f.width, y: m };
            break;
          default:
            d = { x: e.x, y: e.y };
        }
        switch (o(b)) {
          case "start":
            d[h] -= s * (c && k ? -1 : 1);
            break;
          case "end":
            d[h] += s * (c && k ? -1 : 1);
        }
        return d;
      }
      async function B(a, b) {
        var c;
        void 0 === b && (b = {});
        let { x: d, y: e, platform: f, rects: g, elements: h, strategy: i } = a,
          {
            boundary: j = "clippingAncestors",
            rootBoundary: k = "viewport",
            elementContext: l = "floating",
            altBoundary: n = !1,
            padding: o = 0,
          } = m(b, a),
          p = y(o),
          q = h[n ? ("floating" === l ? "reference" : "floating") : l],
          r = z(
            await f.getClippingRect({
              element:
                null == (c = await (null == f.isElement ? void 0 : f.isElement(q))) || c
                  ? q
                  : q.contextElement ||
                    (await (null == f.getDocumentElement
                      ? void 0
                      : f.getDocumentElement(h.floating))),
              boundary: j,
              rootBoundary: k,
              strategy: i,
            }),
          ),
          s =
            "floating" === l
              ? { x: d, y: e, width: g.floating.width, height: g.floating.height }
              : g.reference,
          t = await (null == f.getOffsetParent ? void 0 : f.getOffsetParent(h.floating)),
          u = ((await (null == f.isElement ? void 0 : f.isElement(t))) &&
            (await (null == f.getScale ? void 0 : f.getScale(t)))) || { x: 1, y: 1 },
          v = z(
            f.convertOffsetParentRelativeRectToViewportRelativeRect
              ? await f.convertOffsetParentRelativeRectToViewportRelativeRect({
                  elements: h,
                  rect: s,
                  offsetParent: t,
                  strategy: i,
                })
              : s,
          );
        return {
          top: (r.top - v.top + p.top) / u.y,
          bottom: (v.bottom - r.bottom + p.bottom) / u.y,
          left: (r.left - v.left + p.left) / u.x,
          right: (v.right - r.right + p.right) / u.x,
        };
      }
      let C = async (a, b, c) => {
        let {
            placement: d = "bottom",
            strategy: e = "absolute",
            middleware: f = [],
            platform: g,
          } = c,
          h = g.detectOverflow ? g : { ...g, detectOverflow: B },
          i = await (null == g.isRTL ? void 0 : g.isRTL(b)),
          j = await g.getElementRects({ reference: a, floating: b, strategy: e }),
          { x: k, y: l } = A(j, d, i),
          m = d,
          n = 0,
          o = {};
        for (let c = 0; c < f.length; c++) {
          let p = f[c];
          if (!p) continue;
          let { name: q, fn: r } = p,
            {
              x: s,
              y: t,
              data: u,
              reset: v,
            } = await r({
              x: k,
              y: l,
              initialPlacement: d,
              placement: m,
              strategy: e,
              middlewareData: o,
              rects: j,
              platform: h,
              elements: { reference: a, floating: b },
            });
          ((k = null != s ? s : k),
            (l = null != t ? t : l),
            (o[q] = { ...o[q], ...u }),
            v &&
              n < 50 &&
              (n++,
              "object" == typeof v &&
                (v.placement && (m = v.placement),
                v.rects &&
                  (j =
                    !0 === v.rects
                      ? await g.getElementRects({ reference: a, floating: b, strategy: e })
                      : v.rects),
                ({ x: k, y: l } = A(j, m, i))),
              (c = -1)));
        }
        return { x: k, y: l, placement: m, strategy: e, middlewareData: o };
      };
      function D(a, b) {
        return {
          top: a.top - b.height,
          right: a.right - b.width,
          bottom: a.bottom - b.height,
          left: a.left - b.width,
        };
      }
      function E(a) {
        return f.some((b) => a[b] >= 0);
      }
      let F = new Set(["left", "top"]);
      async function G(a, b) {
        let { placement: c, platform: d, elements: e } = a,
          f = await (null == d.isRTL ? void 0 : d.isRTL(e.floating)),
          g = n(c),
          h = o(c),
          i = "y" === r(c),
          j = F.has(g) ? -1 : 1,
          k = f && i ? -1 : 1,
          l = m(b, a),
          {
            mainAxis: p,
            crossAxis: q,
            alignmentAxis: s,
          } = "number" == typeof l
            ? { mainAxis: l, crossAxis: 0, alignmentAxis: null }
            : {
                mainAxis: l.mainAxis || 0,
                crossAxis: l.crossAxis || 0,
                alignmentAxis: l.alignmentAxis,
              };
        return (
          h && "number" == typeof s && (q = "end" === h ? -1 * s : s),
          i ? { x: q * k, y: p * j } : { x: p * j, y: q * k }
        );
      }
      function H() {
        return "undefined" != typeof window;
      }
      function I(a) {
        return L(a) ? (a.nodeName || "").toLowerCase() : "#document";
      }
      function J(a) {
        var b;
        return (null == a || null == (b = a.ownerDocument) ? void 0 : b.defaultView) || window;
      }
      function K(a) {
        var b;
        return null == (b = (L(a) ? a.ownerDocument : a.document) || window.document)
          ? void 0
          : b.documentElement;
      }
      function L(a) {
        return !!H() && (a instanceof Node || a instanceof J(a).Node);
      }
      function M(a) {
        return !!H() && (a instanceof Element || a instanceof J(a).Element);
      }
      function N(a) {
        return !!H() && (a instanceof HTMLElement || a instanceof J(a).HTMLElement);
      }
      function O(a) {
        return (
          !!H() &&
          "undefined" != typeof ShadowRoot &&
          (a instanceof ShadowRoot || a instanceof J(a).ShadowRoot)
        );
      }
      function P(a) {
        let { overflow: b, overflowX: c, overflowY: d, display: e } = X(a);
        return (
          /auto|scroll|overlay|hidden|clip/.test(b + d + c) && "inline" !== e && "contents" !== e
        );
      }
      function Q(a) {
        try {
          if (a.matches(":popover-open")) return !0;
        } catch (a) {}
        try {
          return a.matches(":modal");
        } catch (a) {
          return !1;
        }
      }
      let R = /transform|translate|scale|rotate|perspective|filter/,
        S = /paint|layout|strict|content/,
        T = (a) => !!a && "none" !== a;
      function U(a) {
        let b = M(a) ? X(a) : a;
        return (
          T(b.transform) ||
          T(b.translate) ||
          T(b.scale) ||
          T(b.rotate) ||
          T(b.perspective) ||
          (!V() && (T(b.backdropFilter) || T(b.filter))) ||
          R.test(b.willChange || "") ||
          S.test(b.contain || "")
        );
      }
      function V() {
        return (
          null == d &&
            (d =
              "undefined" != typeof CSS &&
              CSS.supports &&
              CSS.supports("-webkit-backdrop-filter", "none")),
          d
        );
      }
      function W(a) {
        return /^(html|body|#document)$/.test(I(a));
      }
      function X(a) {
        return J(a).getComputedStyle(a);
      }
      function Y(a) {
        return M(a)
          ? { scrollLeft: a.scrollLeft, scrollTop: a.scrollTop }
          : { scrollLeft: a.scrollX, scrollTop: a.scrollY };
      }
      function Z(a) {
        if ("html" === I(a)) return a;
        let b = a.assignedSlot || a.parentNode || (O(a) && a.host) || K(a);
        return O(b) ? b.host : b;
      }
      function $(a, b, c) {
        var d;
        (void 0 === b && (b = []), void 0 === c && (c = !0));
        let e = (function a(b) {
            let c = Z(b);
            return W(c)
              ? b.ownerDocument
                ? b.ownerDocument.body
                : b.body
              : N(c) && P(c)
                ? c
                : a(c);
          })(a),
          f = e === (null == (d = a.ownerDocument) ? void 0 : d.body),
          g = J(e);
        if (!f) return b.concat(e, $(e, [], c));
        {
          let a = _(g);
          return b.concat(g, g.visualViewport || [], P(e) ? e : [], a && c ? $(a) : []);
        }
      }
      function _(a) {
        return a.parent && Object.getPrototypeOf(a.parent) ? a.frameElement : null;
      }
      function aa(a) {
        let b = X(a),
          c = parseFloat(b.width) || 0,
          d = parseFloat(b.height) || 0,
          e = N(a),
          f = e ? a.offsetWidth : c,
          g = e ? a.offsetHeight : d,
          h = i(c) !== f || i(d) !== g;
        return (h && ((c = f), (d = g)), { width: c, height: d, $: h });
      }
      function ab(a) {
        return M(a) ? a : a.contextElement;
      }
      function ac(a) {
        let b = ab(a);
        if (!N(b)) return k(1);
        let c = b.getBoundingClientRect(),
          { width: d, height: e, $: f } = aa(b),
          g = (f ? i(c.width) : c.width) / d,
          h = (f ? i(c.height) : c.height) / e;
        return (
          (g && Number.isFinite(g)) || (g = 1),
          (h && Number.isFinite(h)) || (h = 1),
          { x: g, y: h }
        );
      }
      let ad = k(0);
      function ae(a) {
        let b = J(a);
        return V() && b.visualViewport
          ? { x: b.visualViewport.offsetLeft, y: b.visualViewport.offsetTop }
          : ad;
      }
      function af(a, b, c, d) {
        var e;
        (void 0 === b && (b = !1), void 0 === c && (c = !1));
        let f = a.getBoundingClientRect(),
          g = ab(a),
          h = k(1);
        b && (d ? M(d) && (h = ac(d)) : (h = ac(a)));
        let i = (void 0 === (e = c) && (e = !1), d && (!e || d === J(g)) && e) ? ae(g) : k(0),
          j = (f.left + i.x) / h.x,
          l = (f.top + i.y) / h.y,
          m = f.width / h.x,
          n = f.height / h.y;
        if (g) {
          let a = J(g),
            b = d && M(d) ? J(d) : d,
            c = a,
            e = _(c);
          for (; e && d && b !== c; ) {
            let a = ac(e),
              b = e.getBoundingClientRect(),
              d = X(e),
              f = b.left + (e.clientLeft + parseFloat(d.paddingLeft)) * a.x,
              g = b.top + (e.clientTop + parseFloat(d.paddingTop)) * a.y;
            ((j *= a.x),
              (l *= a.y),
              (m *= a.x),
              (n *= a.y),
              (j += f),
              (l += g),
              (e = _((c = J(e)))));
          }
        }
        return z({ width: m, height: n, x: j, y: l });
      }
      function ag(a, b) {
        let c = Y(a).scrollLeft;
        return b ? b.left + c : af(K(a)).left + c;
      }
      function ah(a, b) {
        let c = a.getBoundingClientRect();
        return { x: c.left + b.scrollLeft - ag(a, c), y: c.top + b.scrollTop };
      }
      function ai(a, b, c) {
        let d;
        if ("viewport" === b)
          d = (function (a, b) {
            let c = J(a),
              d = K(a),
              e = c.visualViewport,
              f = d.clientWidth,
              g = d.clientHeight,
              h = 0,
              i = 0;
            if (e) {
              ((f = e.width), (g = e.height));
              let a = V();
              (!a || (a && "fixed" === b)) && ((h = e.offsetLeft), (i = e.offsetTop));
            }
            let j = ag(d);
            if (j <= 0) {
              let a = d.ownerDocument,
                b = a.body,
                c = getComputedStyle(b),
                e =
                  ("CSS1Compat" === a.compatMode &&
                    parseFloat(c.marginLeft) + parseFloat(c.marginRight)) ||
                  0,
                g = Math.abs(d.clientWidth - b.clientWidth - e);
              g <= 25 && (f -= g);
            } else j <= 25 && (f += j);
            return { width: f, height: g, x: h, y: i };
          })(a, c);
        else if ("document" === b)
          d = (function (a) {
            let b = K(a),
              c = Y(a),
              d = a.ownerDocument.body,
              e = h(b.scrollWidth, b.clientWidth, d.scrollWidth, d.clientWidth),
              f = h(b.scrollHeight, b.clientHeight, d.scrollHeight, d.clientHeight),
              g = -c.scrollLeft + ag(a),
              i = -c.scrollTop;
            return (
              "rtl" === X(d).direction && (g += h(b.clientWidth, d.clientWidth) - e),
              { width: e, height: f, x: g, y: i }
            );
          })(K(a));
        else if (M(b))
          d = (function (a, b) {
            let c = af(a, !0, "fixed" === b),
              d = c.top + a.clientTop,
              e = c.left + a.clientLeft,
              f = N(a) ? ac(a) : k(1),
              g = a.clientWidth * f.x,
              h = a.clientHeight * f.y;
            return { width: g, height: h, x: e * f.x, y: d * f.y };
          })(b, c);
        else {
          let c = ae(a);
          d = { x: b.x - c.x, y: b.y - c.y, width: b.width, height: b.height };
        }
        return z(d);
      }
      function aj(a) {
        return "static" === X(a).position;
      }
      function ak(a, b) {
        if (!N(a) || "fixed" === X(a).position) return null;
        if (b) return b(a);
        let c = a.offsetParent;
        return (K(a) === c && (c = c.ownerDocument.body), c);
      }
      function al(a, b) {
        var c;
        let d = J(a);
        if (Q(a)) return d;
        if (!N(a)) {
          let b = Z(a);
          for (; b && !W(b); ) {
            if (M(b) && !aj(b)) return b;
            b = Z(b);
          }
          return d;
        }
        let e = ak(a, b);
        for (; e && ((c = e), /^(table|td|th)$/.test(I(c))) && aj(e); ) e = ak(e, b);
        return e && W(e) && aj(e) && !U(e)
          ? d
          : e ||
              (function (a) {
                let b = Z(a);
                for (; N(b) && !W(b); ) {
                  if (U(b)) return b;
                  if (Q(b)) break;
                  b = Z(b);
                }
                return null;
              })(a) ||
              d;
      }
      let am = async function (a) {
          let b = this.getOffsetParent || al,
            c = this.getDimensions,
            d = await c(a.floating);
          return {
            reference: (function (a, b, c) {
              let d = N(b),
                e = K(b),
                f = "fixed" === c,
                g = af(a, !0, f, b),
                h = { scrollLeft: 0, scrollTop: 0 },
                i = k(0);
              if (d || (!d && !f))
                if ((("body" !== I(b) || P(e)) && (h = Y(b)), d)) {
                  let a = af(b, !0, f, b);
                  ((i.x = a.x + b.clientLeft), (i.y = a.y + b.clientTop));
                } else e && (i.x = ag(e));
              f && !d && e && (i.x = ag(e));
              let j = !e || d || f ? k(0) : ah(e, h);
              return {
                x: g.left + h.scrollLeft - i.x - j.x,
                y: g.top + h.scrollTop - i.y - j.y,
                width: g.width,
                height: g.height,
              };
            })(a.reference, await b(a.floating), a.strategy),
            floating: { x: 0, y: 0, width: d.width, height: d.height },
          };
        },
        an = {
          convertOffsetParentRelativeRectToViewportRelativeRect: function (a) {
            let { elements: b, rect: c, offsetParent: d, strategy: e } = a,
              f = "fixed" === e,
              g = K(d),
              h = !!b && Q(b.floating);
            if (d === g || (h && f)) return c;
            let i = { scrollLeft: 0, scrollTop: 0 },
              j = k(1),
              l = k(0),
              m = N(d);
            if ((m || (!m && !f)) && (("body" !== I(d) || P(g)) && (i = Y(d)), m)) {
              let a = af(d);
              ((j = ac(d)), (l.x = a.x + d.clientLeft), (l.y = a.y + d.clientTop));
            }
            let n = !g || m || f ? k(0) : ah(g, i);
            return {
              width: c.width * j.x,
              height: c.height * j.y,
              x: c.x * j.x - i.scrollLeft * j.x + l.x + n.x,
              y: c.y * j.y - i.scrollTop * j.y + l.y + n.y,
            };
          },
          getDocumentElement: K,
          getClippingRect: function (a) {
            let { element: b, boundary: c, rootBoundary: d, strategy: e } = a,
              f = [
                ...("clippingAncestors" === c
                  ? Q(b)
                    ? []
                    : (function (a, b) {
                        let c = b.get(a);
                        if (c) return c;
                        let d = $(a, [], !1).filter((a) => M(a) && "body" !== I(a)),
                          e = null,
                          f = "fixed" === X(a).position,
                          g = f ? Z(a) : a;
                        for (; M(g) && !W(g); ) {
                          let b = X(g),
                            c = U(g);
                          (c || "fixed" !== b.position || (e = null),
                            (
                              f
                                ? c || e
                                : !(
                                    (!c &&
                                      "static" === b.position &&
                                      e &&
                                      ("absolute" === e.position || "fixed" === e.position)) ||
                                    (P(g) &&
                                      !c &&
                                      (function a(b, c) {
                                        let d = Z(b);
                                        return (
                                          !(d === c || !M(d) || W(d)) &&
                                          ("fixed" === X(d).position || a(d, c))
                                        );
                                      })(a, g))
                                  )
                            )
                              ? (e = b)
                              : (d = d.filter((a) => a !== g)),
                            (g = Z(g)));
                        }
                        return (b.set(a, d), d);
                      })(b, this._c)
                  : [].concat(c)),
                d,
              ],
              i = ai(b, f[0], e),
              j = i.top,
              k = i.right,
              l = i.bottom,
              m = i.left;
            for (let a = 1; a < f.length; a++) {
              let c = ai(b, f[a], e);
              ((j = h(c.top, j)), (k = g(c.right, k)), (l = g(c.bottom, l)), (m = h(c.left, m)));
            }
            return { width: k - m, height: l - j, x: m, y: j };
          },
          getOffsetParent: al,
          getElementRects: am,
          getClientRects: function (a) {
            return Array.from(a.getClientRects());
          },
          getDimensions: function (a) {
            let { width: b, height: c } = aa(a);
            return { width: b, height: c };
          },
          getScale: ac,
          isElement: M,
          isRTL: function (a) {
            return "rtl" === X(a).direction;
          },
        };
      function ao(a, b) {
        return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
      }
      let ap = (a) => ({
        name: "arrow",
        options: a,
        async fn(b) {
          let {
              x: c,
              y: d,
              placement: e,
              rects: f,
              platform: i,
              elements: j,
              middlewareData: k,
            } = b,
            { element: l, padding: n = 0 } = m(a, b) || {};
          if (null == l) return {};
          let s = y(n),
            t = { x: c, y: d },
            u = p(r(e)),
            v = q(u),
            w = await i.getDimensions(l),
            x = "y" === u,
            z = x ? "clientHeight" : "clientWidth",
            A = f.reference[v] + f.reference[u] - t[u] - f.floating[v],
            B = t[u] - f.reference[u],
            C = await (null == i.getOffsetParent ? void 0 : i.getOffsetParent(l)),
            D = C ? C[z] : 0;
          (D && (await (null == i.isElement ? void 0 : i.isElement(C)))) ||
            (D = j.floating[z] || f.floating[v]);
          let E = D / 2 - w[v] / 2 - 1,
            F = g(s[x ? "top" : "left"], E),
            G = g(s[x ? "bottom" : "right"], E),
            H = D - w[v] - G,
            I = D / 2 - w[v] / 2 + (A / 2 - B / 2),
            J = h(F, g(I, H)),
            K =
              !k.arrow &&
              null != o(e) &&
              I !== J &&
              f.reference[v] / 2 - (I < F ? F : G) - w[v] / 2 < 0,
            L = K ? (I < F ? I - F : I - H) : 0;
          return {
            [u]: t[u] + L,
            data: { [u]: J, centerOffset: I - J - L, ...(K && { alignmentOffset: L }) },
            reset: K,
          };
        },
      });
      var aq = c(23312),
        ar = "undefined" != typeof document ? e.useLayoutEffect : function () {};
      function as(a, b) {
        let c, d, e;
        if (a === b) return !0;
        if (typeof a != typeof b) return !1;
        if ("function" == typeof a && a.toString() === b.toString()) return !0;
        if (a && b && "object" == typeof a) {
          if (Array.isArray(a)) {
            if ((c = a.length) !== b.length) return !1;
            for (d = c; 0 != d--; ) if (!as(a[d], b[d])) return !1;
            return !0;
          }
          if ((c = (e = Object.keys(a)).length) !== Object.keys(b).length) return !1;
          for (d = c; 0 != d--; ) if (!{}.hasOwnProperty.call(b, e[d])) return !1;
          for (d = c; 0 != d--; ) {
            let c = e[d];
            if (("_owner" !== c || !a.$$typeof) && !as(a[c], b[c])) return !1;
          }
          return !0;
        }
        return a != a && b != b;
      }
      function at(a) {
        return "undefined" == typeof window
          ? 1
          : (a.ownerDocument.defaultView || window).devicePixelRatio || 1;
      }
      function au(a, b) {
        let c = at(a);
        return Math.round(b * c) / c;
      }
      function av(a) {
        let b = e.useRef(a);
        return (
          ar(() => {
            b.current = a;
          }),
          b
        );
      }
      var aw = c(99978),
        ax = c(21124),
        ay = e.forwardRef((a, b) => {
          let { children: c, width: d = 10, height: e = 5, ...f } = a;
          return (0, ax.jsx)(aw.sG.svg, {
            ...f,
            ref: b,
            width: d,
            height: e,
            viewBox: "0 0 30 10",
            preserveAspectRatio: "none",
            children: a.asChild ? c : (0, ax.jsx)("polygon", { points: "0,0 30,0 15,10" }),
          });
        });
      ay.displayName = "Arrow";
      var az = c(92808),
        aA = c(2332),
        aB = c(71700),
        aC = c(68829),
        aD = c(96386),
        aE = "Popper",
        [aF, aG] = (0, aA.A)(aE),
        [aH, aI] = aF(aE),
        aJ = (a) => {
          let { __scopePopper: b, children: c } = a,
            [d, f] = e.useState(null);
          return (0, ax.jsx)(aH, { scope: b, anchor: d, onAnchorChange: f, children: c });
        };
      aJ.displayName = aE;
      var aK = "PopperAnchor",
        aL = e.forwardRef((a, b) => {
          let { __scopePopper: c, virtualRef: d, ...f } = a,
            g = aI(aK, c),
            h = e.useRef(null),
            i = (0, az.s)(b, h),
            j = e.useRef(null);
          return (
            e.useEffect(() => {
              let a = j.current;
              ((j.current = d?.current || h.current),
                a !== j.current && g.onAnchorChange(j.current));
            }),
            d ? null : (0, ax.jsx)(aw.sG.div, { ...f, ref: i })
          );
        });
      aL.displayName = aK;
      var aM = "PopperContent",
        [aN, aO] = aF(aM),
        aP = e.forwardRef((a, b) => {
          let {
              __scopePopper: c,
              side: d = "bottom",
              sideOffset: f = 0,
              align: i = "center",
              alignOffset: k = 0,
              arrowPadding: l = 0,
              avoidCollisions: y = !0,
              collisionBoundary: z = [],
              collisionPadding: A = 0,
              sticky: B = "partial",
              hideWhenDetached: H = !1,
              updatePositionStrategy: I = "optimized",
              onPlaced: J,
              ...L
            } = a,
            M = aI(aM, c),
            [N, O] = e.useState(null),
            P = (0, az.s)(b, (a) => O(a)),
            [Q, R] = e.useState(null),
            S = (0, aD.X)(Q),
            T = S?.width ?? 0,
            U = S?.height ?? 0,
            V = "number" == typeof A ? A : { top: 0, right: 0, bottom: 0, left: 0, ...A },
            W = Array.isArray(z) ? z : [z],
            X = W.length > 0,
            Y = { padding: V, boundary: W.filter(aT), altBoundary: X },
            {
              refs: Z,
              floatingStyles: _,
              placement: aa,
              isPositioned: ac,
              middlewareData: ad,
            } = (function (a) {
              void 0 === a && (a = {});
              let {
                  placement: b = "bottom",
                  strategy: c = "absolute",
                  middleware: d = [],
                  platform: f,
                  elements: { reference: g, floating: h } = {},
                  transform: i = !0,
                  whileElementsMounted: j,
                  open: k,
                } = a,
                [l, m] = e.useState({
                  x: 0,
                  y: 0,
                  strategy: c,
                  placement: b,
                  middlewareData: {},
                  isPositioned: !1,
                }),
                [n, o] = e.useState(d);
              as(n, d) || o(d);
              let [p, q] = e.useState(null),
                [r, s] = e.useState(null),
                t = e.useCallback((a) => {
                  a !== x.current && ((x.current = a), q(a));
                }, []),
                u = e.useCallback((a) => {
                  a !== y.current && ((y.current = a), s(a));
                }, []),
                v = g || p,
                w = h || r,
                x = e.useRef(null),
                y = e.useRef(null),
                z = e.useRef(l),
                A = null != j,
                B = av(j),
                D = av(f),
                E = av(k),
                F = e.useCallback(() => {
                  if (!x.current || !y.current) return;
                  let a = { placement: b, strategy: c, middleware: n };
                  (D.current && (a.platform = D.current),
                    ((a, b, c) => {
                      let d = new Map(),
                        e = { platform: an, ...c },
                        f = { ...e.platform, _c: d };
                      return C(a, b, { ...e, platform: f });
                    })(x.current, y.current, a).then((a) => {
                      let b = { ...a, isPositioned: !1 !== E.current };
                      G.current &&
                        !as(z.current, b) &&
                        ((z.current = b),
                        aq.flushSync(() => {
                          m(b);
                        }));
                    }));
                }, [n, b, c, D, E]);
              ar(() => {
                !1 === k &&
                  z.current.isPositioned &&
                  ((z.current.isPositioned = !1), m((a) => ({ ...a, isPositioned: !1 })));
              }, [k]);
              let G = e.useRef(!1);
              (ar(
                () => (
                  (G.current = !0),
                  () => {
                    G.current = !1;
                  }
                ),
                [],
              ),
                ar(() => {
                  if ((v && (x.current = v), w && (y.current = w), v && w)) {
                    if (B.current) return B.current(v, w, F);
                    F();
                  }
                }, [v, w, F, B, A]));
              let H = e.useMemo(
                  () => ({ reference: x, floating: y, setReference: t, setFloating: u }),
                  [t, u],
                ),
                I = e.useMemo(() => ({ reference: v, floating: w }), [v, w]),
                J = e.useMemo(() => {
                  let a = { position: c, left: 0, top: 0 };
                  if (!I.floating) return a;
                  let b = au(I.floating, l.x),
                    d = au(I.floating, l.y);
                  return i
                    ? {
                        ...a,
                        transform: "translate(" + b + "px, " + d + "px)",
                        ...(at(I.floating) >= 1.5 && { willChange: "transform" }),
                      }
                    : { position: c, left: b, top: d };
                }, [c, i, I.floating, l.x, l.y]);
              return e.useMemo(
                () => ({ ...l, update: F, refs: H, elements: I, floatingStyles: J }),
                [l, F, H, I, J],
              );
            })({
              strategy: "fixed",
              placement: d + ("center" !== i ? "-" + i : ""),
              whileElementsMounted: (...a) =>
                (function (a, b, c, d) {
                  let e;
                  void 0 === d && (d = {});
                  let {
                      ancestorScroll: f = !0,
                      ancestorResize: i = !0,
                      elementResize: k = "function" == typeof ResizeObserver,
                      layoutShift: l = "function" == typeof IntersectionObserver,
                      animationFrame: m = !1,
                    } = d,
                    n = ab(a),
                    o = f || i ? [...(n ? $(n) : []), ...(b ? $(b) : [])] : [];
                  o.forEach((a) => {
                    (f && a.addEventListener("scroll", c, { passive: !0 }),
                      i && a.addEventListener("resize", c));
                  });
                  let p =
                      n && l
                        ? (function (a, b) {
                            let c,
                              d = null,
                              e = K(a);
                            function f() {
                              var a;
                              (clearTimeout(c), null == (a = d) || a.disconnect(), (d = null));
                            }
                            return (
                              !(function i(k, l) {
                                (void 0 === k && (k = !1), void 0 === l && (l = 1), f());
                                let m = a.getBoundingClientRect(),
                                  { left: n, top: o, width: p, height: q } = m;
                                if ((k || b(), !p || !q)) return;
                                let r = j(o),
                                  s = j(e.clientWidth - (n + p)),
                                  t = {
                                    rootMargin:
                                      -r +
                                      "px " +
                                      -s +
                                      "px " +
                                      -j(e.clientHeight - (o + q)) +
                                      "px " +
                                      -j(n) +
                                      "px",
                                    threshold: h(0, g(1, l)) || 1,
                                  },
                                  u = !0;
                                function v(b) {
                                  let d = b[0].intersectionRatio;
                                  if (d !== l) {
                                    if (!u) return i();
                                    d
                                      ? i(!1, d)
                                      : (c = setTimeout(() => {
                                          i(!1, 1e-7);
                                        }, 1e3));
                                  }
                                  (1 !== d || ao(m, a.getBoundingClientRect()) || i(), (u = !1));
                                }
                                try {
                                  d = new IntersectionObserver(v, { ...t, root: e.ownerDocument });
                                } catch (a) {
                                  d = new IntersectionObserver(v, t);
                                }
                                d.observe(a);
                              })(!0),
                              f
                            );
                          })(n, c)
                        : null,
                    q = -1,
                    r = null;
                  k &&
                    ((r = new ResizeObserver((a) => {
                      let [d] = a;
                      (d &&
                        d.target === n &&
                        r &&
                        b &&
                        (r.unobserve(b),
                        cancelAnimationFrame(q),
                        (q = requestAnimationFrame(() => {
                          var a;
                          null == (a = r) || a.observe(b);
                        }))),
                        c());
                    })),
                    n && !m && r.observe(n),
                    b && r.observe(b));
                  let s = m ? af(a) : null;
                  return (
                    m &&
                      (function b() {
                        let d = af(a);
                        (s && !ao(s, d) && c(), (s = d), (e = requestAnimationFrame(b)));
                      })(),
                    c(),
                    () => {
                      var a;
                      (o.forEach((a) => {
                        (f && a.removeEventListener("scroll", c),
                          i && a.removeEventListener("resize", c));
                      }),
                        null == p || p(),
                        null == (a = r) || a.disconnect(),
                        (r = null),
                        m && cancelAnimationFrame(e));
                    }
                  );
                })(...a, { animationFrame: "always" === I }),
              elements: { reference: M.anchor },
              middleware: [
                ((a, b) => {
                  let c = (function (a) {
                    return (
                      void 0 === a && (a = 0),
                      {
                        name: "offset",
                        options: a,
                        async fn(b) {
                          var c, d;
                          let { x: e, y: f, placement: g, middlewareData: h } = b,
                            i = await G(b, a);
                          return g === (null == (c = h.offset) ? void 0 : c.placement) &&
                            null != (d = h.arrow) &&
                            d.alignmentOffset
                            ? {}
                            : { x: e + i.x, y: f + i.y, data: { ...i, placement: g } };
                        },
                      }
                    );
                  })(a);
                  return { name: c.name, fn: c.fn, options: [a, void 0] };
                })({ mainAxis: f + U, alignmentAxis: k }),
                y &&
                  ((a, b) => {
                    let c = (function (a) {
                      return (
                        void 0 === a && (a = {}),
                        {
                          name: "shift",
                          options: a,
                          async fn(b) {
                            let { x: c, y: d, placement: e, platform: f } = b,
                              {
                                mainAxis: i = !0,
                                crossAxis: j = !1,
                                limiter: k = {
                                  fn: (a) => {
                                    let { x: b, y: c } = a;
                                    return { x: b, y: c };
                                  },
                                },
                                ...l
                              } = m(a, b),
                              o = { x: c, y: d },
                              q = await f.detectOverflow(b, l),
                              s = r(n(e)),
                              t = p(s),
                              u = o[t],
                              v = o[s];
                            if (i) {
                              let a = "y" === t ? "top" : "left",
                                b = "y" === t ? "bottom" : "right",
                                c = u + q[a],
                                d = u - q[b];
                              u = h(c, g(u, d));
                            }
                            if (j) {
                              let a = "y" === s ? "top" : "left",
                                b = "y" === s ? "bottom" : "right",
                                c = v + q[a],
                                d = v - q[b];
                              v = h(c, g(v, d));
                            }
                            let w = k.fn({ ...b, [t]: u, [s]: v });
                            return {
                              ...w,
                              data: { x: w.x - c, y: w.y - d, enabled: { [t]: i, [s]: j } },
                            };
                          },
                        }
                      );
                    })(a);
                    return { name: c.name, fn: c.fn, options: [a, void 0] };
                  })({
                    mainAxis: !0,
                    crossAxis: !1,
                    limiter:
                      "partial" === B
                        ? {
                            fn: (function (a) {
                              return (
                                void 0 === a && (a = {}),
                                {
                                  options: a,
                                  fn(b) {
                                    let {
                                        x: c,
                                        y: d,
                                        placement: e,
                                        rects: f,
                                        middlewareData: g,
                                      } = b,
                                      {
                                        offset: h = 0,
                                        mainAxis: i = !0,
                                        crossAxis: j = !0,
                                      } = m(a, b),
                                      k = { x: c, y: d },
                                      l = r(e),
                                      o = p(l),
                                      q = k[o],
                                      s = k[l],
                                      t = m(h, b),
                                      u =
                                        "number" == typeof t
                                          ? { mainAxis: t, crossAxis: 0 }
                                          : { mainAxis: 0, crossAxis: 0, ...t };
                                    if (i) {
                                      let a = "y" === o ? "height" : "width",
                                        b = f.reference[o] - f.floating[a] + u.mainAxis,
                                        c = f.reference[o] + f.reference[a] - u.mainAxis;
                                      q < b ? (q = b) : q > c && (q = c);
                                    }
                                    if (j) {
                                      var v, w;
                                      let a = "y" === o ? "width" : "height",
                                        b = F.has(n(e)),
                                        c =
                                          f.reference[l] -
                                          f.floating[a] +
                                          ((b && (null == (v = g.offset) ? void 0 : v[l])) || 0) +
                                          (b ? 0 : u.crossAxis),
                                        d =
                                          f.reference[l] +
                                          f.reference[a] +
                                          (b ? 0 : (null == (w = g.offset) ? void 0 : w[l]) || 0) -
                                          (b ? u.crossAxis : 0);
                                      s < c ? (s = c) : s > d && (s = d);
                                    }
                                    return { [o]: q, [l]: s };
                                  },
                                }
                              );
                            })(void 0).fn,
                            options: [void 0, void 0],
                          }
                        : void 0,
                    ...Y,
                  }),
                y &&
                  ((a, b) => {
                    let c = (function (a) {
                      return (
                        void 0 === a && (a = {}),
                        {
                          name: "flip",
                          options: a,
                          async fn(b) {
                            var c, d, e, f, g;
                            let {
                                placement: h,
                                middlewareData: i,
                                rects: j,
                                initialPlacement: k,
                                platform: l,
                                elements: y,
                              } = b,
                              {
                                mainAxis: z = !0,
                                crossAxis: A = !0,
                                fallbackPlacements: B,
                                fallbackStrategy: C = "bestFit",
                                fallbackAxisSideDirection: D = "none",
                                flipAlignment: E = !0,
                                ...F
                              } = m(a, b);
                            if (null != (c = i.arrow) && c.alignmentOffset) return {};
                            let G = n(h),
                              H = r(k),
                              I = n(k) === k,
                              J = await (null == l.isRTL ? void 0 : l.isRTL(y.floating)),
                              K =
                                B ||
                                (I || !E
                                  ? [x(k)]
                                  : (function (a) {
                                      let b = x(a);
                                      return [s(a), b, s(b)];
                                    })(k)),
                              L = "none" !== D;
                            !B &&
                              L &&
                              K.push(
                                ...(function (a, b, c, d) {
                                  let e = o(a),
                                    f = (function (a, b, c) {
                                      switch (a) {
                                        case "top":
                                        case "bottom":
                                          if (c) return b ? u : t;
                                          return b ? t : u;
                                        case "left":
                                        case "right":
                                          return b ? v : w;
                                        default:
                                          return [];
                                      }
                                    })(n(a), "start" === c, d);
                                  return (
                                    e &&
                                      ((f = f.map((a) => a + "-" + e)),
                                      b && (f = f.concat(f.map(s)))),
                                    f
                                  );
                                })(k, E, D, J),
                              );
                            let M = [k, ...K],
                              N = await l.detectOverflow(b, F),
                              O = [],
                              P = (null == (d = i.flip) ? void 0 : d.overflows) || [];
                            if ((z && O.push(N[G]), A)) {
                              let a = (function (a, b, c) {
                                void 0 === c && (c = !1);
                                let d = o(a),
                                  e = p(r(a)),
                                  f = q(e),
                                  g =
                                    "x" === e
                                      ? d === (c ? "end" : "start")
                                        ? "right"
                                        : "left"
                                      : "start" === d
                                        ? "bottom"
                                        : "top";
                                return (b.reference[f] > b.floating[f] && (g = x(g)), [g, x(g)]);
                              })(h, j, J);
                              O.push(N[a[0]], N[a[1]]);
                            }
                            if (
                              ((P = [...P, { placement: h, overflows: O }]),
                              !O.every((a) => a <= 0))
                            ) {
                              let a = ((null == (e = i.flip) ? void 0 : e.index) || 0) + 1,
                                b = M[a];
                              if (
                                b &&
                                ("alignment" !== A ||
                                  H === r(b) ||
                                  P.every((a) => r(a.placement) !== H || a.overflows[0] > 0))
                              )
                                return {
                                  data: { index: a, overflows: P },
                                  reset: { placement: b },
                                };
                              let c =
                                null ==
                                (f = P.filter((a) => a.overflows[0] <= 0).sort(
                                  (a, b) => a.overflows[1] - b.overflows[1],
                                )[0])
                                  ? void 0
                                  : f.placement;
                              if (!c)
                                switch (C) {
                                  case "bestFit": {
                                    let a =
                                      null ==
                                      (g = P.filter((a) => {
                                        if (L) {
                                          let b = r(a.placement);
                                          return b === H || "y" === b;
                                        }
                                        return !0;
                                      })
                                        .map((a) => [
                                          a.placement,
                                          a.overflows
                                            .filter((a) => a > 0)
                                            .reduce((a, b) => a + b, 0),
                                        ])
                                        .sort((a, b) => a[1] - b[1])[0])
                                        ? void 0
                                        : g[0];
                                    a && (c = a);
                                    break;
                                  }
                                  case "initialPlacement":
                                    c = k;
                                }
                              if (h !== c) return { reset: { placement: c } };
                            }
                            return {};
                          },
                        }
                      );
                    })(a);
                    return { name: c.name, fn: c.fn, options: [a, void 0] };
                  })({ ...Y }),
                ((a, b) => {
                  let c = (function (a) {
                    return (
                      void 0 === a && (a = {}),
                      {
                        name: "size",
                        options: a,
                        async fn(b) {
                          var c, d;
                          let e,
                            f,
                            { placement: i, rects: j, platform: k, elements: l } = b,
                            { apply: p = () => {}, ...q } = m(a, b),
                            s = await k.detectOverflow(b, q),
                            t = n(i),
                            u = o(i),
                            v = "y" === r(i),
                            { width: w, height: x } = j.floating;
                          "top" === t || "bottom" === t
                            ? ((e = t),
                              (f =
                                u ===
                                ((await (null == k.isRTL ? void 0 : k.isRTL(l.floating)))
                                  ? "start"
                                  : "end")
                                  ? "left"
                                  : "right"))
                            : ((f = t), (e = "end" === u ? "top" : "bottom"));
                          let y = x - s.top - s.bottom,
                            z = w - s.left - s.right,
                            A = g(x - s[e], y),
                            B = g(w - s[f], z),
                            C = !b.middlewareData.shift,
                            D = A,
                            E = B;
                          if (
                            (null != (c = b.middlewareData.shift) && c.enabled.x && (E = z),
                            null != (d = b.middlewareData.shift) && d.enabled.y && (D = y),
                            C && !u)
                          ) {
                            let a = h(s.left, 0),
                              b = h(s.right, 0),
                              c = h(s.top, 0),
                              d = h(s.bottom, 0);
                            v
                              ? (E = w - 2 * (0 !== a || 0 !== b ? a + b : h(s.left, s.right)))
                              : (D = x - 2 * (0 !== c || 0 !== d ? c + d : h(s.top, s.bottom)));
                          }
                          await p({ ...b, availableWidth: E, availableHeight: D });
                          let F = await k.getDimensions(l.floating);
                          return w !== F.width || x !== F.height ? { reset: { rects: !0 } } : {};
                        },
                      }
                    );
                  })(a);
                  return { name: c.name, fn: c.fn, options: [a, void 0] };
                })({
                  ...Y,
                  apply: ({ elements: a, rects: b, availableWidth: c, availableHeight: d }) => {
                    let { width: e, height: f } = b.reference,
                      g = a.floating.style;
                    (g.setProperty("--radix-popper-available-width", `${c}px`),
                      g.setProperty("--radix-popper-available-height", `${d}px`),
                      g.setProperty("--radix-popper-anchor-width", `${e}px`),
                      g.setProperty("--radix-popper-anchor-height", `${f}px`));
                  },
                }),
                Q &&
                  ((a, b) => {
                    let c = ((a) => ({
                      name: "arrow",
                      options: a,
                      fn(b) {
                        let { element: c, padding: d } = "function" == typeof a ? a(b) : a;
                        return c && {}.hasOwnProperty.call(c, "current")
                          ? null != c.current
                            ? ap({ element: c.current, padding: d }).fn(b)
                            : {}
                          : c
                            ? ap({ element: c, padding: d }).fn(b)
                            : {};
                      },
                    }))(a);
                    return { name: c.name, fn: c.fn, options: [a, void 0] };
                  })({ element: Q, padding: l }),
                aU({ arrowWidth: T, arrowHeight: U }),
                H &&
                  ((a, b) => {
                    let c = (function (a) {
                      return (
                        void 0 === a && (a = {}),
                        {
                          name: "hide",
                          options: a,
                          async fn(b) {
                            let { rects: c, platform: d } = b,
                              { strategy: e = "referenceHidden", ...f } = m(a, b);
                            switch (e) {
                              case "referenceHidden": {
                                let a = D(
                                  await d.detectOverflow(b, { ...f, elementContext: "reference" }),
                                  c.reference,
                                );
                                return {
                                  data: { referenceHiddenOffsets: a, referenceHidden: E(a) },
                                };
                              }
                              case "escaped": {
                                let a = D(
                                  await d.detectOverflow(b, { ...f, altBoundary: !0 }),
                                  c.floating,
                                );
                                return { data: { escapedOffsets: a, escaped: E(a) } };
                              }
                              default:
                                return {};
                            }
                          },
                        }
                      );
                    })(a);
                    return { name: c.name, fn: c.fn, options: [a, void 0] };
                  })({ strategy: "referenceHidden", ...Y }),
              ],
            }),
            [ae, ag] = aV(aa),
            ah = (0, aB.c)(J);
          (0, aC.N)(() => {
            ac && ah?.();
          }, [ac, ah]);
          let ai = ad.arrow?.x,
            aj = ad.arrow?.y,
            ak = ad.arrow?.centerOffset !== 0,
            [al, am] = e.useState();
          return (
            (0, aC.N)(() => {
              N && am(window.getComputedStyle(N).zIndex);
            }, [N]),
            (0, ax.jsx)("div", {
              ref: Z.setFloating,
              "data-radix-popper-content-wrapper": "",
              style: {
                ..._,
                transform: ac ? _.transform : "translate(0, -200%)",
                minWidth: "max-content",
                zIndex: al,
                "--radix-popper-transform-origin": [
                  ad.transformOrigin?.x,
                  ad.transformOrigin?.y,
                ].join(" "),
                ...(ad.hide?.referenceHidden && { visibility: "hidden", pointerEvents: "none" }),
              },
              dir: a.dir,
              children: (0, ax.jsx)(aN, {
                scope: c,
                placedSide: ae,
                onArrowChange: R,
                arrowX: ai,
                arrowY: aj,
                shouldHideArrow: ak,
                children: (0, ax.jsx)(aw.sG.div, {
                  "data-side": ae,
                  "data-align": ag,
                  ...L,
                  ref: P,
                  style: { ...L.style, animation: ac ? void 0 : "none" },
                }),
              }),
            })
          );
        });
      aP.displayName = aM;
      var aQ = "PopperArrow",
        aR = { top: "bottom", right: "left", bottom: "top", left: "right" },
        aS = e.forwardRef(function (a, b) {
          let { __scopePopper: c, ...d } = a,
            e = aO(aQ, c),
            f = aR[e.placedSide];
          return (0, ax.jsx)("span", {
            ref: e.onArrowChange,
            style: {
              position: "absolute",
              left: e.arrowX,
              top: e.arrowY,
              [f]: 0,
              transformOrigin: { top: "", right: "0 0", bottom: "center 0", left: "100% 0" }[
                e.placedSide
              ],
              transform: {
                top: "translateY(100%)",
                right: "translateY(50%) rotate(90deg) translateX(-50%)",
                bottom: "rotate(180deg)",
                left: "translateY(50%) rotate(-90deg) translateX(50%)",
              }[e.placedSide],
              visibility: e.shouldHideArrow ? "hidden" : void 0,
            },
            children: (0, ax.jsx)(ay, { ...d, ref: b, style: { ...d.style, display: "block" } }),
          });
        });
      function aT(a) {
        return null !== a;
      }
      aS.displayName = aQ;
      var aU = (a) => ({
        name: "transformOrigin",
        options: a,
        fn(b) {
          let { placement: c, rects: d, middlewareData: e } = b,
            f = e.arrow?.centerOffset !== 0,
            g = f ? 0 : a.arrowWidth,
            h = f ? 0 : a.arrowHeight,
            [i, j] = aV(c),
            k = { start: "0%", center: "50%", end: "100%" }[j],
            l = (e.arrow?.x ?? 0) + g / 2,
            m = (e.arrow?.y ?? 0) + h / 2,
            n = "",
            o = "";
          return (
            "bottom" === i
              ? ((n = f ? k : `${l}px`), (o = `${-h}px`))
              : "top" === i
                ? ((n = f ? k : `${l}px`), (o = `${d.floating.height + h}px`))
                : "right" === i
                  ? ((n = `${-h}px`), (o = f ? k : `${m}px`))
                  : "left" === i && ((n = `${d.floating.width + h}px`), (o = f ? k : `${m}px`)),
            { data: { x: n, y: o } }
          );
        },
      });
      function aV(a) {
        let [b, c = "center"] = a.split("-");
        return [b, c];
      }
      var aW = aJ,
        aX = aL,
        aY = aP,
        aZ = aS;
    },
    32337: (a, b, c) => {
      c.d(b, {
        H_: () => bn,
        UC: () => bj,
        YJ: () => bk,
        q7: () => bm,
        VF: () => bq,
        JU: () => bl,
        ZL: () => bi,
        z6: () => bo,
        hN: () => bp,
        bL: () => bg,
        wv: () => br,
        Pb: () => bs,
        G5: () => bu,
        ZP: () => bt,
        l9: () => bh,
      });
      var d = c(38301),
        e = c(87868),
        f = c(92808),
        g = c(2332),
        h = c(11720),
        i = c(99978),
        j = c(43515),
        k = c(10498),
        l = c(7412),
        m = c(70904),
        n = c(69998),
        o = c(75656),
        p = c(25122),
        q = c(61611),
        r = c(29988),
        s = c(71700),
        t = c(21124),
        u = "rovingFocusGroup.onEntryFocus",
        v = { bubbles: !1, cancelable: !0 },
        w = "RovingFocusGroup",
        [x, y, z] = (0, j.N)(w),
        [A, B] = (0, g.A)(w, [z]),
        [C, D] = A(w),
        E = d.forwardRef((a, b) =>
          (0, t.jsx)(x.Provider, {
            scope: a.__scopeRovingFocusGroup,
            children: (0, t.jsx)(x.Slot, {
              scope: a.__scopeRovingFocusGroup,
              children: (0, t.jsx)(F, { ...a, ref: b }),
            }),
          }),
        );
      E.displayName = w;
      var F = d.forwardRef((a, b) => {
          let {
              __scopeRovingFocusGroup: c,
              orientation: g,
              loop: j = !1,
              dir: l,
              currentTabStopId: m,
              defaultCurrentTabStopId: n,
              onCurrentTabStopIdChange: o,
              onEntryFocus: p,
              preventScrollOnEntryFocus: q = !1,
              ...r
            } = a,
            x = d.useRef(null),
            z = (0, f.s)(b, x),
            A = (0, k.jH)(l),
            [B, D] = (0, h.i)({ prop: m, defaultProp: n ?? null, onChange: o, caller: w }),
            [E, F] = d.useState(!1),
            G = (0, s.c)(p),
            H = y(c),
            I = d.useRef(!1),
            [K, L] = d.useState(0);
          return (
            d.useEffect(() => {
              let a = x.current;
              if (a) return (a.addEventListener(u, G), () => a.removeEventListener(u, G));
            }, [G]),
            (0, t.jsx)(C, {
              scope: c,
              orientation: g,
              dir: A,
              loop: j,
              currentTabStopId: B,
              onItemFocus: d.useCallback((a) => D(a), [D]),
              onItemShiftTab: d.useCallback(() => F(!0), []),
              onFocusableItemAdd: d.useCallback(() => L((a) => a + 1), []),
              onFocusableItemRemove: d.useCallback(() => L((a) => a - 1), []),
              children: (0, t.jsx)(i.sG.div, {
                tabIndex: E || 0 === K ? -1 : 0,
                "data-orientation": g,
                ...r,
                ref: z,
                style: { outline: "none", ...a.style },
                onMouseDown: (0, e.mK)(a.onMouseDown, () => {
                  I.current = !0;
                }),
                onFocus: (0, e.mK)(a.onFocus, (a) => {
                  let b = !I.current;
                  if (a.target === a.currentTarget && b && !E) {
                    let b = new CustomEvent(u, v);
                    if ((a.currentTarget.dispatchEvent(b), !b.defaultPrevented)) {
                      let a = H().filter((a) => a.focusable);
                      J(
                        [a.find((a) => a.active), a.find((a) => a.id === B), ...a]
                          .filter(Boolean)
                          .map((a) => a.ref.current),
                        q,
                      );
                    }
                  }
                  I.current = !1;
                }),
                onBlur: (0, e.mK)(a.onBlur, () => F(!1)),
              }),
            })
          );
        }),
        G = "RovingFocusGroupItem",
        H = d.forwardRef((a, b) => {
          let {
              __scopeRovingFocusGroup: c,
              focusable: f = !0,
              active: g = !1,
              tabStopId: h,
              children: j,
              ...k
            } = a,
            l = (0, o.B)(),
            m = h || l,
            n = D(G, c),
            p = n.currentTabStopId === m,
            q = y(c),
            { onFocusableItemAdd: r, onFocusableItemRemove: s, currentTabStopId: u } = n;
          return (
            d.useEffect(() => {
              if (f) return (r(), () => s());
            }, [f, r, s]),
            (0, t.jsx)(x.ItemSlot, {
              scope: c,
              id: m,
              focusable: f,
              active: g,
              children: (0, t.jsx)(i.sG.span, {
                tabIndex: p ? 0 : -1,
                "data-orientation": n.orientation,
                ...k,
                ref: b,
                onMouseDown: (0, e.mK)(a.onMouseDown, (a) => {
                  f ? n.onItemFocus(m) : a.preventDefault();
                }),
                onFocus: (0, e.mK)(a.onFocus, () => n.onItemFocus(m)),
                onKeyDown: (0, e.mK)(a.onKeyDown, (a) => {
                  if ("Tab" === a.key && a.shiftKey) return void n.onItemShiftTab();
                  if (a.target !== a.currentTarget) return;
                  let b = (function (a, b, c) {
                    var d;
                    let e =
                      ((d = a.key),
                      "rtl" !== c
                        ? d
                        : "ArrowLeft" === d
                          ? "ArrowRight"
                          : "ArrowRight" === d
                            ? "ArrowLeft"
                            : d);
                    if (
                      !("vertical" === b && ["ArrowLeft", "ArrowRight"].includes(e)) &&
                      !("horizontal" === b && ["ArrowUp", "ArrowDown"].includes(e))
                    )
                      return I[e];
                  })(a, n.orientation, n.dir);
                  if (void 0 !== b) {
                    if (a.metaKey || a.ctrlKey || a.altKey || a.shiftKey) return;
                    a.preventDefault();
                    let c = q()
                      .filter((a) => a.focusable)
                      .map((a) => a.ref.current);
                    if ("last" === b) c.reverse();
                    else if ("prev" === b || "next" === b) {
                      "prev" === b && c.reverse();
                      let d = c.indexOf(a.currentTarget);
                      c = n.loop
                        ? (function (a, b) {
                            return a.map((c, d) => a[(b + d) % a.length]);
                          })(c, d + 1)
                        : c.slice(d + 1);
                    }
                    setTimeout(() => J(c));
                  }
                }),
                children:
                  "function" == typeof j ? j({ isCurrentTabStop: p, hasTabStop: null != u }) : j,
              }),
            })
          );
        });
      H.displayName = G;
      var I = {
        ArrowLeft: "prev",
        ArrowUp: "prev",
        ArrowRight: "next",
        ArrowDown: "next",
        PageUp: "first",
        Home: "first",
        PageDown: "last",
        End: "last",
      };
      function J(a, b = !1) {
        let c = document.activeElement;
        for (let d of a)
          if (d === c || (d.focus({ preventScroll: b }), document.activeElement !== c)) return;
      }
      var K = Symbol("radix.slottable");
      function L(a) {
        return (
          d.isValidElement(a) &&
          "function" == typeof a.type &&
          "__radixId" in a.type &&
          a.type.__radixId === K
        );
      }
      var M = c(61225),
        N = c(36409),
        O = ["Enter", " "],
        P = ["ArrowUp", "PageDown", "End"],
        Q = ["ArrowDown", "PageUp", "Home", ...P],
        R = { ltr: [...O, "ArrowRight"], rtl: [...O, "ArrowLeft"] },
        S = { ltr: ["ArrowLeft"], rtl: ["ArrowRight"] },
        T = "Menu",
        [U, V, W] = (0, j.N)(T),
        [X, Y] = (0, g.A)(T, [W, p.Bk, B]),
        Z = (0, p.Bk)(),
        $ = B(),
        [_, aa] = X(T),
        [ab, ac] = X(T),
        ad = (a) => {
          let {
              __scopeMenu: b,
              open: c = !1,
              children: e,
              dir: f,
              onOpenChange: g,
              modal: h = !0,
            } = a,
            i = Z(b),
            [j, l] = d.useState(null),
            m = d.useRef(!1),
            n = (0, s.c)(g),
            o = (0, k.jH)(f);
          return (
            d.useEffect(() => {
              let a = () => {
                  ((m.current = !0),
                    document.addEventListener("pointerdown", b, { capture: !0, once: !0 }),
                    document.addEventListener("pointermove", b, { capture: !0, once: !0 }));
                },
                b = () => (m.current = !1);
              return (
                document.addEventListener("keydown", a, { capture: !0 }),
                () => {
                  (document.removeEventListener("keydown", a, { capture: !0 }),
                    document.removeEventListener("pointerdown", b, { capture: !0 }),
                    document.removeEventListener("pointermove", b, { capture: !0 }));
                }
              );
            }, []),
            (0, t.jsx)(p.bL, {
              ...i,
              children: (0, t.jsx)(_, {
                scope: b,
                open: c,
                onOpenChange: n,
                content: j,
                onContentChange: l,
                children: (0, t.jsx)(ab, {
                  scope: b,
                  onClose: d.useCallback(() => n(!1), [n]),
                  isUsingKeyboardRef: m,
                  dir: o,
                  modal: h,
                  children: e,
                }),
              }),
            })
          );
        };
      ad.displayName = T;
      var ae = d.forwardRef((a, b) => {
        let { __scopeMenu: c, ...d } = a,
          e = Z(c);
        return (0, t.jsx)(p.Mz, { ...e, ...d, ref: b });
      });
      ae.displayName = "MenuAnchor";
      var af = "MenuPortal",
        [ag, ah] = X(af, { forceMount: void 0 }),
        ai = (a) => {
          let { __scopeMenu: b, forceMount: c, children: d, container: e } = a,
            f = aa(af, b);
          return (0, t.jsx)(ag, {
            scope: b,
            forceMount: c,
            children: (0, t.jsx)(r.C, {
              present: c || f.open,
              children: (0, t.jsx)(q.Z, { asChild: !0, container: e, children: d }),
            }),
          });
        };
      ai.displayName = af;
      var aj = "MenuContent",
        [ak, al] = X(aj),
        am = d.forwardRef((a, b) => {
          let c = ah(aj, a.__scopeMenu),
            { forceMount: d = c.forceMount, ...e } = a,
            f = aa(aj, a.__scopeMenu),
            g = ac(aj, a.__scopeMenu);
          return (0, t.jsx)(U.Provider, {
            scope: a.__scopeMenu,
            children: (0, t.jsx)(r.C, {
              present: d || f.open,
              children: (0, t.jsx)(U.Slot, {
                scope: a.__scopeMenu,
                children: g.modal
                  ? (0, t.jsx)(an, { ...e, ref: b })
                  : (0, t.jsx)(ao, { ...e, ref: b }),
              }),
            }),
          });
        }),
        an = d.forwardRef((a, b) => {
          let c = aa(aj, a.__scopeMenu),
            g = d.useRef(null),
            h = (0, f.s)(b, g);
          return (
            d.useEffect(() => {
              let a = g.current;
              if (a) return (0, M.Eq)(a);
            }, []),
            (0, t.jsx)(aq, {
              ...a,
              ref: h,
              trapFocus: c.open,
              disableOutsidePointerEvents: c.open,
              disableOutsideScroll: !0,
              onFocusOutside: (0, e.mK)(a.onFocusOutside, (a) => a.preventDefault(), {
                checkForDefaultPrevented: !1,
              }),
              onDismiss: () => c.onOpenChange(!1),
            })
          );
        }),
        ao = d.forwardRef((a, b) => {
          let c = aa(aj, a.__scopeMenu);
          return (0, t.jsx)(aq, {
            ...a,
            ref: b,
            trapFocus: !1,
            disableOutsidePointerEvents: !1,
            disableOutsideScroll: !1,
            onDismiss: () => c.onOpenChange(!1),
          });
        }),
        ap = (function (a) {
          let b = (function (a) {
              let b = d.forwardRef((a, b) => {
                let { children: c, ...e } = a;
                if (d.isValidElement(c)) {
                  var g;
                  let a,
                    h,
                    i =
                      ((g = c),
                      (h =
                        (a = Object.getOwnPropertyDescriptor(g.props, "ref")?.get) &&
                        "isReactWarning" in a &&
                        a.isReactWarning)
                        ? g.ref
                        : (h =
                              (a = Object.getOwnPropertyDescriptor(g, "ref")?.get) &&
                              "isReactWarning" in a &&
                              a.isReactWarning)
                          ? g.props.ref
                          : g.props.ref || g.ref),
                    j = (function (a, b) {
                      let c = { ...b };
                      for (let d in b) {
                        let e = a[d],
                          f = b[d];
                        /^on[A-Z]/.test(d)
                          ? e && f
                            ? (c[d] = (...a) => {
                                let b = f(...a);
                                return (e(...a), b);
                              })
                            : e && (c[d] = e)
                          : "style" === d
                            ? (c[d] = { ...e, ...f })
                            : "className" === d && (c[d] = [e, f].filter(Boolean).join(" "));
                      }
                      return { ...a, ...c };
                    })(e, c.props);
                  return (
                    c.type !== d.Fragment && (j.ref = b ? (0, f.t)(b, i) : i),
                    d.cloneElement(c, j)
                  );
                }
                return d.Children.count(c) > 1 ? d.Children.only(null) : null;
              });
              return ((b.displayName = `${a}.SlotClone`), b);
            })(a),
            c = d.forwardRef((a, c) => {
              let { children: e, ...f } = a,
                g = d.Children.toArray(e),
                h = g.find(L);
              if (h) {
                let a = h.props.children,
                  e = g.map((b) =>
                    b !== h
                      ? b
                      : d.Children.count(a) > 1
                        ? d.Children.only(null)
                        : d.isValidElement(a)
                          ? a.props.children
                          : null,
                  );
                return (0, t.jsx)(b, {
                  ...f,
                  ref: c,
                  children: d.isValidElement(a) ? d.cloneElement(a, void 0, e) : null,
                });
              }
              return (0, t.jsx)(b, { ...f, ref: c, children: e });
            });
          return ((c.displayName = `${a}.Slot`), c);
        })("MenuContent.ScrollLock"),
        aq = d.forwardRef((a, b) => {
          let {
              __scopeMenu: c,
              loop: g = !1,
              trapFocus: h,
              onOpenAutoFocus: i,
              onCloseAutoFocus: j,
              disableOutsidePointerEvents: k,
              onEntryFocus: o,
              onEscapeKeyDown: q,
              onPointerDownOutside: r,
              onFocusOutside: s,
              onInteractOutside: u,
              onDismiss: v,
              disableOutsideScroll: w,
              ...x
            } = a,
            y = aa(aj, c),
            z = ac(aj, c),
            A = Z(c),
            B = $(c),
            C = V(c),
            [D, F] = d.useState(null),
            G = d.useRef(null),
            H = (0, f.s)(b, G, y.onContentChange),
            I = d.useRef(0),
            J = d.useRef(""),
            K = d.useRef(0),
            L = d.useRef(null),
            M = d.useRef("right"),
            O = d.useRef(0),
            R = w ? N.A : d.Fragment;
          (d.useEffect(() => () => window.clearTimeout(I.current), []), (0, m.Oh)());
          let S = d.useCallback(
            (a) =>
              M.current === L.current?.side &&
              (function (a, b) {
                return (
                  !!b &&
                  (function (a, b) {
                    let { x: c, y: d } = a,
                      e = !1;
                    for (let a = 0, f = b.length - 1; a < b.length; f = a++) {
                      let g = b[a],
                        h = b[f],
                        i = g.x,
                        j = g.y,
                        k = h.x,
                        l = h.y;
                      j > d != l > d && c < ((k - i) * (d - j)) / (l - j) + i && (e = !e);
                    }
                    return e;
                  })({ x: a.clientX, y: a.clientY }, b)
                );
              })(a, L.current?.area),
            [],
          );
          return (0, t.jsx)(ak, {
            scope: c,
            searchRef: J,
            onItemEnter: d.useCallback(
              (a) => {
                S(a) && a.preventDefault();
              },
              [S],
            ),
            onItemLeave: d.useCallback(
              (a) => {
                S(a) || (G.current?.focus(), F(null));
              },
              [S],
            ),
            onTriggerLeave: d.useCallback(
              (a) => {
                S(a) && a.preventDefault();
              },
              [S],
            ),
            pointerGraceTimerRef: K,
            onPointerGraceIntentChange: d.useCallback((a) => {
              L.current = a;
            }, []),
            children: (0, t.jsx)(R, {
              ...(w ? { as: ap, allowPinchZoom: !0 } : void 0),
              children: (0, t.jsx)(n.n, {
                asChild: !0,
                trapped: h,
                onMountAutoFocus: (0, e.mK)(i, (a) => {
                  (a.preventDefault(), G.current?.focus({ preventScroll: !0 }));
                }),
                onUnmountAutoFocus: j,
                children: (0, t.jsx)(l.qW, {
                  asChild: !0,
                  disableOutsidePointerEvents: k,
                  onEscapeKeyDown: q,
                  onPointerDownOutside: r,
                  onFocusOutside: s,
                  onInteractOutside: u,
                  onDismiss: v,
                  children: (0, t.jsx)(E, {
                    asChild: !0,
                    ...B,
                    dir: z.dir,
                    orientation: "vertical",
                    loop: g,
                    currentTabStopId: D,
                    onCurrentTabStopIdChange: F,
                    onEntryFocus: (0, e.mK)(o, (a) => {
                      z.isUsingKeyboardRef.current || a.preventDefault();
                    }),
                    preventScrollOnEntryFocus: !0,
                    children: (0, t.jsx)(p.UC, {
                      role: "menu",
                      "aria-orientation": "vertical",
                      "data-state": aS(y.open),
                      "data-radix-menu-content": "",
                      dir: z.dir,
                      ...A,
                      ...x,
                      ref: H,
                      style: { outline: "none", ...x.style },
                      onKeyDown: (0, e.mK)(x.onKeyDown, (a) => {
                        let b = a.target.closest("[data-radix-menu-content]") === a.currentTarget,
                          c = a.ctrlKey || a.altKey || a.metaKey,
                          d = 1 === a.key.length;
                        b &&
                          ("Tab" === a.key && a.preventDefault(),
                          !c &&
                            d &&
                            ((a) => {
                              let b = J.current + a,
                                c = C().filter((a) => !a.disabled),
                                d = document.activeElement,
                                e = c.find((a) => a.ref.current === d)?.textValue,
                                f = (function (a, b, c) {
                                  var d;
                                  let e =
                                      b.length > 1 && Array.from(b).every((a) => a === b[0])
                                        ? b[0]
                                        : b,
                                    f = c ? a.indexOf(c) : -1,
                                    g =
                                      ((d = Math.max(f, 0)),
                                      a.map((b, c) => a[(d + c) % a.length]));
                                  1 === e.length && (g = g.filter((a) => a !== c));
                                  let h = g.find((a) =>
                                    a.toLowerCase().startsWith(e.toLowerCase()),
                                  );
                                  return h !== c ? h : void 0;
                                })(
                                  c.map((a) => a.textValue),
                                  b,
                                  e,
                                ),
                                g = c.find((a) => a.textValue === f)?.ref.current;
                              (!(function a(b) {
                                ((J.current = b),
                                  window.clearTimeout(I.current),
                                  "" !== b && (I.current = window.setTimeout(() => a(""), 1e3)));
                              })(b),
                                g && setTimeout(() => g.focus()));
                            })(a.key));
                        let e = G.current;
                        if (a.target !== e || !Q.includes(a.key)) return;
                        a.preventDefault();
                        let f = C()
                          .filter((a) => !a.disabled)
                          .map((a) => a.ref.current);
                        (P.includes(a.key) && f.reverse(),
                          (function (a) {
                            let b = document.activeElement;
                            for (let c of a)
                              if (c === b || (c.focus(), document.activeElement !== b)) return;
                          })(f));
                      }),
                      onBlur: (0, e.mK)(a.onBlur, (a) => {
                        a.currentTarget.contains(a.target) ||
                          (window.clearTimeout(I.current), (J.current = ""));
                      }),
                      onPointerMove: (0, e.mK)(
                        a.onPointerMove,
                        aV((a) => {
                          let b = a.target,
                            c = O.current !== a.clientX;
                          a.currentTarget.contains(b) &&
                            c &&
                            ((M.current = a.clientX > O.current ? "right" : "left"),
                            (O.current = a.clientX));
                        }),
                      ),
                    }),
                  }),
                }),
              }),
            }),
          });
        });
      am.displayName = aj;
      var ar = d.forwardRef((a, b) => {
        let { __scopeMenu: c, ...d } = a;
        return (0, t.jsx)(i.sG.div, { role: "group", ...d, ref: b });
      });
      ar.displayName = "MenuGroup";
      var as = d.forwardRef((a, b) => {
        let { __scopeMenu: c, ...d } = a;
        return (0, t.jsx)(i.sG.div, { ...d, ref: b });
      });
      as.displayName = "MenuLabel";
      var at = "MenuItem",
        au = "menu.itemSelect",
        av = d.forwardRef((a, b) => {
          let { disabled: c = !1, onSelect: g, ...h } = a,
            j = d.useRef(null),
            k = ac(at, a.__scopeMenu),
            l = al(at, a.__scopeMenu),
            m = (0, f.s)(b, j),
            n = d.useRef(!1);
          return (0, t.jsx)(aw, {
            ...h,
            ref: m,
            disabled: c,
            onClick: (0, e.mK)(a.onClick, () => {
              let a = j.current;
              if (!c && a) {
                let b = new CustomEvent(au, { bubbles: !0, cancelable: !0 });
                (a.addEventListener(au, (a) => g?.(a), { once: !0 }),
                  (0, i.hO)(a, b),
                  b.defaultPrevented ? (n.current = !1) : k.onClose());
              }
            }),
            onPointerDown: (b) => {
              (a.onPointerDown?.(b), (n.current = !0));
            },
            onPointerUp: (0, e.mK)(a.onPointerUp, (a) => {
              n.current || a.currentTarget?.click();
            }),
            onKeyDown: (0, e.mK)(a.onKeyDown, (a) => {
              let b = "" !== l.searchRef.current;
              c ||
                (b && " " === a.key) ||
                (O.includes(a.key) && (a.currentTarget.click(), a.preventDefault()));
            }),
          });
        });
      av.displayName = at;
      var aw = d.forwardRef((a, b) => {
          let { __scopeMenu: c, disabled: g = !1, textValue: h, ...j } = a,
            k = al(at, c),
            l = $(c),
            m = d.useRef(null),
            n = (0, f.s)(b, m),
            [o, p] = d.useState(!1),
            [q, r] = d.useState("");
          return (
            d.useEffect(() => {
              let a = m.current;
              a && r((a.textContent ?? "").trim());
            }, [j.children]),
            (0, t.jsx)(U.ItemSlot, {
              scope: c,
              disabled: g,
              textValue: h ?? q,
              children: (0, t.jsx)(H, {
                asChild: !0,
                ...l,
                focusable: !g,
                children: (0, t.jsx)(i.sG.div, {
                  role: "menuitem",
                  "data-highlighted": o ? "" : void 0,
                  "aria-disabled": g || void 0,
                  "data-disabled": g ? "" : void 0,
                  ...j,
                  ref: n,
                  onPointerMove: (0, e.mK)(
                    a.onPointerMove,
                    aV((a) => {
                      g
                        ? k.onItemLeave(a)
                        : (k.onItemEnter(a),
                          a.defaultPrevented || a.currentTarget.focus({ preventScroll: !0 }));
                    }),
                  ),
                  onPointerLeave: (0, e.mK)(
                    a.onPointerLeave,
                    aV((a) => k.onItemLeave(a)),
                  ),
                  onFocus: (0, e.mK)(a.onFocus, () => p(!0)),
                  onBlur: (0, e.mK)(a.onBlur, () => p(!1)),
                }),
              }),
            })
          );
        }),
        ax = d.forwardRef((a, b) => {
          let { checked: c = !1, onCheckedChange: d, ...f } = a;
          return (0, t.jsx)(aF, {
            scope: a.__scopeMenu,
            checked: c,
            children: (0, t.jsx)(av, {
              role: "menuitemcheckbox",
              "aria-checked": aT(c) ? "mixed" : c,
              ...f,
              ref: b,
              "data-state": aU(c),
              onSelect: (0, e.mK)(f.onSelect, () => d?.(!!aT(c) || !c), {
                checkForDefaultPrevented: !1,
              }),
            }),
          });
        });
      ax.displayName = "MenuCheckboxItem";
      var ay = "MenuRadioGroup",
        [az, aA] = X(ay, { value: void 0, onValueChange: () => {} }),
        aB = d.forwardRef((a, b) => {
          let { value: c, onValueChange: d, ...e } = a,
            f = (0, s.c)(d);
          return (0, t.jsx)(az, {
            scope: a.__scopeMenu,
            value: c,
            onValueChange: f,
            children: (0, t.jsx)(ar, { ...e, ref: b }),
          });
        });
      aB.displayName = ay;
      var aC = "MenuRadioItem",
        aD = d.forwardRef((a, b) => {
          let { value: c, ...d } = a,
            f = aA(aC, a.__scopeMenu),
            g = c === f.value;
          return (0, t.jsx)(aF, {
            scope: a.__scopeMenu,
            checked: g,
            children: (0, t.jsx)(av, {
              role: "menuitemradio",
              "aria-checked": g,
              ...d,
              ref: b,
              "data-state": aU(g),
              onSelect: (0, e.mK)(d.onSelect, () => f.onValueChange?.(c), {
                checkForDefaultPrevented: !1,
              }),
            }),
          });
        });
      aD.displayName = aC;
      var aE = "MenuItemIndicator",
        [aF, aG] = X(aE, { checked: !1 }),
        aH = d.forwardRef((a, b) => {
          let { __scopeMenu: c, forceMount: d, ...e } = a,
            f = aG(aE, c);
          return (0, t.jsx)(r.C, {
            present: d || aT(f.checked) || !0 === f.checked,
            children: (0, t.jsx)(i.sG.span, { ...e, ref: b, "data-state": aU(f.checked) }),
          });
        });
      aH.displayName = aE;
      var aI = d.forwardRef((a, b) => {
        let { __scopeMenu: c, ...d } = a;
        return (0, t.jsx)(i.sG.div, {
          role: "separator",
          "aria-orientation": "horizontal",
          ...d,
          ref: b,
        });
      });
      aI.displayName = "MenuSeparator";
      var aJ = d.forwardRef((a, b) => {
        let { __scopeMenu: c, ...d } = a,
          e = Z(c);
        return (0, t.jsx)(p.i3, { ...e, ...d, ref: b });
      });
      aJ.displayName = "MenuArrow";
      var aK = "MenuSub",
        [aL, aM] = X(aK),
        aN = (a) => {
          let { __scopeMenu: b, children: c, open: e = !1, onOpenChange: f } = a,
            g = aa(aK, b),
            h = Z(b),
            [i, j] = d.useState(null),
            [k, l] = d.useState(null),
            m = (0, s.c)(f);
          return (
            d.useEffect(() => (!1 === g.open && m(!1), () => m(!1)), [g.open, m]),
            (0, t.jsx)(p.bL, {
              ...h,
              children: (0, t.jsx)(_, {
                scope: b,
                open: e,
                onOpenChange: m,
                content: k,
                onContentChange: l,
                children: (0, t.jsx)(aL, {
                  scope: b,
                  contentId: (0, o.B)(),
                  triggerId: (0, o.B)(),
                  trigger: i,
                  onTriggerChange: j,
                  children: c,
                }),
              }),
            })
          );
        };
      aN.displayName = aK;
      var aO = "MenuSubTrigger",
        aP = d.forwardRef((a, b) => {
          let c = aa(aO, a.__scopeMenu),
            g = ac(aO, a.__scopeMenu),
            h = aM(aO, a.__scopeMenu),
            i = al(aO, a.__scopeMenu),
            j = d.useRef(null),
            { pointerGraceTimerRef: k, onPointerGraceIntentChange: l } = i,
            m = { __scopeMenu: a.__scopeMenu },
            n = d.useCallback(() => {
              (j.current && window.clearTimeout(j.current), (j.current = null));
            }, []);
          return (
            d.useEffect(() => n, [n]),
            d.useEffect(() => {
              let a = k.current;
              return () => {
                (window.clearTimeout(a), l(null));
              };
            }, [k, l]),
            (0, t.jsx)(ae, {
              asChild: !0,
              ...m,
              children: (0, t.jsx)(aw, {
                id: h.triggerId,
                "aria-haspopup": "menu",
                "aria-expanded": c.open,
                "aria-controls": h.contentId,
                "data-state": aS(c.open),
                ...a,
                ref: (0, f.t)(b, h.onTriggerChange),
                onClick: (b) => {
                  (a.onClick?.(b),
                    a.disabled ||
                      b.defaultPrevented ||
                      (b.currentTarget.focus(), c.open || c.onOpenChange(!0)));
                },
                onPointerMove: (0, e.mK)(
                  a.onPointerMove,
                  aV((b) => {
                    (i.onItemEnter(b),
                      !b.defaultPrevented &&
                        (a.disabled ||
                          c.open ||
                          j.current ||
                          (i.onPointerGraceIntentChange(null),
                          (j.current = window.setTimeout(() => {
                            (c.onOpenChange(!0), n());
                          }, 100)))));
                  }),
                ),
                onPointerLeave: (0, e.mK)(
                  a.onPointerLeave,
                  aV((a) => {
                    n();
                    let b = c.content?.getBoundingClientRect();
                    if (b) {
                      let d = c.content?.dataset.side,
                        e = "right" === d,
                        f = b[e ? "left" : "right"],
                        g = b[e ? "right" : "left"];
                      (i.onPointerGraceIntentChange({
                        area: [
                          { x: a.clientX + (e ? -5 : 5), y: a.clientY },
                          { x: f, y: b.top },
                          { x: g, y: b.top },
                          { x: g, y: b.bottom },
                          { x: f, y: b.bottom },
                        ],
                        side: d,
                      }),
                        window.clearTimeout(k.current),
                        (k.current = window.setTimeout(
                          () => i.onPointerGraceIntentChange(null),
                          300,
                        )));
                    } else {
                      if ((i.onTriggerLeave(a), a.defaultPrevented)) return;
                      i.onPointerGraceIntentChange(null);
                    }
                  }),
                ),
                onKeyDown: (0, e.mK)(a.onKeyDown, (b) => {
                  let d = "" !== i.searchRef.current;
                  a.disabled ||
                    (d && " " === b.key) ||
                    (R[g.dir].includes(b.key) &&
                      (c.onOpenChange(!0), c.content?.focus(), b.preventDefault()));
                }),
              }),
            })
          );
        });
      aP.displayName = aO;
      var aQ = "MenuSubContent",
        aR = d.forwardRef((a, b) => {
          let c = ah(aj, a.__scopeMenu),
            { forceMount: g = c.forceMount, ...h } = a,
            i = aa(aj, a.__scopeMenu),
            j = ac(aj, a.__scopeMenu),
            k = aM(aQ, a.__scopeMenu),
            l = d.useRef(null),
            m = (0, f.s)(b, l);
          return (0, t.jsx)(U.Provider, {
            scope: a.__scopeMenu,
            children: (0, t.jsx)(r.C, {
              present: g || i.open,
              children: (0, t.jsx)(U.Slot, {
                scope: a.__scopeMenu,
                children: (0, t.jsx)(aq, {
                  id: k.contentId,
                  "aria-labelledby": k.triggerId,
                  ...h,
                  ref: m,
                  align: "start",
                  side: "rtl" === j.dir ? "left" : "right",
                  disableOutsidePointerEvents: !1,
                  disableOutsideScroll: !1,
                  trapFocus: !1,
                  onOpenAutoFocus: (a) => {
                    (j.isUsingKeyboardRef.current && l.current?.focus(), a.preventDefault());
                  },
                  onCloseAutoFocus: (a) => a.preventDefault(),
                  onFocusOutside: (0, e.mK)(a.onFocusOutside, (a) => {
                    a.target !== k.trigger && i.onOpenChange(!1);
                  }),
                  onEscapeKeyDown: (0, e.mK)(a.onEscapeKeyDown, (a) => {
                    (j.onClose(), a.preventDefault());
                  }),
                  onKeyDown: (0, e.mK)(a.onKeyDown, (a) => {
                    let b = a.currentTarget.contains(a.target),
                      c = S[j.dir].includes(a.key);
                    b && c && (i.onOpenChange(!1), k.trigger?.focus(), a.preventDefault());
                  }),
                }),
              }),
            }),
          });
        });
      function aS(a) {
        return a ? "open" : "closed";
      }
      function aT(a) {
        return "indeterminate" === a;
      }
      function aU(a) {
        return aT(a) ? "indeterminate" : a ? "checked" : "unchecked";
      }
      function aV(a) {
        return (b) => ("mouse" === b.pointerType ? a(b) : void 0);
      }
      aR.displayName = aQ;
      var aW = "DropdownMenu",
        [aX, aY] = (0, g.A)(aW, [Y]),
        aZ = Y(),
        [a$, a_] = aX(aW),
        a0 = (a) => {
          let {
              __scopeDropdownMenu: b,
              children: c,
              dir: e,
              open: f,
              defaultOpen: g,
              onOpenChange: i,
              modal: j = !0,
            } = a,
            k = aZ(b),
            l = d.useRef(null),
            [m, n] = (0, h.i)({ prop: f, defaultProp: g ?? !1, onChange: i, caller: aW });
          return (0, t.jsx)(a$, {
            scope: b,
            triggerId: (0, o.B)(),
            triggerRef: l,
            contentId: (0, o.B)(),
            open: m,
            onOpenChange: n,
            onOpenToggle: d.useCallback(() => n((a) => !a), [n]),
            modal: j,
            children: (0, t.jsx)(ad, {
              ...k,
              open: m,
              onOpenChange: n,
              dir: e,
              modal: j,
              children: c,
            }),
          });
        };
      a0.displayName = aW;
      var a1 = "DropdownMenuTrigger",
        a2 = d.forwardRef((a, b) => {
          let { __scopeDropdownMenu: c, disabled: d = !1, ...g } = a,
            h = a_(a1, c),
            j = aZ(c);
          return (0, t.jsx)(ae, {
            asChild: !0,
            ...j,
            children: (0, t.jsx)(i.sG.button, {
              type: "button",
              id: h.triggerId,
              "aria-haspopup": "menu",
              "aria-expanded": h.open,
              "aria-controls": h.open ? h.contentId : void 0,
              "data-state": h.open ? "open" : "closed",
              "data-disabled": d ? "" : void 0,
              disabled: d,
              ...g,
              ref: (0, f.t)(b, h.triggerRef),
              onPointerDown: (0, e.mK)(a.onPointerDown, (a) => {
                !d &&
                  0 === a.button &&
                  !1 === a.ctrlKey &&
                  (h.onOpenToggle(), h.open || a.preventDefault());
              }),
              onKeyDown: (0, e.mK)(a.onKeyDown, (a) => {
                !d &&
                  (["Enter", " "].includes(a.key) && h.onOpenToggle(),
                  "ArrowDown" === a.key && h.onOpenChange(!0),
                  ["Enter", " ", "ArrowDown"].includes(a.key) && a.preventDefault());
              }),
            }),
          });
        });
      a2.displayName = a1;
      var a3 = (a) => {
        let { __scopeDropdownMenu: b, ...c } = a,
          d = aZ(b);
        return (0, t.jsx)(ai, { ...d, ...c });
      };
      a3.displayName = "DropdownMenuPortal";
      var a4 = "DropdownMenuContent",
        a5 = d.forwardRef((a, b) => {
          let { __scopeDropdownMenu: c, ...f } = a,
            g = a_(a4, c),
            h = aZ(c),
            i = d.useRef(!1);
          return (0, t.jsx)(am, {
            id: g.contentId,
            "aria-labelledby": g.triggerId,
            ...h,
            ...f,
            ref: b,
            onCloseAutoFocus: (0, e.mK)(a.onCloseAutoFocus, (a) => {
              (i.current || g.triggerRef.current?.focus(), (i.current = !1), a.preventDefault());
            }),
            onInteractOutside: (0, e.mK)(a.onInteractOutside, (a) => {
              let b = a.detail.originalEvent,
                c = 0 === b.button && !0 === b.ctrlKey,
                d = 2 === b.button || c;
              (!g.modal || d) && (i.current = !0);
            }),
            style: {
              ...a.style,
              "--radix-dropdown-menu-content-transform-origin":
                "var(--radix-popper-transform-origin)",
              "--radix-dropdown-menu-content-available-width":
                "var(--radix-popper-available-width)",
              "--radix-dropdown-menu-content-available-height":
                "var(--radix-popper-available-height)",
              "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)",
            },
          });
        });
      a5.displayName = a4;
      var a6 = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(ar, { ...e, ...d, ref: b });
      });
      a6.displayName = "DropdownMenuGroup";
      var a7 = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(as, { ...e, ...d, ref: b });
      });
      a7.displayName = "DropdownMenuLabel";
      var a8 = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(av, { ...e, ...d, ref: b });
      });
      a8.displayName = "DropdownMenuItem";
      var a9 = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(ax, { ...e, ...d, ref: b });
      });
      a9.displayName = "DropdownMenuCheckboxItem";
      var ba = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(aB, { ...e, ...d, ref: b });
      });
      ba.displayName = "DropdownMenuRadioGroup";
      var bb = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(aD, { ...e, ...d, ref: b });
      });
      bb.displayName = "DropdownMenuRadioItem";
      var bc = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(aH, { ...e, ...d, ref: b });
      });
      bc.displayName = "DropdownMenuItemIndicator";
      var bd = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(aI, { ...e, ...d, ref: b });
      });
      ((bd.displayName = "DropdownMenuSeparator"),
        (d.forwardRef((a, b) => {
          let { __scopeDropdownMenu: c, ...d } = a,
            e = aZ(c);
          return (0, t.jsx)(aJ, { ...e, ...d, ref: b });
        }).displayName = "DropdownMenuArrow"));
      var be = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(aP, { ...e, ...d, ref: b });
      });
      be.displayName = "DropdownMenuSubTrigger";
      var bf = d.forwardRef((a, b) => {
        let { __scopeDropdownMenu: c, ...d } = a,
          e = aZ(c);
        return (0, t.jsx)(aR, {
          ...e,
          ...d,
          ref: b,
          style: {
            ...a.style,
            "--radix-dropdown-menu-content-transform-origin":
              "var(--radix-popper-transform-origin)",
            "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
            "--radix-dropdown-menu-content-available-height":
              "var(--radix-popper-available-height)",
            "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
            "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)",
          },
        });
      });
      bf.displayName = "DropdownMenuSubContent";
      var bg = a0,
        bh = a2,
        bi = a3,
        bj = a5,
        bk = a6,
        bl = a7,
        bm = a8,
        bn = a9,
        bo = ba,
        bp = bb,
        bq = bc,
        br = bd,
        bs = (a) => {
          let { __scopeDropdownMenu: b, children: c, open: d, onOpenChange: e, defaultOpen: f } = a,
            g = aZ(b),
            [i, j] = (0, h.i)({
              prop: d,
              defaultProp: f ?? !1,
              onChange: e,
              caller: "DropdownMenuSub",
            });
          return (0, t.jsx)(aN, { ...g, open: i, onOpenChange: j, children: c });
        },
        bt = be,
        bu = bf;
    },
    38442: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("link-2", [
        ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
        ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
        ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }],
      ]);
    },
    47268: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("bell", [
        ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
        [
          "path",
          {
            d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
            key: "11g9vi",
          },
        ],
      ]);
    },
    49269: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("download", [
        ["path", { d: "M12 15V3", key: "m9g1x1" }],
        ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
        ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }],
      ]);
    },
    77850: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("layout-dashboard", [
        ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
        ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
        ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
        ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }],
      ]);
    },
    88285: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("search", [
        ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
        ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ]);
    },
    90133: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("circle", [
        ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
      ]);
    },
    94684: (a, b, c) => {
      c.d(b, { A: () => d });
      let d = (0, c(14959).A)("settings", [
        [
          "path",
          {
            d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
            key: "1i5ecw",
          },
        ],
        ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
      ]);
    },
    96386: (a, b, c) => {
      c.d(b, { X: () => f });
      var d = c(38301),
        e = c(68829);
      function f(a) {
        let [b, c] = d.useState(void 0);
        return (
          (0, e.N)(() => {
            if (a) {
              c({ width: a.offsetWidth, height: a.offsetHeight });
              let b = new ResizeObserver((b) => {
                let d, e;
                if (!Array.isArray(b) || !b.length) return;
                let f = b[0];
                if ("borderBoxSize" in f) {
                  let a = f.borderBoxSize,
                    b = Array.isArray(a) ? a[0] : a;
                  ((d = b.inlineSize), (e = b.blockSize));
                } else ((d = a.offsetWidth), (e = a.offsetHeight));
                c({ width: d, height: e });
              });
              return (b.observe(a, { box: "border-box" }), () => b.unobserve(a));
            }
            c(void 0);
          }, [a]),
          b
        );
      }
    },
  }));
