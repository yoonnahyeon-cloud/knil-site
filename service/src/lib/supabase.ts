import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Null when the build has no Supabase settings: the app then runs entirely
// in browser storage, as the first preview did.
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
