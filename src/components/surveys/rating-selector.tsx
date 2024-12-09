import { Star, SmilePlus, Laugh } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingType = 'stars' | 'smileys' | 'emojis' | 'numbers';

/**
 * Props for the RatingSelector component.
 */
interface RatingSelectorProps {
  /** The type of rating UI to display (numeric, stars, or emoji) */
  type: RatingType;
  /** The minimum value for the rating scale */
  min: number;
  /** The maximum value for the rating scale */
  max: number;
  /** Callback function called when a rating is selected */
  onSelect: (rating: number) => void;
  /** Additional CSS classes to apply to the component */
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
      {items.map(rating => (
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
