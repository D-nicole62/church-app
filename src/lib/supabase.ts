import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
}

function readSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}

const supabaseUrl = readSupabaseUrl();
const supabasePublishableKey = readSupabasePublishableKey();

/** Public Supabase client (publishable key). Safe for read-oriented fallbacks. */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey)
    : null;

/** Server-only admin client. Never import from Client Components. */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && process.env.SUPABASE_SECRET_KEY
    ? createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY)
    : null;
