import { createClient } from '@supabase/supabase-js';
import { publicSupabaseConfig } from '../config/supabase';
import type { Database } from '../types/database';

const url = import.meta.env.VITE_SUPABASE_URL || publicSupabaseConfig.url;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || publicSupabaseConfig.publishableKey;

export const supabase =
  url && key
    ? createClient<Database>(url, key, {
        auth: {
          storageKey: 'sonserina.auth.v1',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export function getSupabase() {
  if (!supabase) throw new Error('Portal indisponível.');
  return supabase;
}

export function authRedirectUrl() {
  return `${window.location.origin}${import.meta.env.BASE_URL}`;
}
