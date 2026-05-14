import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.endsWith("/callback/credentials")) {
    const rate = checkRateLimit({
      key: `auth:nextauth-credentials:ip:${getClientIp(request)}`,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
      );
    }
  }

  return handlers.POST(request);
}
