import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side supabase (uses anon key)
export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", anonKey || "placeholder");

// Server-side supabase admin (uses service role key — bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || anonKey || "placeholder",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
