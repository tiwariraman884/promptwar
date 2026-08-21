import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getOrCreateRequestId } from "@/lib/request-id";

// Supabase SSR might emit process.version warnings, but we must use Edge runtime.

/**
 * AUTH GATE + SECURITY MIDDLEWARE
 *
 * RULE 1: Public paths are accessible without auth.
 * RULE 2: Protected paths require authentication.
 * RULE 3: Admin paths require auth (role checked in page via requirePermission).
 * RULE 4: x-client-ip header injected for audit logging.
 * RULE 5: Logged-in users redirected away from /auth.
 */

const PUBLIC_PATHS = [
  "/auth",
  "/auth/callback",
  "/auth/forgot",
  "/logo.webp",
  "/logo.png",
  "/offline.html",
];

const ADMIN_PATHS = ["/admin"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "0.0.0.0"
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Allow public paths through without any auth check
  // Generate or propagate request ID for all requests
  const requestId = getOrCreateRequestId(request.headers);

  if (isPublicPath(pathname)) {
    const response = NextResponse.next();
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // When Supabase is not configured, rely on client-side auth
  if (!hasSupabaseEnv()) {
    const hasLocalAuth = request.cookies.get("eco_auth")?.value === "true" || request.cookies.get("demo_session")?.value === "true";
    if (hasLocalAuth && pathname === "/auth") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    const response = NextResponse.next();
    response.headers.set("x-client-ip", getClientIP(request));
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // --- Supabase server-side auth check ---
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: Parameters<(typeof response.cookies)["set"]>[2];
          }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const hasLocalAuth = request.cookies.get("eco_auth")?.value === "true" || request.cookies.get("demo_session")?.value === "true";
  const isAuthenticated = Boolean(user) || hasLocalAuth;

  // Inject IP and request ID headers for audit logging and tracing
  response.headers.set("x-client-ip", getClientIP(request));
  response.headers.set("x-request-id", requestId);

  // Redirect logged-in users away from /auth to /dashboard
  if (isAuthenticated && pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow public paths through without any auth check
  if (isPublicPath(pathname)) {
    return response;
  }

  // Admin path: block unauthenticated access (role checked server-side in page)
  if (isAdminPath(pathname) && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Protected routes: redirect unauthenticated users to /auth
  if (!isAuthenticated && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|images|data|sw.js|workbox-.*|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|css|js|map)$).*)",
  ],
};
