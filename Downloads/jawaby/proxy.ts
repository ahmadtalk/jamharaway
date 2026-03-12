import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  try {
    return handleI18nRouting(request);
  } catch (error) {
    console.error("Proxy invocation failed, bypassing i18n proxy:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|auth|.*\\..*).*)"],
};
