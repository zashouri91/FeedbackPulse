import { toast } from 'sonner';
import * as Sentry from '@sentry/react';

export function handleError(error: unknown, context?: string) {
  const errorMessage = error instanceof Error ? error.message : 'An error occurred';
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(fullMessage, error);
  }

  // Report to Sentry in production
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: { context },
    });
  }

  // Show user-friendly toast
  toast.error(fullMessage);

  return fullMessage;
}
