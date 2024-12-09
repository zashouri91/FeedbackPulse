import { useAuth } from './auth-provider';
import { LandingPage } from '@/pages/landing';
import { SignupPage } from '@/pages/auth/signup';
import { ResetPasswordPage } from '@/pages/auth/reset-password';
import { Dashboard } from '@/pages/dashboard';
import { FeedbackPage } from '@/pages/feedback';
import { ManagementPage } from '@/pages/management';
import { AnalyticsPage } from '@/pages/analytics';
import { SettingsPage } from '@/pages/settings';
import { AppLayout } from '@/components/layout/app-layout';
import { RouteErrorBoundary } from '@/components/error-boundary/route-error-boundary';
import { QueryErrorBoundary } from '@/components/error-boundary/query-error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SurveyTemplatesPage from '@/pages/survey-templates';
import { SurveyPage } from '@/components/surveys/survey-page';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';

const publicRouter = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/feedback',
    element: <FeedbackPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/survey/:templateId',
    element: <SurveyPage />,
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
          <Outlet />
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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen grid place-items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <RouterProvider router={user ? privateRouter : publicRouter} />;
}