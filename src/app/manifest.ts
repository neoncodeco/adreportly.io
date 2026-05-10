import type { MetadataRoute } from "next";

const description =
  "Real-time Facebook Ads insights, PDF/CSV reports, and secure client dashboards for agencies.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AdReportly — Facebook Ads for agencies",
    short_name: "AdReportly",
    description,
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#D8FF30",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        type: "image/png",
        sizes: "180x180",
        purpose: "any",
      },
    ],
  };
}
