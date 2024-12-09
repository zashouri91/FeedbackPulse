import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface NPSTrendChartProps {
  data: Array<{
    date: string;
    nps: number;
  }>;
  title?: string;
}

export function NPSTrendChart({ data, title }: NPSTrendChartProps) {
  return (
    <Card className="p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={value => format(new Date(value), 'MMM d')} />
            <YAxis domain={[-100, 100]} />
            <Tooltip
              labelFormatter={value => format(new Date(value), 'PPP')}
              formatter={(value: number) => [value, 'NPS']}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
            <Line
              type="monotone"
              dataKey="nps"
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
