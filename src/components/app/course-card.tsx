import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Course } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  const image = PlaceHolderImages.find(p => p.id === course.imageId);
  return (
    <Card className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl">
      <div className="relative h-48 w-full">
        {image && (
             <Image
                src={image.imageUrl}
                alt={course.title}
                data-ai-hint={image.imageHint}
                fill
                className="object-cover"
            />
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{course.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="secondary" className="text-lg font-bold">
          {course.price}
        </Badge>
        <Button asChild>
          <Link href={`/courses/${course.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
