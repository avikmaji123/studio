'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Course, Certificate, Enrollment } from '@/lib/types';
import { Eye, Users, BarChart, CheckCircle, Download, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { addDays, formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/navigation';


type CourseCardProps = {
  course: Course;
  isEnrolled: boolean;
  certificate?: Certificate | null;
  enrollment?: Enrollment | null;
};

export function CourseCard({ course, isEnrolled, certificate, enrollment }: CourseCardProps) {
  const { toast } = useToast();
  const router = useRouter();

  const CertificateMenuItem = () => {
    // If certificate exists, link to view it.
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
    
    // If quiz is disabled for the course, don't show the option.
    if(course.certificateSettings?.quizEnabled === false) {
        return null;
    }

    // Logic to handle taking the test or seeing countdown.
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
        // Redirect to the test page
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
    <Card className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl group h-full">
        <Link href={isEnrolled ? `/dashboard/downloads` : `/courses/${course.slug}`} className="relative aspect-video w-full block">
          {course.imageUrl ? (
               <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
              />
          ) : <Skeleton className="h-full w-full" />}
          
          <div className="absolute top-2 right-2 flex gap-1">
            {course.isNew && <Badge>New</Badge>}
            {course.isBestseller && <Badge variant="destructive">Bestseller</Badge>}
          </div>

        </Link>
        <CardHeader className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="flex items-center gap-1">
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
          <CardTitle className="line-clamp-2 text-base h-[2.5em] leading-tight">
            <Link href={isEnrolled ? `/dashboard/downloads` : `/courses/${course.slug}`} className="hover:underline">
              {course.title}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0 pb-2">
          <CardDescription className="line-clamp-2 text-sm">{course.shortDescription || course.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto">
          {isEnrolled ? (
             <div className="w-full flex items-center justify-between">
                <Badge className="bg-green-600 hover:bg-green-700 pointer-events-none text-green-50">
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount || 0}</span>
              </div>
              <div className="text-lg font-bold text-primary">
                  {course.price}
              </div>
            </>
          )}
        </CardFooter>
    </Card>
  );
}
