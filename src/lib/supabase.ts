import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Credenciais não encontradas. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper: get the current authenticated user or null
 */
export async function getCurrentSupabaseUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('[Supabase] Error getting current user:', error.message);
    return null;
  }
  return user;
}

/**
 * Helper: listen to auth state changes
 */
export function onAuthChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
