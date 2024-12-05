import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FrownIcon,
  MehIcon,
  SmileIcon,
  HeartIcon,
  XCircleIcon,
} from 'lucide-react';

const ratings = [
  { value: 1, icon: XCircleIcon, label: 'Very Dissatisfied', color: 'text-red-500' },
  { value: 2, icon: FrownIcon, label: 'Dissatisfied', color: 'text-orange-500' },
  { value: 3, icon: MehIcon, label: 'Neutral', color: 'text-yellow-500' },
  { value: 4, icon: SmileIcon, label: 'Satisfied', color: 'text-green-500' },
  { value: 5, icon: HeartIcon, label: 'Very Satisfied', color: 'text-pink-500' },
] as const;

type EmojiRatingProps = {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function EmojiRating({ value, onChange, disabled }: EmojiRatingProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {ratings.map((rating) => (
        <Button
          key={rating.value}
          variant="ghost"
          size="lg"
          disabled={disabled}
          onClick={() => onChange(rating.value)}
          className={cn(
            'flex flex-col items-center p-6 hover:bg-muted transition-all duration-200 rounded-xl',
            value === rating.value ? 'scale-110 bg-primary text-primary-foreground hover:bg-primary/90' : rating.color,
            'hover:scale-105'
          )}
        >
          <rating.icon className="h-10 w-10 mb-3" />
          <span className="text-sm font-medium">{rating.label}</span>
        </Button>
      ))}
    </div>
  );
}