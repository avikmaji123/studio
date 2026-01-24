'use client';

import type { Review } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './star-rating';

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const fallback = review.userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    // The main card container, matching the reference's rounded corners and shadow.
    <Card className="h-full flex flex-col rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:bg-[#0F1B2D] dark:border-slate-800">
      
      {/* Top Image Section with Avatar */}
      <div className="relative aspect-video w-full">
        {/* A gradient background similar to the reference's aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 dark:from-blue-900/70 dark:via-purple-900/70 dark:to-pink-900/70" />
        
        <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="h-28 w-28 border-4 border-white/50 shadow-lg">
                <AvatarImage src={review.userAvatar} alt={review.userName} />
                <AvatarFallback className="text-4xl bg-slate-700 text-white">{fallback}</AvatarFallback>
            </Avatar>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow bg-card">
        <h3 className="text-xl font-bold text-foreground">{review.userName}</h3>
        
        <div className="my-2 flex items-center gap-2">
            <StarRating rating={review.rating} className="text-yellow-400" />
            {review.isVerifiedPurchase && (
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-none text-xs">
                    Verified
                </Badge>
            )}
        </div>
        
        <p className="text-lg font-semibold text-foreground line-clamp-1">{review.title}</p>
        
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-grow h-[40px]">
            {review.text}
        </p>
        
        {/* Badge at the bottom, mimicking 'Short Course' tag */}
        <div className="mt-auto pt-4">
             <Badge variant="outline" className="w-auto">
                {review.courseName}
            </Badge>
        </div>
      </div>
    </Card>
  );
}
