import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { calculateNPS, getNPSCategory } from '@/lib/utils/nps';

type Response = {
  rating: number;
  timestamp: string;
};

type SurveyAnalyticsProps = {
  responses: Response[];
};

export function SurveyAnalytics({ responses }: SurveyAnalyticsProps) {
  const ratings = responses.map((r) => r.rating);
  const npsScore = calculateNPS(ratings);
  const npsCategory = getNPSCategory(npsScore);

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    count: ratings.filter((r) => r === i + 1).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">NPS Score</h3>
          <div className="text-4xl font-bold mb-2">{npsScore}</div>
          <div className={`text-sm ${npsCategory.color}`}>{npsCategory.label}</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Responses</h3>
          <div className="text-4xl font-bold">{responses.length}</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}