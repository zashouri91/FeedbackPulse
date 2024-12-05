import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';
import { ErrorCard } from '@/components/ui/error-card';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorCard
      title="Something went wrong"
      description={error.message || 'An unexpected error occurred'}
      action={
        <Button variant="outline" onClick={resetErrorBoundary}>
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      }
    />
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        if (import.meta.env.PROD) {
          Sentry.captureException(error, {
            extra: {
              componentStack: info.componentStack,
            },
          });
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}