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

const publicRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/signup',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SignupPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/feedback',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <FeedbackPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/survey/:templateId',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SurveyPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const privateRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <QueryErrorBoundary>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </AppLayout>
      </QueryErrorBoundary>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function Router() {
  const { user } = useAuth();
  return <RouterProvider router={user ? privateRouter : publicRouter} />;
}
