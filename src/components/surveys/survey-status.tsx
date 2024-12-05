import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type SurveyStatusProps = {
  createdAt: string;
  responseCount: number;
};

export function SurveyStatus({ createdAt, responseCount }: SurveyStatusProps) {
  const isActive = true; // You can add expiration logic here

  return (
    <div className="flex items-center gap-4">
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Expired'}
      </Badge>
      <span className="text-sm text-muted-foreground">
        Created {format(new Date(createdAt), 'MMM d, yyyy')}
      </span>
      <span className="text-sm text-muted-foreground">
        {responseCount} {responseCount === 1 ? 'response' : 'responses'}
      </span>
    </div>
  );
}