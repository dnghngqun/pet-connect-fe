import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  readonly?: boolean;
  onChange?: (rating: number) => void;
}

export default function ReviewStars({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  readonly = true,
  onChange,
}: ReviewStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const value = index + 1;
          const isFilled = value <= Math.floor(rating);
          const isHalf = !isFilled && value <= Math.ceil(rating) && rating % 1 !== 0;

          return (
            <button
              key={index}
              onClick={() => handleClick(value)}
              disabled={readonly}
              className={cn(
                'relative transition-transform',
                !readonly && 'hover:scale-110 cursor-pointer',
                readonly && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled && 'fill-yellow-400 text-yellow-400',
                  isHalf && 'fill-yellow-200 text-yellow-400',
                  !isFilled && !isHalf && 'fill-none text-gray-300'
                )}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
