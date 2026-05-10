import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — “AdReportly” wordmark on brand ink + lime accent.
 */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#16181c",
        borderRadius: 36,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "#D8FF30",
          color: "#16181c",
          fontSize: 30,
          fontWeight: 900,
          lineHeight: 1,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        A
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          lineHeight: 1.05,
        }}
      >
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: "-0.02em",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          AdReportly
        </span>
        <span
          style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#D8FF30",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Facebook ads
        </span>
      </div>
    </div>,
    { ...size },
  );
}
