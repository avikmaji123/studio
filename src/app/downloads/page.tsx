
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from "lucide-react";

// This page now acts as a redirector.
// The actual content is in /dashboard/downloads for authenticated users.
export default function DownloadsPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) {
      // Wait until we know the user's auth state
      return;
    }

    if (user) {
      // If user is logged in, send them to the correct dashboard page.
      router.replace('/dashboard/downloads');
    } else {
      // If no user, redirect to login with a message that they need to sign in.
      // You can add query params to show a message on the login page, e.g., router.replace('/login?redirect=/downloads');
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // Show a loading spinner while redirecting.
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-15rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
