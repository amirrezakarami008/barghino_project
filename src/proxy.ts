import { NextResponse } from "next/server";

/**
 * Next.js 16 proxy (replaces middleware).
 * Auth guards for /dashboard will live here once session/API is ready.
 */
export function proxy() {
  // TODO: enforce auth session for dashboard routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
