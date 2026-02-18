import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("Les clés Supabase (URL, Anon Key, Service Key) sont manquantes dans le fichier .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for admin operations, only to be used in a secure environment (e.g., server-side or serverless functions)
// Exposing this key directly in client-side code is a SECURITY RISK.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
