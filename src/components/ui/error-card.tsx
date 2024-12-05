import { Card } from './card';
import { Button } from './button';
import { AlertTriangleIcon } from 'lucide-react';

interface ErrorCardProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function ErrorCard({ title, description, action }: ErrorCardProps) {
  return (
    <Card className="p-6 max-w-lg mx-auto">
      <div className="text-center">
        <AlertTriangleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        {action}
      </div>
    </Card>
  );
}