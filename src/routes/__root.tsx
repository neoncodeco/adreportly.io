import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-95"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FB Ads Analytics — Real-time Facebook Ads Insights for Agencies" },
      {
        name: "description",
        content:
          "Track Facebook ad campaigns in real time, generate beautiful PDF/CSV reports, and share secure read-only dashboards with clients. AES-256 encrypted, agency-grade.",
      },
      { property: "og:title", content: "FB Ads Analytics — Real-time Facebook Ads Insights for Agencies" },
      {
        property: "og:description",
        content: "Real-time Facebook ad analytics with secure shareable client reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FB Ads Analytics — Real-time Facebook Ads Insights for Agencies" },
      { name: "description", content: "AdSight Pro is a SaaS platform for Facebook Ads analytics, offering real-time ROI tracking and client reporting." },
      { property: "og:description", content: "AdSight Pro is a SaaS platform for Facebook Ads analytics, offering real-time ROI tracking and client reporting." },
      { name: "twitter:description", content: "AdSight Pro is a SaaS platform for Facebook Ads analytics, offering real-time ROI tracking and client reporting." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9e461043-3cf3-4c2e-b0ad-d0915984965b/id-preview-b3aa24a5--b0ebd5f4-f67a-4ade-9c4d-b97522b92343.lovable.app-1777655552849.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9e461043-3cf3-4c2e-b0ad-d0915984965b/id-preview-b3aa24a5--b0ebd5f4-f67a-4ade-9c4d-b97522b92343.lovable.app-1777655552849.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
