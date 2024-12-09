import { Card } from '@/components/ui/card';
import { useSurveys } from '@/lib/hooks/use-surveys';
import { calculateNPS } from '@/lib/utils/nps';
import { MetricCard } from '@/components/charts/metric-card';
import { ResponseTrendChart } from '@/components/charts/response-trend-chart';
import { RatingDistributionChart } from '@/components/charts/rating-distribution-chart';
import { NPSTrendChart } from '@/components/charts/nps-trend-chart';
import { LocationPerformanceChart } from '@/components/charts/location-performance-chart';
import { format, subDays } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorCard } from '@/components/ui/error-card';
import { BarChart3Icon, TrendingUpIcon, Users2Icon, BuildingIcon } from 'lucide-react';

export default function AnalyticsPage() {
  const { surveys, isLoading, error } = useSurveys();

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
        title="Error Loading Analytics"
        description="Failed to load analytics data. Please try again."
      />
    );
  }

  // Calculate metrics
  const totalResponses = surveys.reduce((acc, survey) => acc + (survey.responses?.length || 0), 0);
  const averageNPS = calculateNPS(surveys.flatMap(s => s.responses?.map(r => r.rating) || []));
  const responseRate = Math.round(
    (surveys.filter(s => s.responses?.length > 0).length / surveys.length) * 100
  );

  // Prepare chart data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    const responses = surveys.flatMap(s =>
      (s.responses || []).filter(
        r => format(new Date(r.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    );
    return {
      date: format(date, 'yyyy-MM-dd'),
      responses: responses.length,
      nps: calculateNPS(responses.map(r => r.rating)),
    };
  }).reverse();

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    count: surveys.flatMap(s => s.responses || []).filter(r => r.rating === i + 1).length,
  }));

  const locationPerformance = Array.from(new Set(surveys.map(s => s.location_id))).map(
    locationId => {
      const locationSurveys = surveys.filter(s => s.location_id === locationId);
      const responses = locationSurveys.flatMap(s => s.responses || []);
      return {
        location: locationId,
        responses: responses.length,
        nps: calculateNPS(responses.map(r => r.rating)),
      };
    }
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">Track your feedback performance and trends</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Responses"
          value={totalResponses}
          icon={BarChart3Icon}
          trend={{
            value: 12,
            isPositive: true,
          }}
        />
        <MetricCard
          title="Average NPS"
          value={averageNPS}
          icon={TrendingUpIcon}
          trend={{
            value: 5,
            isPositive: true,
          }}
        />
        <MetricCard
          title="Response Rate"
          value={`${responseRate}%`}
          icon={Users2Icon}
          trend={{
            value: 3,
            isPositive: true,
          }}
        />
        <MetricCard
          title="Active Locations"
          value={locationPerformance.length}
          icon={BuildingIcon}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ResponseTrendChart data={last30Days} title="Response Trend (Last 30 Days)" />
        <NPSTrendChart data={last30Days} title="NPS Trend (Last 30 Days)" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RatingDistributionChart data={ratingDistribution} title="Rating Distribution" />
        <LocationPerformanceChart data={locationPerformance} title="Location Performance" />
      </div>
    </div>
  );
}
