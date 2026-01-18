'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc } from 'firebase/firestore';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Certificate } from '@/lib/types';

export default function CertificateIssuedPage() {
    const { courseId } = useParams();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const certificateRef = useMemoFirebase(
        () => (user && courseId ? doc(firestore, 'users', user.uid, 'certificates', courseId as string) : null),
        [firestore, user, courseId]
    );

    const { data: certificate, isLoading: isCertLoading } = useDoc<Certificate>(certificateRef);

    const handleCopy = () => {
        if (certificate?.certificateCode) {
            navigator.clipboard.writeText(certificate.certificateCode);
            toast({ title: 'Copied to clipboard!', description: 'You can now paste the code to verify.' });
        }
    };
    
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login');
        }
    }, [isUserLoading, user, router]);

    const isLoading = isUserLoading || isCertLoading;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!certificate) {
         return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-destructive">Certificate Not Found</h1>
                <p className="text-muted-foreground mt-2">We couldn't find a certificate for this course. It may not have been issued yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/courses">Go to My Courses</Link>
                </Button>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl">
            <Card className="text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900/50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Congratulations!</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        You have successfully completed the course: <br/> <span className="font-semibold text-foreground">{certificate.courseName}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p>Your certificate has been securely generated. You can download it anytime by verifying its authenticity using your unique code.</p>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground font-semibold">YOUR UNIQUE CERTIFICATE CODE</p>
                        <div className="flex items-center justify-center gap-4 mt-2">
                            <p className="text-2xl font-bold font-mono tracking-widest text-primary">{certificate.certificateCode}</p>
                            <Button variant="ghost" size="icon" onClick={handleCopy}>
                                <Copy className="h-5 w-5" />
                                <span className="sr-only">Copy code</span>
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg">
                            <Link href="/verify-certificate">Verify & Download</Link>
                        </Button>
                         <Button asChild variant="outline" size="lg">
                            <Link href="/dashboard/courses">Back to My Courses</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
