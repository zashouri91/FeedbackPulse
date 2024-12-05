import { ErrorBoundary } from 'react-error-boundary';
import { ErrorCard } from '@/components/ui/error-card';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorCard
          title="Data Loading Error"
          description={error.message || 'Failed to load data'}
          action={
            <Button variant="outline" onClick={resetErrorBoundary}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          }
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}