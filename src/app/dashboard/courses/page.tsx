'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

import { CourseCard } from "@/components/app/course-card";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileWarning, Loader2 } from 'lucide-react';
import type { Course, Certificate, Enrollment, Review } from '@/lib/types';

export default function MyCoursesPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const allCoursesQuery = useMemoFirebase(() => query(collection(firestore, 'courses')), [firestore]);
    const { data: allCourses, isLoading: coursesLoading } = useCollection<Course>(allCoursesQuery);

    const enrollmentsQuery = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'enrollments') : null),
        [firestore, user]
    );
    const { data: enrollments, isLoading: enrollmentsLoading } = useCollection<Enrollment>(enrollmentsQuery);

    const certificatesQuery = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'certificates') : null),
        [firestore, user]
    );
    const { data: certificates, isLoading: certificatesLoading } = useCollection<Certificate>(certificatesQuery);
    
    const userReviewsQuery = useMemoFirebase(
      () => (user ? query(collection(firestore, 'reviews'), where('userId', '==', user.uid)) : null),
      [firestore, user]
    );
    const { data: userReviews, isLoading: reviewsLoading } = useCollection<Review>(userReviewsQuery);

    const enrolledCourses = useMemo(() => {
        if (!enrollments || !allCourses) return [];
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        return allCourses.filter(course => enrolledCourseIds.includes(course.id));
    }, [allCourses, enrollments]);

    const isLoading = isUserLoading || coursesLoading || enrollmentsLoading || certificatesLoading || reviewsLoading;

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    if (isLoading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="mb-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-5 w-1/2 mt-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    My Courses
                </h1>
                <p className="text-muted-foreground">
                    All your purchased courses in one place. Continue your learning journey.
                </p>
            </div>

            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map(course => {
                        const certificate = certificates?.find(c => c.courseId === course.id);
                        const enrollment = enrollments?.find(e => e.courseId === course.id);
                        const hasReviewed = userReviews?.some(r => r.courseId === course.id);
                        
                        return (
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                isEnrolled={true} 
                                certificate={certificate}
                                enrollment={enrollment}
                                hasReviewed={hasReviewed}
                            />
                        );
                    })}
                </div>
            ) : (
                <Card className="text-center py-16 col-span-full">
                    <CardHeader>
                        <div className="mx-auto bg-secondary w-16 h-16 rounded-full flex items-center justify-center">
                            <FileWarning className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-4">You haven't enrolled in any courses yet.</CardTitle>
                        <CardDescription>
                            Your purchased courses will appear here.
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
