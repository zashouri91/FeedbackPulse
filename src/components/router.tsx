import { Suspense, lazy } from 'react';
import { useAuth } from './auth-provider';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/error-boundary/route-error-boundary';
import { QueryErrorBoundary } from '@/components/error-boundary/query-error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AppLayout } from '@/components/layout/app-layout';

// Lazy load all pages
const LandingPage = lazy(() => import('@/pages/landing'));
const SignupPage = lazy(() => import('@/pages/auth/signup'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const FeedbackPage = lazy(() => import('@/pages/feedback'));
const ManagementPage = lazy(() => import('@/pages/management'));
const AnalyticsPage = lazy(() => import('@/pages/analytics'));
const SettingsPage = lazy(() => import('@/pages/settings'));
const SurveyTemplatesPage = lazy(() => import('@/pages/survey-templates'));
const SurveyPage = lazy(() => import('@/components/surveys/survey-page'));

const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Auth guard component
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Public route guard
function RequireNoAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: (
      <RequireNoAuth>
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage />
        </Suspense>
      </RequireNoAuth>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/signup',
    element: (
      <RequireNoAuth>
        <Suspense fallback={<LoadingFallback />}>
          <SignupPage />
        </Suspense>
      </RequireNoAuth>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/reset-password',
    element: (
      <RequireNoAuth>
        <Suspense fallback={<LoadingFallback />}>
          <ResetPasswordPage />
        </Suspense>
      </RequireNoAuth>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // Protected routes
  {
    path: '/',
    element: (
      <RequireAuth>
        <QueryErrorBoundary>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </AppLayout>
        </QueryErrorBoundary>
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'feedback',
        element: <FeedbackPage />,
      },
      {
        path: 'management',
        element: <ManagementPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'templates',
        element: <SurveyTemplatesPage />,
      },
      {
        path: 'survey/:id',
        element: <SurveyPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function Router() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return <RouterProvider router={router} />;
}
