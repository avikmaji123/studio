
'use client';

import { useState } from 'react';
import { writeBatch, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { courses } from '@/lib/data';
import { Loader2, DatabaseZap, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SeedDatabasePage() {
    const firestore = useFirestore();
    const { profile } = useUser();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleSeed = async () => {
        if (!firestore || profile?.role !== 'admin') {
            toast({
                variant: 'destructive',
                title: 'Unauthorized',
                description: 'You do not have permission to perform this action.',
            });
            return;
        }

        setIsLoading(true);

        try {
            const batch = writeBatch(firestore);

            courses.forEach(course => {
                // Use the existing string ID from the mock data file as the document ID
                const courseRef = doc(firestore, 'courses', course.id);
                batch.set(courseRef, course);
            });

            await batch.commit();

            toast({
                title: 'Database Seeded!',
                description: `${courses.length} courses have been added to Firestore.`,
            });
            setIsDone(true);
        } catch (error: any) {
            console.error("Error seeding database:", error);
            toast({
                variant: 'destructive',
                title: 'Seeding Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="mx-auto grid w-full max-w-2xl">
                <h1 className="text-3xl font-semibold">Seed Database</h1>
                <p className="text-muted-foreground mt-2">
                    Populate your Firestore database with the initial set of courses.
                </p>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Course Data Seeding</CardTitle>
                        <CardDescription>
                            This will add {courses.length} courses from the application's mock data file (`src/lib/data.ts`) into your live `courses` collection in Firestore. This is a one-time setup action.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                Running this action will overwrite any existing courses in Firestore that have the same ID. This action cannot be undone.
                            </AlertDescription>
                        </Alert>
                        
                        <Button onClick={handleSeed} disabled={isLoading || isDone || profile?.role !== 'admin'}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <DatabaseZap className="mr-2 h-4 w-4" />
                            )}
                            {isDone ? 'Seeding Complete' : (isLoading ? 'Seeding...' : 'Seed Courses into Firestore')}
                        </Button>

                         {isDone && (
                            <p className="mt-4 text-sm text-green-600">
                                Your database has been successfully populated. You can now manage these courses from the "Courses" tab.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
