import { ErrorBoundary } from 'react-error-boundary';
import { ErrorCard } from '@/components/ui/error-card';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';

interface QueryErrorBoundaryProps {
  /** The child components to render */
  children: React.ReactNode;
  /** Custom fallback component to render when an error occurs */
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  /** Callback function called when the error boundary resets */
  onReset?: () => void;
}

const DefaultFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
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
);

export function QueryErrorBoundary({ 
  children, 
  fallback = DefaultFallback,
  onReset 
}: QueryErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <fallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}
