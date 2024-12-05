import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface RatingDistributionChartProps {
  data: Array<{
    rating: number;
    count: number;
  }>;
  title?: string;
}

export function RatingDistributionChart({ data, title }: RatingDistributionChartProps) {
  return (
    <Card className="p-6">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [value, 'Responses']}
              labelFormatter={(value) => `Rating: ${value}`}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}