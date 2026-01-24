'use client';

import type { Review } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './star-rating';
import { CheckCircle } from 'lucide-react';

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const fallback = review.userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <Card className="glass-card h-full flex flex-col rounded-xl overflow-hidden shadow-ambient transition-all duration-300 hover:shadow-glow hover:-translate-y-1.5 group">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-12 w-12 border-2 border-primary/50">
                <AvatarImage src={review.userAvatar} alt={review.userName} />
                <AvatarFallback className="text-xl bg-slate-700 text-white">{fallback}</AvatarFallback>
            </Avatar>
            <div>
                <h3 className="text-base font-bold text-foreground">{review.userName}</h3>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <StarRating rating={review.rating} className="text-yellow-400" />
                    <span>&middot;</span>
                    <span>{review.courseName}</span>
                </div>
            </div>
        </div>
        
        <p className="text-lg font-semibold text-foreground line-clamp-2 mb-2">{review.title}</p>
        
        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow min-h-[60px]">
            {`"${review.text}"`}
        </p>
        
        <div className="mt-auto pt-4">
             {review.isVerifiedPurchase && (
                <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
                    <CheckCircle className="h-3 w-3 mr-1.5"/>
                    Verified Purchase
                </Badge>
            )}
        </div>
      </div>
    </Card>
  );
}
