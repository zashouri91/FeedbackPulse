import { z } from 'zod';

/**
 * Environment variable schema with runtime validation
 */
export const envSchema = z.object({
  // Required Supabase Configuration
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anonymous key is required')
    .refine((val) => val.startsWith('ey'), 'Invalid Supabase key format'),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required')
    .refine((val) => val.startsWith('ey'), 'Invalid Supabase key format'),

  // Optional Monitoring Services
  VITE_SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
  VITE_POSTHOG_KEY: z
    .string()
    .min(1, 'PostHog key must not be empty when provided')
    .optional(),
  VITE_POSTHOG_HOST: z.string().url('Invalid PostHog host URL').optional(),

  // Environment Mode
  MODE: z.enum(['development', 'production', 'test']),
});

/**
 * Type definition for environment variables
 * This is inferred from the schema to ensure type safety
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Type-safe environment configuration
 * This type represents the validated and processed environment configuration
 */
export interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  monitoring: {
    sentry?: {
      dsn: string;
      environment: string;
    };
    posthog?: {
      key: string;
      host: string;
    };
  };
  environment: 'development' | 'production' | 'test';
}
