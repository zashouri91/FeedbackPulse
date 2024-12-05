import { useRouteError } from 'react-router-dom';
import { ErrorCard } from '@/components/ui/error-card';
import { Button } from '@/components/ui/button';
import { HomeIcon, RefreshCwIcon } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ErrorCard
        title="Something went wrong"
        description={error.message || 'An unexpected error occurred'}
        action={
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/'}>
              <HomeIcon className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        }
      />
    </div>
  );
}