import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { Providers } from "./providers";
import "./globals.css";

function getMetadataBase(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const trimmed = raw.replace(/\/+$/, "");
  return new URL(`${trimmed}/`);
}

const defaultTitle = "AdReportly — Real-time Facebook Ads Insights for Agencies";
const defaultDescription =
  "Track Facebook ad campaigns in real time, generate beautiful PDF/CSV reports, and share secure read-only dashboards with clients. AES-256 encrypted, agency-grade.";

const ogImage =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9e461043-3cf3-4c2e-b0ad-d0915984965b/id-preview-b3aa24a5--b0ebd5f4-f67a-4ade-9c4d-b97522b92343.lovable.app-1777655552849.png";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: defaultTitle,
    template: "%s · AdReportly",
  },
  description: defaultDescription,
  applicationName: "AdReportly",
  keywords: [
    "AdReportly",
    "Facebook Ads",
    "Meta Ads",
    "agency reporting",
    "ad analytics",
    "ROAS",
    "PDF reports",
    "CSV export",
    "client dashboard",
    "share link",
    "Bangladesh",
    "BDT billing",
  ],
  authors: [{ name: "AdReportly", url: getMetadataBase().origin }],
  creator: "AdReportly",
  publisher: "AdReportly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "AdReportly",
    statusBarStyle: "default",
  },
  openGraph: {
    title: defaultTitle,
    description: "Real-time Facebook ad analytics with secure shareable client reports.",
    type: "website",
    siteName: "AdReportly",
    locale: "en_US",
    url: "/",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "AdReportly — Facebook Ads insights" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description:
      "AdReportly is a SaaS platform for Facebook Ads analytics, offering real-time ROI tracking and client reporting.",
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#16181c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
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
