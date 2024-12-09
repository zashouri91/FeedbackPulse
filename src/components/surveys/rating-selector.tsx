import { Star, SmilePlus, Laugh } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingType = 'stars' | 'smileys' | 'emojis' | 'numbers';

interface RatingSelectorProps {
  type: RatingType;
  min: number;
  max: number;
  onSelect: (rating: number) => void;
  className?: string;
}

const ratingIcons = {
  stars: Star,
  smileys: SmilePlus,
  emojis: Laugh,
};

export function RatingSelector({ type, min, max, onSelect, className }: RatingSelectorProps) {
  const Icon = type === 'numbers' ? null : ratingIcons[type];
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {items.map((rating) => (
        <button
          key={rating}
          onClick={() => onSelect(rating)}
          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-2"
        >
          {type === 'numbers' ? (
            <span className="text-2xl font-semibold">{rating}</span>
          ) : (
            Icon && (
              <Icon
                className={cn(
                  'w-8 h-8',
                  rating <= (max + min) / 2 ? 'text-destructive' : 'text-primary'
                )}
              />
            )
          )}
        </button>
      ))}
    </div>
  );
}
