import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { config } from './config';

export const supabase = createClient<Database>(config.supabase.url, config.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
});

// Add error handling for connection issues
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    supabase.channel('*').unsubscribe();
  }
});
