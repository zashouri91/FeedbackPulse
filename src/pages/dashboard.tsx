import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3Icon,
  Users2Icon,
  BuildingIcon,
  PlusIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { CreateSurvey } from '@/components/surveys/create-survey';
import { useSurveys } from '@/lib/hooks/use-surveys';
import { useAuth } from '@/components/auth-provider';
import { getUserRole } from '@/lib/utils/rbac';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorCard } from '@/components/ui/error-card';
import { calculateNPS } from '@/lib/utils/nps';
import { MetricCard } from '@/components/charts/metric-card';
import { ResponseTrendChart } from '@/components/charts/response-trend-chart';
import { RatingDistributionChart } from '@/components/charts/rating-distribution-chart';
import { format, subDays } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const { surveys, isLoading, error } = useSurveys();
  const userRole = getUserRole(user!);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Error Loading Dashboard"
        description="Failed to load dashboard data. Please try again."
      />
    );
  }

  // Calculate metrics
  const totalResponses = surveys.reduce(
    (acc, survey) => acc + (survey.responses?.length || 0),
    0
  );
  const activeSurveys = surveys.length;
  const locations = new Set(surveys.map((s) => s.location_id)).size;
  const averageNPS = calculateNPS(
    surveys.flatMap((s) => s.responses?.map((r) => r.rating) || [])
  );

  // Prepare chart data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    const responses = surveys.flatMap((s) =>
      (s.responses || []).filter(
        (r) => format(new Date(r.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    );
    return {
      date: format(date, 'yyyy-MM-dd'),
      responses: responses.length,
    };
  }).reverse();

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    count: surveys
      .flatMap((s) => s.responses || [])
      .filter((r) => r.rating === i + 1).length,
  }));

  // Role-specific metrics
  const roleMetrics = {
    super_admin: [
      {
        title: 'Total Responses',
        value: totalResponses,
        icon: BarChart3Icon,
        trend: {
          value: 12,
          isPositive: true,
        },
      },
      {
        title: 'Active Surveys',
        value: activeSurveys,
        icon: CheckCircleIcon,
      },
      {
        title: 'Locations',
        value: locations,
        icon: BuildingIcon,
      },
      {
        title: 'Average NPS',
        value: averageNPS,
        icon: TrendingUpIcon,
        trend: {
          value: 5,
          isPositive: true,
        },
      },
    ],
    admin: [
      {
        title: 'Total Responses',
        value: totalResponses,
        icon: BarChart3Icon,
      },
      {
        title: 'Active Surveys',
        value: activeSurveys,
        icon: CheckCircleIcon,
      },
      {
        title: 'Locations',
        value: locations,
        icon: BuildingIcon,
      },
    ],
    manager: [
      {
        title: 'Team Responses',
        value: totalResponses,
        icon: Users2Icon,
      },
      {
        title: 'Active Surveys',
        value: activeSurveys,
        icon: CheckCircleIcon,
      },
      {
        title: 'Response Rate',
        value: '85%',
        icon: TrendingUpIcon,
      },
    ],
    user: [
      {
        title: 'My Surveys',
        value: surveys.filter((s) => s.assignee_id === user?.id).length,
        icon: CheckCircleIcon,
      },
      {
        title: 'Pending Responses',
        value: surveys.filter((s) => !s.responses?.length).length,
        icon: AlertCircleIcon,
      },
    ],
  };

  const metrics = roleMetrics[userRole] || roleMetrics.user;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'super_admin') && <CreateSurvey />}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ResponseTrendChart
          data={last30Days}
          title="Response Trend (Last 30 Days)"
        />
        <RatingDistributionChart
          data={ratingDistribution}
          title="Rating Distribution"
        />
      </div>

      {surveys.length > 0 && (userRole === 'admin' || userRole === 'super_admin') && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Recent Surveys</h3>
            <Button variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="grid gap-4">
            {surveys.slice(0, 5).map((survey) => (
              <Card
                key={survey.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Survey #{survey.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Created at: {new Date(survey.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Responses: {survey.responses?.length || 0}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}