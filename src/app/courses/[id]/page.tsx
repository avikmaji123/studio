import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, BarChart, Star } from 'lucide-react';
import { courses } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type CoursePageProps = {
  params: {
    id: string;
  };
};

export default function CoursePage({ params }: CoursePageProps) {
  const course = courses.find(c => c.id === params.id);

  if (!course) {
    notFound();
  }

  const image = PlaceHolderImages.find(p => p.id === course.imageId);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="relative h-96 mb-8">
            {image && (
                <Image
                    src={image.imageUrl}
                    alt={course.title}
                    data-ai-hint={image.imageHint}
                    fill
                    className="object-cover rounded-xl"
                />
            )}
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">{course.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{course.description}</p>
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            <Accordion type="single" collapsible className="w-full">
              {course.lessons.map((lesson, index) => (
                <AccordionItem value={`item-${index}`} key={lesson.id}>
                  <AccordionTrigger>{lesson.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{lesson.duration}</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary" className="text-2xl font-bold w-full justify-center py-2">{course.price}</Badge>
              <Button className="w-full" size="lg">Enroll Now</Button>
              <div className="space-y-2 text-sm text-muted-foreground pt-4">
                <p className="flex items-center"><Star className="w-4 h-4 mr-2 text-yellow-400" /> 4.5 star rating</p>
                <p className="flex items-center"><BarChart className="w-4 h-4 mr-2" /> All levels</p>
                <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 8 hours total</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
