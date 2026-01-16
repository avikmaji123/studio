
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Course } from '@/lib/types';
import { Eye, Users, BarChart, CheckCircle, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type CourseCardProps = {
  course: Course;
  isEnrolled: boolean;
};

export function CourseCard({ course, isEnrolled }: CourseCardProps) {
  
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
          
          {/* Un-enrolled badges */}
          {!isEnrolled && (
            <div className="absolute top-2 right-2 flex gap-1">
              {course.isNew && <Badge>New</Badge>}
              {course.isBestseller && <Badge variant="destructive">Bestseller</Badge>}
            </div>
          )}

          {/* Enrolled overlay and badge */}
           {isEnrolled && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="default" className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-base px-4 py-2 border-none shadow-lg">
                <CheckCircle className="h-5 w-5" />
                Purchased
              </Badge>
            </div>
          )}
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
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course.enrollmentCount || 0}</span>
          </div>
           {isEnrolled ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/downloads">
                    <Download className="mr-2 h-4 w-4"/>
                    View Downloads
                </Link>
            </Button>
            ) : (
             <div className="text-lg font-bold text-primary">
                {course.price}
            </div>
            )}
        </CardFooter>
    </Card>
  );
}
