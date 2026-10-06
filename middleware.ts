import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/pos", "/items", "/combos", "/receive", "/stock", "/locations", "/dashboard"];
const ADMIN_PAGES = ["/items", "/receive", "/combos", "/locations", "/dashboard", "/users"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!PROTECTED.some(p => path === p || path.startsWith(p + "/"))) return NextResponse.next();
  const session = req.cookies.get("better-auth.session_token")?.value
    ?? req.cookies.get("__Secure-better-auth.session_token")?.value;
  if (!session) {
    const url = req.nextUrl.clone(); url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  // Role gate for admin pages needs a session lookup; do a light check via /api/me only for admin pages
  if (ADMIN_PAGES.some(p => path === p || path.startsWith(p + "/"))) {
    try {
      const me = await fetch(new URL("/api/me", req.url), { headers: { cookie: req.headers.get("cookie") ?? "" } });
      const d = await me.json();
      const role = d?.user?.role;
      if (!["owner", "manager", "accountant", "store_keeper"].includes(role)) {
        const url = req.nextUrl.clone(); url.pathname = "/pos";
        return NextResponse.redirect(url);
      }
    } catch { /* fail open to page; APIs still enforce */ }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/pos/:path*", "/items/:path*", "/combos/:path*", "/receive/:path*", "/stock/:path*", "/locations/:path*", "/dashboard/:path*", "/users/:path*"] };
