import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * Props for the MetricCard component.
 */
interface MetricCardProps {
  /** Title of the metric */
  title: string;
  /** Current value of the metric */
  value: number;
  /** Format string for the value (e.g., '0.0%' for percentage) */
  format?: string;
  /** Icon component */
  icon: typeof LucideIcon;
  /** Whether the metric is currently loading */
  loading?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
  /** Trend information */
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({
  title,
  value,
  format = '0.0',
  icon: Icon,
  loading = false,
  className,
  trend
}: MetricCardProps) {
  return (
    <Card className={cn('p-6 hover:shadow-lg transition-shadow', className)}>
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                value.toLocaleString()
              )}
            </h3>
            {trend && (
              <div
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
