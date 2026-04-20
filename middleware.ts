import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(getSessionCookieName())?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
