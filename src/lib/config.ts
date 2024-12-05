import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().url().optional(),
});

function validateEnv() {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
    VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Missing required environment variables');
  }
}

const env = validateEnv();

export const config = {
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  },
  sentry: {
    dsn: env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  },
  posthog: {
    key: env.VITE_POSTHOG_KEY,
    host: env.VITE_POSTHOG_HOST,
  },
} as const;