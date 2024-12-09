import * as Sentry from '@sentry/react';
import { supabase } from './supabase';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initializeMonitoring() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/[^/]+\.feedbackpulse\.com/],
        }),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  console.error(error);
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
}

export async function captureEvent(
  eventName: string,
  properties?: Record<string, any>,
  userId?: string
) {
  try {
    await supabase.from('analytics_events').insert({
      event_name: eventName,
      properties,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    captureError(error as Error);
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (SENTRY_DSN) {
    Sentry.setUser({ id: userId, ...traits });
  }
}
