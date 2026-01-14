'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DownloadsPage() {
  const router = useRouter();
  // This is a placeholder for real authentication state.
  // In a real app, this would come from a context or a hook like useUser().
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for authentication status.
    // Replace this with your actual auth check.
    const checkAuth = () => {
        // For demonstration, we'll assume the user is not signed in.
        const userIsAuthenticated = false; 
        
        if (!userIsAuthenticated) {
            router.push('/login');
        } else {
            setIsSignedIn(true);
            setIsLoading(false);
        }
    };
    checkAuth();
  }, [router]);

  // In a real application, you would fetch the user's purchased courses.
  const purchasedCourses: any[] = [];

  if (isLoading || !isSignedIn) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-15rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl mb-8">
          My Downloads
        </h1>
        
        {purchasedCourses.length > 0 ? (
           <div className="grid gap-6">
            {/* This part would be populated dynamically with purchased courses */}
           </div>
        ) : (
          <Card className="text-center py-16">
            <CardHeader>
                <div className="mx-auto bg-secondary w-16 h-16 rounded-full flex items-center justify-center">
                    <FileWarning className="h-8 w-8 text-muted-foreground" />
                </div>
              <CardTitle className="mt-4">No Courses Purchased Yet</CardTitle>
              <CardDescription>
                Your purchased courses will appear here once you enroll.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/courses">Browse Available Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
