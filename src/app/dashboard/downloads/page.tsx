
'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileWarning, Loader2, Download, Eye, Lock, Key } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import type { Course } from '@/lib/types';


export default function DashboardDownloadsPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const allCoursesQuery = useMemoFirebase(() => query(collection(firestore, 'courses')), [firestore]);
  const { data: allCourses, isLoading: coursesLoading } = useCollection<Course>(allCoursesQuery);

  const enrollmentsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'enrollments') : null),
    [firestore, user]
  );
  const { data: enrollments, isLoading: enrollmentsLoading } = useCollection(enrollmentsQuery);

  const purchasedCourses = useMemo(() => {
    if (!enrollments || !allCourses) return [];
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    return allCourses.filter(course => enrolledCourseIds.includes(course.id));
  }, [allCourses, enrollments]);

  const isLoading = isUserLoading || coursesLoading || enrollmentsLoading;


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">
            My Downloads
        </h1>
        <p className="text-muted-foreground">
          Access the downloadable content for all your purchased courses.
        </p>
      </div>

       {purchasedCourses.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedCourses.map(course => (
                 <Card key={course.id} className="flex flex-col overflow-hidden">
                    <div className="relative aspect-video w-full">
                         <Image
                            src={course.imageUrl || '/placeholder.svg'}
                            alt={course.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <CardHeader>
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Your course assets are ready for download.
                        </p>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                            <Key className="h-4 w-4"/>
                            <span className="font-medium text-foreground">Password:</span>
                            <span className="font-mono text-xs">{course.downloadPassword || 'Not provided'}</span>
                         </div>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" asChild disabled={!course.downloadUrl}>
                            <a href={course.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download Assets
                            </a>
                        </Button>
                    </CardFooter>
                 </Card>
            ))}
           </div>
        ) : (
          <Card className="text-center py-16 col-span-full">
            <CardHeader>
                <div className="mx-auto bg-secondary w-16 h-16 rounded-full flex items-center justify-center">
                    <FileWarning className="h-8 w-8 text-muted-foreground" />
                </div>
              <CardTitle className="mt-4">You haven't purchased any courses yet.</CardTitle>
              <CardDescription>
                Your purchased courses will appear here once you enroll.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
    </main>
  );
}
