import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { config } from './config';

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
