import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface LocationPerformanceChartProps {
  data: Array<{
    location: string;
    responses: number;
    nps: number;
  }>;
  title?: string;
}

export function LocationPerformanceChart({ data, title }: LocationPerformanceChartProps) {
  return (
    <Card className="p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={[-100, 100]} />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="responses"
              fill="hsl(var(--chart-1))"
              name="Responses"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="nps"
              fill="hsl(var(--chart-2))"
              name="NPS"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
