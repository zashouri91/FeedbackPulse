import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ResponseTrendChartProps {
  data: Array<{
    date: string;
    responses: number;
  }>;
  title?: string;
}

export function ResponseTrendChart({ data, title }: ResponseTrendChartProps) {
  return (
    <Card className="p-6">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              labelFormatter={(value) => format(new Date(value), 'PPP')}
              formatter={(value: number) => [value, 'Responses']}
            />
            <Line
              type="monotone"
              dataKey="responses"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}