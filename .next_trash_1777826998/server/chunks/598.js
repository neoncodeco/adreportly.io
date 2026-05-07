"use strict";
((exports.id = 598),
  (exports.ids = [598]),
  (exports.modules = {
    12868: (a, b, c) => {
      c.d(b, { Q: () => i });
      var d = c(8283),
        e = c(57188),
        f = c(59296),
        g = c(16803),
        h = c(45802),
        i = (0, d.gu)({
          chartName: "AreaChart",
          GraphicalChild: e.G,
          axisComponents: [
            { axisType: "xAxis", AxisComp: f.W },
            { axisType: "yAxis", AxisComp: g.h },
          ],
          formatAxisMap: h.pr,
        });
    },
    57188: (a, b, c) => {
      c.d(b, { G: () => M });
      var d = c(38301),
        e = c.n(d),
        f = c(43249),
        g = c(75602),
        h = c(45862),
        i = c.n(h),
        j = c(57750),
        k = c.n(j),
        l = c(3575),
        m = c.n(l),
        n = c(63181),
        o = c.n(n),
        p = c(57820),
        q = c.n(p),
        r = c(6487),
        s = c(71189),
        t = c(55413),
        u = c(54322),
        v = c(4702),
        w = c(22688),
        x = c(26776),
        y = c(72677),
        z = ["layout", "type", "stroke", "connectNulls", "isRange", "ref"],
        A = ["key"];
      function B(a) {
        return (B =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (a) {
                return typeof a;
              }
            : function (a) {
                return a &&
                  "function" == typeof Symbol &&
                  a.constructor === Symbol &&
                  a !== Symbol.prototype
                  ? "symbol"
                  : typeof a;
              })(a);
      }
      function C(a, b) {
        if (null == a) return {};
        var c,
          d,
          e = (function (a, b) {
            if (null == a) return {};
            var c = {};
            for (var d in a)
              if (Object.prototype.hasOwnProperty.call(a, d)) {
                if (b.indexOf(d) >= 0) continue;
                c[d] = a[d];
              }
            return c;
          })(a, b);
        if (Object.getOwnPropertySymbols) {
          var f = Object.getOwnPropertySymbols(a);
          for (d = 0; d < f.length; d++)
            ((c = f[d]),
              !(b.indexOf(c) >= 0) &&
                Object.prototype.propertyIsEnumerable.call(a, c) &&
                (e[c] = a[c]));
        }
        return e;
      }
      function D() {
        return (D = Object.assign
          ? Object.assign.bind()
          : function (a) {
              for (var b = 1; b < arguments.length; b++) {
                var c = arguments[b];
                for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d]);
              }
              return a;
            }).apply(this, arguments);
      }
      function E(a, b) {
        var c = Object.keys(a);
        if (Object.getOwnPropertySymbols) {
          var d = Object.getOwnPropertySymbols(a);
          (b &&
            (d = d.filter(function (b) {
              return Object.getOwnPropertyDescriptor(a, b).enumerable;
            })),
            c.push.apply(c, d));
        }
        return c;
      }
      function F(a) {
        for (var b = 1; b < arguments.length; b++) {
          var c = null != arguments[b] ? arguments[b] : {};
          b % 2
            ? E(Object(c), !0).forEach(function (b) {
                K(a, b, c[b]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(c))
              : E(Object(c)).forEach(function (b) {
                  Object.defineProperty(a, b, Object.getOwnPropertyDescriptor(c, b));
                });
        }
        return a;
      }
      function G(a, b) {
        for (var c = 0; c < b.length; c++) {
          var d = b[c];
          ((d.enumerable = d.enumerable || !1),
            (d.configurable = !0),
            "value" in d && (d.writable = !0),
            Object.defineProperty(a, L(d.key), d));
        }
      }
      function H() {
        try {
          var a = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
        } catch (a) {}
        return (H = function () {
          return !!a;
        })();
      }
      function I(a) {
        return (I = Object.setPrototypeOf
          ? Object.getPrototypeOf.bind()
          : function (a) {
              return a.__proto__ || Object.getPrototypeOf(a);
            })(a);
      }
      function J(a, b) {
        return (J = Object.setPrototypeOf
          ? Object.setPrototypeOf.bind()
          : function (a, b) {
              return ((a.__proto__ = b), a);
            })(a, b);
      }
      function K(a, b, c) {
        return (
          (b = L(b)) in a
            ? Object.defineProperty(a, b, {
                value: c,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (a[b] = c),
          a
        );
      }
      function L(a) {
        var b = (function (a, b) {
          if ("object" != B(a) || !a) return a;
          var c = a[Symbol.toPrimitive];
          if (void 0 !== c) {
            var d = c.call(a, b || "default");
            if ("object" != B(d)) return d;
            throw TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === b ? String : Number)(a);
        })(a, "string");
        return "symbol" == B(b) ? b : b + "";
      }
      var M = (function (a) {
        var b, c;
        function d() {
          var a, b, c;
          if (!(this instanceof d)) throw TypeError("Cannot call a class as a function");
          for (var e = arguments.length, f = Array(e), g = 0; g < e; g++) f[g] = arguments[g];
          return (
            (b = d),
            (c = [].concat(f)),
            (b = I(b)),
            K(
              (a = (function (a, b) {
                if (b && ("object" === B(b) || "function" == typeof b)) return b;
                if (void 0 !== b)
                  throw TypeError("Derived constructors may only return object or undefined");
                var c = a;
                if (void 0 === c)
                  throw ReferenceError("this hasn't been initialised - super() hasn't been called");
                return c;
              })(
                this,
                H() ? Reflect.construct(b, c || [], I(this).constructor) : b.apply(this, c),
              )),
              "state",
              { isAnimationFinished: !0 },
            ),
            K(a, "id", (0, w.NF)("recharts-area-")),
            K(a, "handleAnimationEnd", function () {
              var b = a.props.onAnimationEnd;
              (a.setState({ isAnimationFinished: !0 }), i()(b) && b());
            }),
            K(a, "handleAnimationStart", function () {
              var b = a.props.onAnimationStart;
              (a.setState({ isAnimationFinished: !1 }), i()(b) && b());
            }),
            a
          );
        }
        if ("function" != typeof a && null !== a)
          throw TypeError("Super expression must either be null or a function");
        return (
          (d.prototype = Object.create(a && a.prototype, {
            constructor: { value: d, writable: !0, configurable: !0 },
          })),
          Object.defineProperty(d, "prototype", { writable: !1 }),
          a && J(d, a),
          (b = [
            {
              key: "renderDots",
              value: function (a, b, c) {
                var f = this.props.isAnimationActive,
                  g = this.state.isAnimationFinished;
                if (f && !g) return null;
                var h = this.props,
                  i = h.dot,
                  j = h.points,
                  k = h.dataKey,
                  l = (0, y.J9)(this.props, !1),
                  m = (0, y.J9)(i, !0),
                  n = j.map(function (a, b) {
                    var c = F(
                      F(F({ key: "dot-".concat(b), r: 3 }, l), m),
                      {},
                      {
                        index: b,
                        cx: a.x,
                        cy: a.y,
                        dataKey: k,
                        value: a.value,
                        payload: a.payload,
                        points: j,
                      },
                    );
                    return d.renderDotItem(i, c);
                  }),
                  o = {
                    clipPath: a ? "url(#clipPath-".concat(b ? "" : "dots-").concat(c, ")") : null,
                  };
                return e().createElement(t.W, D({ className: "recharts-area-dots" }, o), n);
              },
            },
            {
              key: "renderHorizontalRect",
              value: function (a) {
                var b = this.props,
                  c = b.baseLine,
                  d = b.points,
                  f = b.strokeWidth,
                  g = d[0].x,
                  h = d[d.length - 1].x,
                  i = a * Math.abs(g - h),
                  j = k()(
                    d.map(function (a) {
                      return a.y || 0;
                    }),
                  );
                return ((0, w.Et)(c) && "number" == typeof c
                  ? (j = Math.max(c, j))
                  : c &&
                    Array.isArray(c) &&
                    c.length &&
                    (j = Math.max(
                      k()(
                        c.map(function (a) {
                          return a.y || 0;
                        }),
                      ),
                      j,
                    )),
                (0, w.Et)(j))
                  ? e().createElement("rect", {
                      x: g < h ? g : g - i,
                      y: 0,
                      width: i,
                      height: Math.floor(j + (f ? parseInt("".concat(f), 10) : 1)),
                    })
                  : null;
              },
            },
            {
              key: "renderVerticalRect",
              value: function (a) {
                var b = this.props,
                  c = b.baseLine,
                  d = b.points,
                  f = b.strokeWidth,
                  g = d[0].y,
                  h = d[d.length - 1].y,
                  i = a * Math.abs(g - h),
                  j = k()(
                    d.map(function (a) {
                      return a.x || 0;
                    }),
                  );
                return ((0, w.Et)(c) && "number" == typeof c
                  ? (j = Math.max(c, j))
                  : c &&
                    Array.isArray(c) &&
                    c.length &&
                    (j = Math.max(
                      k()(
                        c.map(function (a) {
                          return a.x || 0;
                        }),
                      ),
                      j,
                    )),
                (0, w.Et)(j))
                  ? e().createElement("rect", {
                      x: 0,
                      y: g < h ? g : g - i,
                      width: j + (f ? parseInt("".concat(f), 10) : 1),
                      height: Math.floor(i),
                    })
                  : null;
              },
            },
            {
              key: "renderClipRect",
              value: function (a) {
                return "vertical" === this.props.layout
                  ? this.renderVerticalRect(a)
                  : this.renderHorizontalRect(a);
              },
            },
            {
              key: "renderAreaStatically",
              value: function (a, b, c, d) {
                var f = this.props,
                  g = f.layout,
                  h = f.type,
                  i = f.stroke,
                  j = f.connectNulls,
                  k = f.isRange,
                  l = (f.ref, C(f, z));
                return e().createElement(
                  t.W,
                  { clipPath: c ? "url(#clipPath-".concat(d, ")") : null },
                  e().createElement(
                    r.I,
                    D({}, (0, y.J9)(l, !0), {
                      points: a,
                      connectNulls: j,
                      type: h,
                      baseLine: b,
                      layout: g,
                      stroke: "none",
                      className: "recharts-area-area",
                    }),
                  ),
                  "none" !== i &&
                    e().createElement(
                      r.I,
                      D({}, (0, y.J9)(this.props, !1), {
                        className: "recharts-area-curve",
                        layout: g,
                        type: h,
                        connectNulls: j,
                        fill: "none",
                        points: a,
                      }),
                    ),
                  "none" !== i &&
                    k &&
                    e().createElement(
                      r.I,
                      D({}, (0, y.J9)(this.props, !1), {
                        className: "recharts-area-curve",
                        layout: g,
                        type: h,
                        connectNulls: j,
                        fill: "none",
                        points: b,
                      }),
                    ),
                );
              },
            },
            {
              key: "renderAreaWithAnimation",
              value: function (a, b) {
                var c = this,
                  d = this.props,
                  f = d.points,
                  h = d.baseLine,
                  i = d.isAnimationActive,
                  j = d.animationBegin,
                  k = d.animationDuration,
                  l = d.animationEasing,
                  n = d.animationId,
                  p = this.state,
                  q = p.prevPoints,
                  r = p.prevBaseLine;
                return e().createElement(
                  g.Ay,
                  {
                    begin: j,
                    duration: k,
                    isActive: i,
                    easing: l,
                    from: { t: 0 },
                    to: { t: 1 },
                    key: "area-".concat(n),
                    onAnimationEnd: this.handleAnimationEnd,
                    onAnimationStart: this.handleAnimationStart,
                  },
                  function (d) {
                    var g = d.t;
                    if (q) {
                      var i,
                        j = q.length / f.length,
                        k = f.map(function (a, b) {
                          var c = Math.floor(b * j);
                          if (q[c]) {
                            var d = q[c],
                              e = (0, w.Dj)(d.x, a.x),
                              f = (0, w.Dj)(d.y, a.y);
                            return F(F({}, a), {}, { x: e(g), y: f(g) });
                          }
                          return a;
                        });
                      return (
                        (i =
                          (0, w.Et)(h) && "number" == typeof h
                            ? (0, w.Dj)(r, h)(g)
                            : m()(h) || o()(h)
                              ? (0, w.Dj)(r, 0)(g)
                              : h.map(function (a, b) {
                                  var c = Math.floor(b * j);
                                  if (r[c]) {
                                    var d = r[c],
                                      e = (0, w.Dj)(d.x, a.x),
                                      f = (0, w.Dj)(d.y, a.y);
                                    return F(F({}, a), {}, { x: e(g), y: f(g) });
                                  }
                                  return a;
                                })),
                        c.renderAreaStatically(k, i, a, b)
                      );
                    }
                    return e().createElement(
                      t.W,
                      null,
                      e().createElement(
                        "defs",
                        null,
                        e().createElement(
                          "clipPath",
                          { id: "animationClipPath-".concat(b) },
                          c.renderClipRect(g),
                        ),
                      ),
                      e().createElement(
                        t.W,
                        { clipPath: "url(#animationClipPath-".concat(b, ")") },
                        c.renderAreaStatically(f, h, a, b),
                      ),
                    );
                  },
                );
              },
            },
            {
              key: "renderArea",
              value: function (a, b) {
                var c = this.props,
                  d = c.points,
                  e = c.baseLine,
                  f = c.isAnimationActive,
                  g = this.state,
                  h = g.prevPoints,
                  i = g.prevBaseLine,
                  j = g.totalLength;
                return f && d && d.length && ((!h && j > 0) || !q()(h, d) || !q()(i, e))
                  ? this.renderAreaWithAnimation(a, b)
                  : this.renderAreaStatically(d, e, a, b);
              },
            },
            {
              key: "render",
              value: function () {
                var a,
                  b = this.props,
                  c = b.hide,
                  d = b.dot,
                  g = b.points,
                  h = b.className,
                  i = b.top,
                  j = b.left,
                  k = b.xAxis,
                  l = b.yAxis,
                  n = b.width,
                  o = b.height,
                  p = b.isAnimationActive,
                  q = b.id;
                if (c || !g || !g.length) return null;
                var r = this.state.isAnimationFinished,
                  s = 1 === g.length,
                  v = (0, f.A)("recharts-area", h),
                  w = k && k.allowDataOverflow,
                  x = l && l.allowDataOverflow,
                  z = w || x,
                  A = m()(q) ? this.id : q,
                  B = null != (a = (0, y.J9)(d, !1)) ? a : { r: 3, strokeWidth: 2 },
                  C = B.r,
                  D = B.strokeWidth,
                  E = ((0, y.sT)(d) ? d : {}).clipDot,
                  F = void 0 === E || E,
                  G = 2 * (void 0 === C ? 3 : C) + (void 0 === D ? 2 : D);
                return e().createElement(
                  t.W,
                  { className: v },
                  w || x
                    ? e().createElement(
                        "defs",
                        null,
                        e().createElement(
                          "clipPath",
                          { id: "clipPath-".concat(A) },
                          e().createElement("rect", {
                            x: w ? j : j - n / 2,
                            y: x ? i : i - o / 2,
                            width: w ? n : 2 * n,
                            height: x ? o : 2 * o,
                          }),
                        ),
                        !F &&
                          e().createElement(
                            "clipPath",
                            { id: "clipPath-dots-".concat(A) },
                            e().createElement("rect", {
                              x: j - G / 2,
                              y: i - G / 2,
                              width: n + G,
                              height: o + G,
                            }),
                          ),
                      )
                    : null,
                  s ? null : this.renderArea(z, A),
                  (d || s) && this.renderDots(z, F, A),
                  (!p || r) && u.Z.renderCallByParent(this.props, g),
                );
              },
            },
          ]),
          (c = [
            {
              key: "getDerivedStateFromProps",
              value: function (a, b) {
                return a.animationId !== b.prevAnimationId
                  ? {
                      prevAnimationId: a.animationId,
                      curPoints: a.points,
                      curBaseLine: a.baseLine,
                      prevPoints: b.curPoints,
                      prevBaseLine: b.curBaseLine,
                    }
                  : a.points !== b.curPoints || a.baseLine !== b.curBaseLine
                    ? { curPoints: a.points, curBaseLine: a.baseLine }
                    : null;
              },
            },
          ]),
          b && G(d.prototype, b),
          c && G(d, c),
          Object.defineProperty(d, "prototype", { writable: !1 }),
          d
        );
      })(d.PureComponent);
      (K(M, "displayName", "Area"),
        K(M, "defaultProps", {
          stroke: "#3182bd",
          fill: "#3182bd",
          fillOpacity: 0.6,
          xAxisId: 0,
          yAxisId: 0,
          legendType: "line",
          connectNulls: !1,
          points: [],
          dot: !1,
          activeDot: !0,
          hide: !1,
          isAnimationActive: !v.m.isSsr,
          animationBegin: 0,
          animationDuration: 1500,
          animationEasing: "ease",
        }),
        K(M, "getBaseValue", function (a, b, c, d) {
          var e = a.layout,
            f = a.baseValue,
            g = b.props.baseValue,
            h = null != g ? g : f;
          if ((0, w.Et)(h) && "number" == typeof h) return h;
          var i = "horizontal" === e ? d : c,
            j = i.scale.domain();
          if ("number" === i.type) {
            var k = Math.max(j[0], j[1]),
              l = Math.min(j[0], j[1]);
            return "dataMin" === h
              ? l
              : "dataMax" === h || k < 0
                ? k
                : Math.max(Math.min(j[0], j[1]), 0);
          }
          return "dataMin" === h ? j[0] : "dataMax" === h ? j[1] : j[0];
        }),
        K(M, "getComposedData", function (a) {
          var b,
            c = a.props,
            d = a.item,
            e = a.xAxis,
            f = a.yAxis,
            g = a.xAxisTicks,
            h = a.yAxisTicks,
            i = a.bandSize,
            j = a.dataKey,
            k = a.stackedData,
            l = a.dataStartIndex,
            m = a.displayedData,
            n = a.offset,
            o = c.layout,
            p = k && k.length,
            q = M.getBaseValue(c, d, e, f),
            r = "horizontal" === o,
            s = !1,
            t = m.map(function (a, b) {
              p ? (c = k[l + b]) : Array.isArray((c = (0, x.kr)(a, j))) ? (s = !0) : (c = [q, c]);
              var c,
                d = null == c[1] || (p && null == (0, x.kr)(a, j));
              return r
                ? {
                    x: (0, x.nb)({ axis: e, ticks: g, bandSize: i, entry: a, index: b }),
                    y: d ? null : f.scale(c[1]),
                    value: c,
                    payload: a,
                  }
                : {
                    x: d ? null : e.scale(c[1]),
                    y: (0, x.nb)({ axis: f, ticks: h, bandSize: i, entry: a, index: b }),
                    value: c,
                    payload: a,
                  };
            });
          return (
            (b =
              p || s
                ? t.map(function (a) {
                    var b = Array.isArray(a.value) ? a.value[0] : null;
                    return r
                      ? { x: a.x, y: null != b && null != a.y ? f.scale(b) : null }
                      : { x: null != b ? e.scale(b) : null, y: a.y };
                  })
                : r
                  ? f.scale(q)
                  : e.scale(q)),
            F({ points: t, baseLine: b, layout: o, isRange: s }, n)
          );
        }),
        K(M, "renderDotItem", function (a, b) {
          var c;
          if (e().isValidElement(a)) c = e().cloneElement(a, b);
          else if (i()(a)) c = a(b);
          else {
            var d = (0, f.A)("recharts-area-dot", "boolean" != typeof a ? a.className : ""),
              g = b.key,
              h = C(b, A);
            c = e().createElement(s.c, D({}, h, { key: g, className: d }));
          }
          return c;
        }));
    },
    57495: (a, b, c) => {
      c.d(b, { d: () => E });
      var d = c(38301),
        e = c.n(d),
        f = c(45862),
        g = c.n(f),
        h = c(64214),
        i = c(22688),
        j = c(72677),
        k = c(26776),
        l = c(93970),
        m = c(69890),
        n = c(8882),
        o = ["x1", "y1", "x2", "y2", "key"],
        p = ["offset"];
      function q(a) {
        return (q =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (a) {
                return typeof a;
              }
            : function (a) {
                return a &&
                  "function" == typeof Symbol &&
                  a.constructor === Symbol &&
                  a !== Symbol.prototype
                  ? "symbol"
                  : typeof a;
              })(a);
      }
      function r(a, b) {
        var c = Object.keys(a);
        if (Object.getOwnPropertySymbols) {
          var d = Object.getOwnPropertySymbols(a);
          (b &&
            (d = d.filter(function (b) {
              return Object.getOwnPropertyDescriptor(a, b).enumerable;
            })),
            c.push.apply(c, d));
        }
        return c;
      }
      function s(a) {
        for (var b = 1; b < arguments.length; b++) {
          var c = null != arguments[b] ? arguments[b] : {};
          b % 2
            ? r(Object(c), !0).forEach(function (b) {
                var d, e, f;
                ((d = a),
                  (e = b),
                  (f = c[b]),
                  (e = (function (a) {
                    var b = (function (a, b) {
                      if ("object" != q(a) || !a) return a;
                      var c = a[Symbol.toPrimitive];
                      if (void 0 !== c) {
                        var d = c.call(a, b || "default");
                        if ("object" != q(d)) return d;
                        throw TypeError("@@toPrimitive must return a primitive value.");
                      }
                      return ("string" === b ? String : Number)(a);
                    })(a, "string");
                    return "symbol" == q(b) ? b : b + "";
                  })(e)) in d
                    ? Object.defineProperty(d, e, {
                        value: f,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0,
                      })
                    : (d[e] = f));
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(c))
              : r(Object(c)).forEach(function (b) {
                  Object.defineProperty(a, b, Object.getOwnPropertyDescriptor(c, b));
                });
        }
        return a;
      }
      function t() {
        return (t = Object.assign
          ? Object.assign.bind()
          : function (a) {
              for (var b = 1; b < arguments.length; b++) {
                var c = arguments[b];
                for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d]);
              }
              return a;
            }).apply(this, arguments);
      }
      function u(a, b) {
        if (null == a) return {};
        var c,
          d,
          e = (function (a, b) {
            if (null == a) return {};
            var c = {};
            for (var d in a)
              if (Object.prototype.hasOwnProperty.call(a, d)) {
                if (b.indexOf(d) >= 0) continue;
                c[d] = a[d];
              }
            return c;
          })(a, b);
        if (Object.getOwnPropertySymbols) {
          var f = Object.getOwnPropertySymbols(a);
          for (d = 0; d < f.length; d++)
            ((c = f[d]),
              !(b.indexOf(c) >= 0) &&
                Object.prototype.propertyIsEnumerable.call(a, c) &&
                (e[c] = a[c]));
        }
        return e;
      }
      var v = function (a) {
        var b = a.fill;
        if (!b || "none" === b) return null;
        var c = a.fillOpacity,
          d = a.x,
          f = a.y,
          g = a.width,
          h = a.height,
          i = a.ry;
        return e().createElement("rect", {
          x: d,
          y: f,
          ry: i,
          width: g,
          height: h,
          stroke: "none",
          fill: b,
          fillOpacity: c,
          className: "recharts-cartesian-grid-bg",
        });
      };
      function w(a, b) {
        var c;
        if (e().isValidElement(a)) c = e().cloneElement(a, b);
        else if (g()(a)) c = a(b);
        else {
          var d = b.x1,
            f = b.y1,
            h = b.x2,
            i = b.y2,
            k = b.key,
            l = u(b, o),
            m = (0, j.J9)(l, !1),
            n = (m.offset, u(m, p));
          c = e().createElement(
            "line",
            t({}, n, { x1: d, y1: f, x2: h, y2: i, fill: "none", key: k }),
          );
        }
        return c;
      }
      function x(a) {
        var b = a.x,
          c = a.width,
          d = a.horizontal,
          f = void 0 === d || d,
          g = a.horizontalPoints;
        if (!f || !g || !g.length) return null;
        var h = g.map(function (d, e) {
          return w(
            f,
            s(s({}, a), {}, { x1: b, y1: d, x2: b + c, y2: d, key: "line-".concat(e), index: e }),
          );
        });
        return e().createElement("g", { className: "recharts-cartesian-grid-horizontal" }, h);
      }
      function y(a) {
        var b = a.y,
          c = a.height,
          d = a.vertical,
          f = void 0 === d || d,
          g = a.verticalPoints;
        if (!f || !g || !g.length) return null;
        var h = g.map(function (d, e) {
          return w(
            f,
            s(s({}, a), {}, { x1: d, y1: b, x2: d, y2: b + c, key: "line-".concat(e), index: e }),
          );
        });
        return e().createElement("g", { className: "recharts-cartesian-grid-vertical" }, h);
      }
      function z(a) {
        var b = a.horizontalFill,
          c = a.fillOpacity,
          d = a.x,
          f = a.y,
          g = a.width,
          h = a.height,
          i = a.horizontalPoints,
          j = a.horizontal;
        if (!(void 0 === j || j) || !b || !b.length) return null;
        var k = i
          .map(function (a) {
            return Math.round(a + f - f);
          })
          .sort(function (a, b) {
            return a - b;
          });
        f !== k[0] && k.unshift(0);
        var l = k.map(function (a, i) {
          var j = k[i + 1] ? k[i + 1] - a : f + h - a;
          if (j <= 0) return null;
          var l = i % b.length;
          return e().createElement("rect", {
            key: "react-".concat(i),
            y: a,
            x: d,
            height: j,
            width: g,
            stroke: "none",
            fill: b[l],
            fillOpacity: c,
            className: "recharts-cartesian-grid-bg",
          });
        });
        return e().createElement(
          "g",
          { className: "recharts-cartesian-gridstripes-horizontal" },
          l,
        );
      }
      function A(a) {
        var b = a.vertical,
          c = a.verticalFill,
          d = a.fillOpacity,
          f = a.x,
          g = a.y,
          h = a.width,
          i = a.height,
          j = a.verticalPoints;
        if (!(void 0 === b || b) || !c || !c.length) return null;
        var k = j
          .map(function (a) {
            return Math.round(a + f - f);
          })
          .sort(function (a, b) {
            return a - b;
          });
        f !== k[0] && k.unshift(0);
        var l = k.map(function (a, b) {
          var j = k[b + 1] ? k[b + 1] - a : f + h - a;
          if (j <= 0) return null;
          var l = b % c.length;
          return e().createElement("rect", {
            key: "react-".concat(b),
            x: a,
            y: g,
            width: j,
            height: i,
            stroke: "none",
            fill: c[l],
            fillOpacity: d,
            className: "recharts-cartesian-grid-bg",
          });
        });
        return e().createElement("g", { className: "recharts-cartesian-gridstripes-vertical" }, l);
      }
      var B = function (a, b) {
          var c = a.xAxis,
            d = a.width,
            e = a.height,
            f = a.offset;
          return (0, k.PW)(
            (0, l.f)(
              s(
                s(s({}, m.u.defaultProps), c),
                {},
                { ticks: (0, k.Rh)(c, !0), viewBox: { x: 0, y: 0, width: d, height: e } },
              ),
            ),
            f.left,
            f.left + f.width,
            b,
          );
        },
        C = function (a, b) {
          var c = a.yAxis,
            d = a.width,
            e = a.height,
            f = a.offset;
          return (0, k.PW)(
            (0, l.f)(
              s(
                s(s({}, m.u.defaultProps), c),
                {},
                { ticks: (0, k.Rh)(c, !0), viewBox: { x: 0, y: 0, width: d, height: e } },
              ),
            ),
            f.top,
            f.top + f.height,
            b,
          );
        },
        D = {
          horizontal: !0,
          vertical: !0,
          stroke: "#ccc",
          fill: "none",
          verticalFill: [],
          horizontalFill: [],
        };
      function E(a) {
        var b,
          c,
          d,
          f,
          j,
          k,
          l = (0, n.yi)(),
          m = (0, n.rY)(),
          o = (0, n.hj)(),
          p = s(
            s({}, a),
            {},
            {
              stroke: null != (b = a.stroke) ? b : D.stroke,
              fill: null != (c = a.fill) ? c : D.fill,
              horizontal: null != (d = a.horizontal) ? d : D.horizontal,
              horizontalFill: null != (f = a.horizontalFill) ? f : D.horizontalFill,
              vertical: null != (j = a.vertical) ? j : D.vertical,
              verticalFill: null != (k = a.verticalFill) ? k : D.verticalFill,
              x: (0, i.Et)(a.x) ? a.x : o.left,
              y: (0, i.Et)(a.y) ? a.y : o.top,
              width: (0, i.Et)(a.width) ? a.width : o.width,
              height: (0, i.Et)(a.height) ? a.height : o.height,
            },
          ),
          r = p.x,
          u = p.y,
          w = p.width,
          E = p.height,
          F = p.syncWithTicks,
          G = p.horizontalValues,
          H = p.verticalValues,
          I = (0, n.pj)(),
          J = (0, n.$G)();
        if (
          !(0, i.Et)(w) ||
          w <= 0 ||
          !(0, i.Et)(E) ||
          E <= 0 ||
          !(0, i.Et)(r) ||
          r !== +r ||
          !(0, i.Et)(u) ||
          u !== +u
        )
          return null;
        var K = p.verticalCoordinatesGenerator || B,
          L = p.horizontalCoordinatesGenerator || C,
          M = p.horizontalPoints,
          N = p.verticalPoints;
        if ((!M || !M.length) && g()(L)) {
          var O = G && G.length,
            P = L(
              {
                yAxis: J ? s(s({}, J), {}, { ticks: O ? G : J.ticks }) : void 0,
                width: l,
                height: m,
                offset: o,
              },
              !!O || F,
            );
          ((0, h.R)(
            Array.isArray(P),
            "horizontalCoordinatesGenerator should return Array but instead it returned [".concat(
              q(P),
              "]",
            ),
          ),
            Array.isArray(P) && (M = P));
        }
        if ((!N || !N.length) && g()(K)) {
          var Q = H && H.length,
            R = K(
              {
                xAxis: I ? s(s({}, I), {}, { ticks: Q ? H : I.ticks }) : void 0,
                width: l,
                height: m,
                offset: o,
              },
              !!Q || F,
            );
          ((0, h.R)(
            Array.isArray(R),
            "verticalCoordinatesGenerator should return Array but instead it returned [".concat(
              q(R),
              "]",
            ),
          ),
            Array.isArray(R) && (N = R));
        }
        return e().createElement(
          "g",
          { className: "recharts-cartesian-grid" },
          e().createElement(v, {
            fill: p.fill,
            fillOpacity: p.fillOpacity,
            x: p.x,
            y: p.y,
            width: p.width,
            height: p.height,
            ry: p.ry,
          }),
          e().createElement(x, t({}, p, { offset: o, horizontalPoints: M, xAxis: I, yAxis: J })),
          e().createElement(y, t({}, p, { offset: o, verticalPoints: N, xAxis: I, yAxis: J })),
          e().createElement(z, t({}, p, { horizontalPoints: M })),
          e().createElement(A, t({}, p, { verticalPoints: N })),
        );
      }
      E.displayName = "CartesianGrid";
    },
  }));
