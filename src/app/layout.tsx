import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { Providers } from "./providers";
import "./globals.css";

const ogImage =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9e461043-3cf3-4c2e-b0ad-d0915984965b/id-preview-b3aa24a5--b0ebd5f4-f67a-4ade-9c4d-b97522b92343.lovable.app-1777655552849.png";

export const metadata: Metadata = {
  title: "AdReportly — Real-time Facebook Ads Insights for Agencies",
  description:
    "Track Facebook ad campaigns in real time, generate beautiful PDF/CSV reports, and share secure read-only dashboards with clients. AES-256 encrypted, agency-grade.",
  openGraph: {
    title: "AdReportly — Real-time Facebook Ads Insights for Agencies",
    description: "Real-time Facebook ad analytics with secure shareable client reports.",
    type: "website",
    images: [{ url: ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdReportly — Real-time Facebook Ads Insights for Agencies",
    description:
      "AdReportly is a SaaS platform for Facebook Ads analytics, offering real-time ROI tracking and client reporting.",
    images: [ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <Providers>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
