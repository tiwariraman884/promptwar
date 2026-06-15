import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Force Node.js runtime — Supabase SSR uses process.version which isn't
// available in Edge Runtime. This silences the Vercel build warning.
export const runtime = "nodejs";

/**
 * AUTH GATE — Global route protection middleware.
 *
 * RULE 1: "/" and ALL routes redirect to /auth if unauthenticated.
 * RULE 2: Only /auth, /auth/callback, and /auth/forgot are publicly accessible.
 *
 * The middleware checks both Supabase session (server-side, when configured)
 * and falls back to the "eco_user" localStorage cookie for the client-side
 * mock auth flow. Since middleware runs server-side and cannot read
 * localStorage directly, client-side guards in the AppShell handle the
 * localStorage check as a second layer.
 */

/* Routes that are accessible WITHOUT authentication */
const PUBLIC_PATHS = [
  "/auth",          // Sign In / Sign Up page
  "/auth/callback", // Supabase OAuth callback
  "/auth/forgot",   // Forgot password flow
];

function isPublicPath(pathname: string): boolean {
  // Exact match or the pathname starts with a public path followed by nothing or a slash
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // AUTH GATE: Allow public paths through without any auth check
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // When Supabase is not configured, the app uses client-side localStorage
  // auth only. Middleware cannot enforce that, so we let requests through
  // and rely on the client-side AuthGate wrapper in AppShell.
  if (!hasSupabaseEnv()) {
    return NextResponse.next();
  }

  // --- Supabase server-side auth check ---
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
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
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // AUTH GATE: No authenticated user → redirect to /auth with a ?next= param
  // so the user returns to their intended destination after sign-in.
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    // Preserve the originally-requested path so sign-in can redirect back
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on every route EXCEPT Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|data|sw.js|workbox-.*).*)"
  ]
};
