// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/daftar", "/menunggu-verifikasi", "/aktivasi", "/api", "/"];

const ROLE_PREFIXES: Record<string, string[]> = {
  admin: ["/admin"],
  pembimbing: ["/pembimbing"],
  mahasiswa: ["/mahasiswa"],
};

const TOKEN_COOKIE = "mm_token";

function decodeJWT(token: string): { user: { role: string }; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    b64 += "=".repeat((4 - (b64.length % 4)) % 4);
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }


  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const decoded = decodeJWT(token);

  if (!decoded || Date.now() / 1000 > decoded.exp) {
    const url = new URL("/login", request.url);
    const response = NextResponse.redirect(url);
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  const userRole = decoded.user.role as string;

  for (const [role, prefixes] of Object.entries(ROLE_PREFIXES)) {
    if (prefixes.some((p) => pathname.startsWith(p))) {
      if (role !== userRole) {
        const defaultPath = ROLE_PREFIXES[userRole]?.[0] ?? "/login";
        return NextResponse.redirect(new URL(defaultPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
