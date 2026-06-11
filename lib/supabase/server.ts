import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";
import { demoProfile } from "@/lib/demo-data";

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}

export type CurrentUser = Pick<User, "id" | "email"> & {
  isDemo?: boolean;
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: Parameters<(typeof cookieStore)["set"]>[2];
          }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server Components cannot always set cookies. Route handlers can.
            }
          });
        }
      }
    }
  );
}

export function createAdminSupabaseClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  if (!isSupabaseConfigured()) {
    return {
      id: demoProfile.id,
      email: "demo@greenstep.local",
      isDemo: true
    };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase!.auth.getUser();

  if (error || !user) {
    throw new AuthRequiredError();
  }

  return {
    id: user.id,
    email: user.email ?? undefined
  };
}
