import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getProjectRefFromJwt(jwt: string): string | null {
  try {
    const payloadSegment = jwt.split(".")[1];
    if (!payloadSegment) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8")) as {
      ref?: string;
    };

    return payload.ref ?? null;
  } catch {
    return null;
  }
}

function resolveSupabaseUrl(): string | undefined {
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL.replace(/\/$/, "");
  }

  const ref =
    getProjectRefFromJwt(process.env.SUPABASE_ANON_KEY ?? "") ??
    getProjectRefFromJwt(process.env.SUPABASE_SERVICE_ROLE_KEY ?? "");

  return ref ? `https://${ref}.supabase.co` : undefined;
}

const supabaseUrl = resolveSupabaseUrl();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("SUPABASE_URL or SUPABASE_ANON_KEY is not set — Supabase client disabled");
}

/** Public client — safe for user-scoped operations (respects RLS). */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

/** Server-only admin client — bypasses RLS. Never expose to the frontend. */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

export function getSupabaseProjectRef(): string | null {
  if (!supabaseUrl) {
    return null;
  }

  const match = supabaseUrl.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}
