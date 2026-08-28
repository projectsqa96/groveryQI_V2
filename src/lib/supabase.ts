import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase connection details come exclusively from build-time env vars.
// (There is no localStorage fallback — this app stores no data on the
// device outside of what the Supabase SDK itself needs to keep the user
// signed in.)
export const getSupabaseConfig = () => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const url = metaEnv.VITE_SUPABASE_URL || '';
  const key = metaEnv.VITE_SUPABASE_ANON_KEY || '';
  return { url, key, isConfigured: !!(url && key) };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          // Keeps the auth session (access/refresh token) so the user isn't
          // forced to log in again on every page refresh. This is the auth
          // library's own session storage, not app data — no expenses,
          // products, or other records are ever cached outside Supabase.
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
};

export const resetSupabaseClient = () => {
  supabaseInstance = null;
};
