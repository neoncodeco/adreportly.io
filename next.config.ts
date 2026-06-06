import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  "'wasm-unsafe-eval'",
  "blob:",
  "https://connect.facebook.net",
  "https://tawk.to",
  "https://*.tawk.to",
  ...(isProduction ? [] : ["'unsafe-eval'"]),
];

const styleSources = [
  "'self'",
  "'unsafe-inline'",
  "https://fonts.googleapis.com",
  "https://tawk.to",
  "https://*.tawk.to",
];

const fontSources = [
  "'self'",
  "data:",
  "https://fonts.gstatic.com",
  "https://tawk.to",
  "https://*.tawk.to",
];

const connectSources = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co",
  "https://graph.facebook.com",
  "https://www.facebook.com",
  "https://*.facebook.com",
  "https://lottie.host",
  "https://*.lottie.host",
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
  "https://tawk.to",
  "https://*.tawk.to",
  "wss://*.tawk.to",
  ...(isProduction ? [] : ["ws:", "http://localhost:*", "http://127.0.0.1:*"]),
];

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources.join(" ")}`,
  `script-src-elem ${scriptSources.join(" ")}`,
  `style-src ${styleSources.join(" ")}`,
  `style-src-elem ${styleSources.join(" ")}`,
  "img-src 'self' data: blob: https:",
  `font-src ${fontSources.join(" ")}`,
  `connect-src ${connectSources.join(" ")}`,
  "media-src 'self' data: blob: https:",
  "frame-src 'self' https://www.facebook.com https://*.facebook.com https://tawk.to https://*.tawk.to",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
