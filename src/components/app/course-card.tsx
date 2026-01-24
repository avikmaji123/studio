
'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Users, BarChart, CheckCircle, Download, Award, MessageSquare, Clock } from 'lucide-react';
import { addDays, formatDistanceToNowStrict } from 'date-fns';

import type { Course, Certificate, Enrollment, Review } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ReviewForm } from './review-form';
import { CountdownTimer } from './countdown-timer';

type CourseCardProps = {
  course: Course;
  isEnrolled: boolean;
  certificate?: Certificate | null;
  enrollment?: Enrollment | null;
  hasReviewed?: boolean;
};

export function CourseCard({ course, isEnrolled, certificate, enrollment, hasReviewed }: CourseCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const isOfferActive = course.discountPrice && course.offerEndDate && course.offerEndDate.toDate() > new Date();
  const displayPrice = isOfferActive ? course.discountPrice : course.price;
  const originalPrice = isOfferActive ? course.price : null;

  const CertificateMenuItem = () => {
    if (certificate) {
      return (
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/certificate/${certificate.certificateCode}`} target="_blank">
            <Award className="mr-2 h-4 w-4" />
            <span>View Certificate</span>
          </Link>
        </DropdownMenuItem>
      );
    }
    
    if(course.certificateSettings?.quizEnabled === false) {
        return null;
    }

    const handleSelect = (e: Event) => {
      e.preventDefault(); 

      if (!isEnrolled || !enrollment) {
        toast({ variant: "destructive", title: "Not Enrolled", description: "You must be enrolled to take the certificate test." });
        return;
      }

      const countdownDays = course.certificateSettings?.countdownDays ?? 0;
      const enrollmentDate = enrollment.enrollmentDate.toDate();
      const unlockDate = addDays(enrollmentDate, countdownDays);
      const now = new Date();

      if (now < unlockDate) {
        toast({
          title: "Certificate Test Locked",
          description: `This test unlocks ${formatDistanceToNowStrict(unlockDate, { addSuffix: true })}.`,
        });
      } else {
        router.push(`/certificate-test/${course.id}`);
      }
    };

    return (
      <DropdownMenuItem onSelect={handleSelect} className="cursor-pointer">
        <Award className="mr-2 h-4 w-4" />
        <span>Take Certificate Test</span>
      </DropdownMenuItem>
    );
  };
  
  return (
    <>
    <Card className="glass-card flex flex-col overflow-hidden h-full rounded-xl shadow-ambient transition-all duration-300 hover:shadow-glow hover:-translate-y-1 group">
        <Link href={isEnrolled ? `/dashboard/downloads` : `/courses/${course.slug}`} className="relative aspect-video w-full block overflow-hidden">
          {course.imageUrl ? (
               <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
          ) : <Skeleton className="h-full w-full" />}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div className="absolute top-3 right-3 flex gap-2">
            {isOfferActive && <Badge variant="destructive" className="shadow-lg animate-pulse">Sale!</Badge>}
            {course.isNew && <Badge variant="secondary" className="shadow-lg">New</Badge>}
            {course.isBestseller && <Badge className="bg-yellow-500 text-black shadow-lg">Bestseller</Badge>}
          </div>

        </Link>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Badge variant="secondary" className="flex items-center gap-1">
                <BarChart className="h-3 w-3" />
                {course.level || 'All Levels'}
            </Badge>
            {course.hasPreview && (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Preview
                </Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2 text-lg font-bold h-[3.25rem] leading-tight">
            <Link href={isEnrolled ? `/dashboard/downloads` : `/courses/${course.slug}`} className="hover:text-primary transition-colors">
              {course.title}
            </Link>
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm mt-1 flex-grow">{course.shortDescription || course.description}</CardDescription>
        
        {isOfferActive && course.offerEndDate && (
          <div className="mt-4 flex justify-center">
            <CountdownTimer endDate={course.offerEndDate.toDate()} />
          </div>
        )}

        <CardFooter className="p-0 pt-4 flex justify-between items-center mt-auto">
          {isEnrolled ? (
             <div className="w-full flex items-center justify-between">
                <Badge className="bg-green-600/20 text-green-400 border-green-600/50 pointer-events-none">
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Purchased
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      View Options
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard/downloads">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download Course</span>
                      </Link>
                    </DropdownMenuItem>
                    <CertificateMenuItem />
                    {!hasReviewed && (
                      <DropdownMenuItem onSelect={() => setIsReviewFormOpen(true)} className="cursor-pointer">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Write a Review</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount || 0}</span>
              </div>
              <div className="flex items-baseline gap-2">
                 {originalPrice && <span className="text-muted-foreground line-through text-base">{originalPrice}</span>}
                 <div className="text-xl font-bold gradient-text">
                    {displayPrice}
                </div>
              </div>
            </>
          )}
        </CardFooter>
        </div>
    </Card>
    <ReviewForm course={course} open={isReviewFormOpen} onOpenChange={setIsReviewFormOpen} />
    </>
  );
}
