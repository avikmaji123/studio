
'use client';

import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Clock, BarChart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Course } from '@/lib/data';
import { collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export default function CoursePage() {
  const params = useParams();
  const slug = params.slug as string; // Ensure slug is a string
  const firestore = useFirestore();
  
  const courseQuery = useMemoFirebase(
    () => {
      if (!firestore || !slug) return null;
      return query(collection(firestore, 'courses'), where('slug', '==', slug), limit(1))
    },
    [firestore, slug]
  );
  
  const { data: courses, isLoading } = useCollection<Course>(courseQuery);
  const course = useMemo(() => (courses && courses.length > 0 ? courses[0] : null), [courses]);

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <Skeleton className="h-96 w-full mb-8 rounded-xl" />
                    <Skeleton className="h-12 w-3/4 mb-4" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (!isLoading && !course) {
    notFound();
  }

  // This check is necessary because of the async nature of the hooks
  if (!course) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="relative h-96 mb-8">
            {course.imageUrl ? (
                <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover rounded-xl"
                />
            ) : <div className="w-full h-full bg-muted rounded-xl"></div>}
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">{course.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{course.description}</p>
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                {course.learningOutcomes?.map((outcome, index) => (
                    <li key={index}>{outcome}</li>
                ))}
            </ul>
          </div>

           <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
            <p className="text-muted-foreground">{course.prerequisites || 'None'}</p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Purchase Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary" className="text-2xl font-bold w-full justify-center py-2">{course.price}</Badge>
              <Button asChild className="w-full" size="lg">
                <Link href={`/courses/${course.slug}/payment`}>Buy Course</Link>
              </Button>
              <div className="space-y-2 text-sm text-muted-foreground pt-4">
                <p className="flex items-center"><Star className="w-4 h-4 mr-2 text-yellow-400" /> 4.5 star rating</p>
                <p className="flex items-center"><BarChart className="w-4 h-4 mr-2" /> {course.level || 'All levels'}</p>
                <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 8 hours total</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
