'use client';

import type { Review } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './star-rating';

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const fallback = review.userName
    .split(' ')
    .map(n => n[0])
    .join('');

  const reviewDate = typeof review.createdAt === 'string' ? new Date(review.createdAt) : review.createdAt.toDate();

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-gray-900 border-slate-800 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center gap-4 p-5">
        <Avatar className="h-12 w-12 border-2 border-cyan-400/50">
          <AvatarImage src={review.userAvatar} alt={review.userName} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-base text-slate-100">{review.userName}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} className="text-cyan-400" />
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(reviewDate, { addSuffix: true })}
            </span>
          </div>
        </div>
        {review.isVerifiedPurchase && <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-none">Verified Purchase</Badge>}
      </CardHeader>
      <CardContent className="flex-grow p-5 pt-0">
        <h3 className="font-bold text-lg text-slate-50 mb-2">{review.title}</h3>
        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">{review.text}</p>
      </CardContent>
    </Card>
  );
}

    