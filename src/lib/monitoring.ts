import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';
import { config } from './config';

export function initializeMonitoring() {
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
    });
  }

  if (config.posthog.key) {
    posthog.init(config.posthog.key, {
      api_host: config.posthog.host || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (import.meta.env.DEV) posthog.debug();
      },
    });
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (config.posthog.key) {
    posthog.capture(eventName, properties);
  }
}