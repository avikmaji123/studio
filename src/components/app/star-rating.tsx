'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
};

export function StarRating({
  rating,
  className,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            className={cn(
              'h-5 w-5',
              starValue <= rating ? 'fill-current' : 'fill-transparent',
              interactive && 'cursor-pointer transition-transform hover:scale-125'
            )}
            onClick={() => interactive && onRatingChange?.(starValue)}
          />
        );
      })}
    </div>
  );
}

    