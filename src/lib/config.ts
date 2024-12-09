import { envSchema, type EnvConfig } from './types/env';

/**
 * Validates environment variables and returns a type-safe configuration object
 * Throws detailed error messages if validation fails
 */
function validateEnv(): EnvConfig {
  try {
    // Get all environment variables
    const env = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
      VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
      VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
      MODE: import.meta.env.MODE,
    };

    // Validate environment variables against schema
    const validatedEnv = envSchema.parse(env);

    // Transform into strongly-typed configuration object
    return {
      supabase: {
        url: validatedEnv.VITE_SUPABASE_URL,
        anonKey: validatedEnv.VITE_SUPABASE_ANON_KEY,
        serviceRoleKey: validatedEnv.VITE_SUPABASE_SERVICE_ROLE_KEY,
      },
      monitoring: {
        ...(validatedEnv.VITE_SENTRY_DSN && {
          sentry: {
            dsn: validatedEnv.VITE_SENTRY_DSN,
            environment: validatedEnv.MODE,
          },
        }),
        ...(validatedEnv.VITE_POSTHOG_KEY &&
          validatedEnv.VITE_POSTHOG_HOST && {
            posthog: {
              key: validatedEnv.VITE_POSTHOG_KEY,
              host: validatedEnv.VITE_POSTHOG_HOST,
            },
          }),
      },
      environment: validatedEnv.MODE,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Environment validation failed:', error.message);
      throw new Error(`Invalid environment configuration: ${error.message}`);
    }
    throw error;
  }
}

// Initialize configuration immediately to catch any issues at startup
export const config = Object.freeze(validateEnv()) as EnvConfig;
