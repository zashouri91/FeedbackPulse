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
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
              height={50}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              allowDecimals={false}
              width={50}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              labelFormatter={(value) => format(new Date(value), 'PPP')}
              formatter={(value: number) => [value, 'Responses']}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="responses"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}