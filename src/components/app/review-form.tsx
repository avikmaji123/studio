'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { StarRating } from './star-rating';
import { Loader2 } from 'lucide-react';
import type { Course, Review } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { moderateReview } from '@/ai/flows/moderate-review';
import { createLogEntry } from '@/lib/actions';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  text: z.string().min(10, 'Review must be at least 10 characters').max(1000),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

type ReviewFormProps = {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReviewForm({ course, open, onOpenChange }: ReviewFormProps) {
  const { user, profile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      text: '',
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    if (!user || !profile || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in to submit a review.' });
      return;
    }

    startTransition(async () => {
      try {
        const moderationResult = await moderateReview({
          reviewTitle: data.title,
          reviewText: data.text,
        });

        const reviewPayload: Omit<Review, 'id' | 'createdAt'> & { createdAt: any } = {
          userId: user.uid,
          courseId: course.id,
          userName: `${profile.firstName} ${profile.lastName}`,
          userAvatar: profile.profilePicture || user.photoURL,
          courseName: course.title,
          rating: data.rating,
          title: data.title,
          text: data.text,
          status: moderationResult.status,
          isVerifiedPurchase: true,
          source: 'user',
          moderationReason: moderationResult.reason,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(firestore, 'reviews'), reviewPayload);

        await createLogEntry({
          source: 'user',
          severity: 'info',
          message: `Review submitted for ${course.title}. Status: ${moderationResult.status}`,
          metadata: { userId: user.uid, courseId: course.id },
        });

        let toastMessage = 'Your review has been submitted for moderation.';
        if (moderationResult.status === 'approved') {
          toastMessage = 'Thank you! Your review has been published.';
        } else if (moderationResult.status === 'rejected') {
          toastMessage = 'Your review could not be published as it violates our content policy.';
        }
        
        toast({ title: 'Review Submitted', description: toastMessage });
        onOpenChange(false);
        form.reset();

      } catch (error) {
        console.error('Review submission failed:', error);
        toast({ variant: 'destructive', title: 'An error occurred', description: 'Could not submit your review. Please try again.' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a review for {course.title}</DialogTitle>
          <DialogDescription>
            Share your experience with the community. Your feedback helps others make informed decisions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <StarRating
                        rating={field.value}
                        onRatingChange={field.onChange}
                        className="text-yellow-400"
                        interactive
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title</FormLabel>
                  <FormControl><Input placeholder="e.g., A fantastic course!" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl><Textarea placeholder="Tell us about your experience..." rows={5} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    