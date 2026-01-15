'use client';

import { ArrowUpRight, Book, CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CourseCard } from '@/components/app/course-card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course } from '@/lib/types';

function StatCard({
  title,
  value,
  icon: Icon,
  footerText,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  footerText: string;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{footerText}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const { user, profile, isUserLoading } = useUser();
  const firestore = useFirestore();

  const enrollmentsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'enrollments') : null,
    [firestore, user]
  );
  const { data: enrollments, isLoading: isEnrollmentsLoading } =
    useCollection(enrollmentsQuery);
    
  const allCoursesQuery = useMemoFirebase(() => query(collection(firestore, 'courses')), [firestore]);
  const { data: allCourses, isLoading: areCoursesLoading } = useCollection<Course>(allCoursesQuery);

  const certificatesQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'certificates') : null,
    [firestore, user]
  );
  const { data: certificates, isLoading: isCertificatesLoading } =
    useCollection(certificatesQuery);

  const purchasedCourses = useMemo(() => {
    if (!enrollments || !allCourses) return [];
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    return allCourses.filter(c => enrolledCourseIds.includes(c.id)).slice(0, 3);
  }, [enrollments, allCourses]);

  const enrolledCourseIds = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.map(e => e.courseId);
  }, [enrollments]);

  const isLoading = isUserLoading || isEnrollmentsLoading || isCertificatesLoading || areCoursesLoading;
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mb-4">
        {isUserLoading ? (
            <Skeleton className="h-10 w-1/2" />
        ) : (
            <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {profile?.firstName || 'Student'}!
            </h1>
        )}
        <p className="text-muted-foreground">
          Here is a snapshot of your learning journey.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="Courses Purchased"
          value={enrollments?.length ?? 0}
          icon={Book}
          footerText="Keep up the great work!"
          isLoading={isLoading}
        />
        <StatCard
          title="Available Downloads"
          value={enrollments?.length ?? 0}
          icon={Download}
          footerText="Assets ready for offline use."
          isLoading={isLoading}
        />
        <StatCard
          title="Certificates Earned"
          value={certificates?.length ?? 0}
          icon={CheckCircle}
          footerText={certificates?.length === 1 ? '1 earned so far' : `${certificates?.length || 0} earned so far`}
          isLoading={isLoading}
        />
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-1/2"/>
            ) : (
                <div className="text-2xl font-bold">Active</div>
            )}
            <p className="text-xs text-muted-foreground">
              Your account is in good standing.
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                Pick up where you left off in your courses.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/courses">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {purchasedCourses.length > 0 ? (
                        purchasedCourses.map(course => (
                            <CourseCard 
                              key={course.id} 
                              course={course} 
                              isEnrolled={enrolledCourseIds.includes(course.id)} 
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
                            <Button asChild variant="link" className="mt-2">
                                <Link href="/courses">Explore Courses</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
