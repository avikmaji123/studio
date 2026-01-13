import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Course } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Eye, Users, BarChart } from 'lucide-react';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  const image = PlaceHolderImages.find(p => p.id === course.imageId);
  const isEnrolled = false; // Placeholder
  const progress = 30; // Placeholder

  return (
    <Card className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl group h-full">
      <Link href={`/courses/${course.id}`} className="flex flex-col h-full">
        <div className="relative aspect-square w-full">
          {image && (
               <Image
                  src={image.imageUrl}
                  alt={course.title}
                  data-ai-hint={image.imageHint}
                  fill
                  className="object-cover"
              />
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            {course.isNew && <Badge>New</Badge>}
            {course.isBestseller && <Badge variant="destructive">Bestseller</Badge>}
          </div>
           {isEnrolled && (
            <div className="absolute bottom-2 right-2 bg-background/80 rounded-full p-1">
              {/* Progress Ring Placeholder */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background: `conic-gradient(hsl(var(--primary)) ${progress * 3.6}deg, hsl(var(--muted)) 0deg)`}}>
                {progress}%
              </div>
            </div>
          )}
        </div>
        <CardHeader className="p-3">
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
          <CardTitle className="line-clamp-2 text-base h-12 leading-tight">{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-3 pt-0 pb-2 hidden sm:block">
          <CardDescription className="line-clamp-2 text-xs">{course.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course.enrollmentCount}</span>
          </div>
          <div className="text-base font-bold text-primary">
            {course.price}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
