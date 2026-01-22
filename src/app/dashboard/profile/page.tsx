'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import { format } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Award, ExternalLink } from 'lucide-react';
import type { Course, Enrollment, Certificate } from '@/lib/types';


// This component contains the main logic and uses searchParams
function ProfilePageContent() {
    const searchParams = useSearchParams();
    const firestore = useFirestore();
    const targetUserId = searchParams.get('userId');

    // Get current authenticated user and their profile (and admin status)
    const { user: authUser, isAdmin, isProfileLoading: isAuthProfileLoading } = useUser();
    
    // Determine which user's profile to display, but only after we know if the authUser is an admin.
    const displayUserId = (authUser && !isAuthProfileLoading) ? (targetUserId && isAdmin ? targetUserId : authUser.uid) : undefined;

    const userDocRef = useMemoFirebase(
        () => (displayUserId ? doc(firestore, 'users', displayUserId) : null),
        [firestore, displayUserId]
    );
    const { data: userProfile, isLoading: isTargetProfileLoading } = useDoc(userDocRef);

    // Fetch all courses once to map IDs to titles
    const coursesQuery = useMemoFirebase(() => query(collection(firestore, 'courses')), [firestore]);
    const { data: allCourses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);
    
    // Fetch enrollments for the displayed user
    const enrollmentsQuery = useMemoFirebase(
        () => (displayUserId ? collection(firestore, 'users', displayUserId, 'enrollments') : null),
        [firestore, displayUserId]
    );
    const { data: enrollments, isLoading: areEnrollmentsLoading } = useCollection<Enrollment>(enrollmentsQuery);

    // Fetch certificates for the displayed user
    const certificatesQuery = useMemoFirebase(
        () => (displayUserId ? collection(firestore, 'users', displayUserId, 'certificates') : null),
        [firestore, displayUserId]
    );
    const { data: certificates, isLoading: areCertificatesLoading } = useCollection<Certificate>(certificatesQuery);

    const isLoading = isAuthProfileLoading || isTargetProfileLoading || areCoursesLoading || areEnrollmentsLoading || areCertificatesLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!userProfile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>User Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The requested user profile could not be loaded.</p>
                </CardContent>
            </Card>
        );
    }

    const displayName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
    const fallback = ((userProfile.firstName?.charAt(0) || '') + (userProfile.lastName?.charAt(0) || '')).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || 'U';

    const getCourseTitle = (courseId: string) => {
        return allCourses?.find(c => c.id === courseId)?.title || 'Unknown Course';
    };

    return (
         <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={userProfile.profilePicture || ''} alt={displayName} />
                        <AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl">{displayName}</CardTitle>
                        <CardDescription>{userProfile.email}</CardDescription>
                    </div>
                     <Badge variant={userProfile.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize text-sm">{userProfile.role}</Badge>
                </CardHeader>
                <CardContent>
                   <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Courses Enrolled</p>
                            <p className="text-2xl font-bold">{enrollments?.length ?? 0}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Certificates Earned</p>
                            <p className="text-2xl font-bold">{certificates?.length ?? 0}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                            <p className="text-2xl font-bold">₹{userProfile.walletBalance ?? 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5"/> Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    {enrollments && enrollments.length > 0 ? (
                        <ul className="space-y-2">
                            {enrollments.map(enrollment => (
                                <li key={enrollment.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                    <span>{getCourseTitle(enrollment.courseId)}</span>
                                    <span className="text-xs text-muted-foreground">Enrolled on {format(enrollment.enrollmentDate.toDate(), 'MMM d, yyyy')}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">This user is not enrolled in any courses.</p>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5"/> Issued Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                     {certificates && certificates.length > 0 ? (
                        <ul className="space-y-2">
                            {certificates.map(cert => (
                                <li key={cert.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                    <div>
                                        <p>{cert.courseName}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{cert.certificateCode}</p>
                                    </div>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/certificate/${cert.certificateCode}`} target="_blank">
                                            View <ExternalLink className="ml-2 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">This user has not earned any certificates.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// This is the actual page component, which uses Suspense to handle dynamic routing data
export default function ProfilePage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
                <ProfilePageContent />
            </Suspense>
        </main>
    );
}
