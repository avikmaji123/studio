'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from "react";
import { Loader2, BookOpen } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createLogEntry } from "@/lib/actions";

export default function AdminLoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, profile, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('avik911@courseverse.admin');
  const [password, setPassword] = useState('122911');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isUserLoading && user && isAdmin) {
      router.replace('/admin911');
    }
  }, [user, isUserLoading, isAdmin, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsSubmitting(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        await createLogEntry({
          source: 'admin',
          severity: 'info',
          message: 'Admin login successful.',
          metadata: { userId: userCredential.user.uid },
        });
        toast({
          title: "Admin Login Successful",
          description: "Welcome back! Redirecting you to the dashboard...",
        });
        // The useEffect will handle redirection
      } else {
        // This user exists but is NOT an admin. Log them out.
        await createLogEntry({
          source: 'system',
          severity: 'critical',
          message: 'Non-admin user attempted to access admin login.',
          metadata: { userId: userCredential.user.uid, email: email },
        });
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have administrative privileges.",
        });
      }
    } catch (error: any) {
      // This is the primary error handler
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        // This error code can mean "user not found" OR "wrong password".
        // For our specific admin setup, we assume it means the admin user needs to be created.
        toast({
            title: "First-Time Admin Setup",
            description: "No admin account found. Attempting to create one...",
        });
        try {
            const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userDocRef = doc(firestore, 'users', newUserCredential.user.uid);
            // Create the admin profile in Firestore
            await setDoc(userDocRef, {
                id: newUserCredential.user.uid,
                firstName: 'Admin',
                lastName: 'User',
                email: email,
                role: 'admin',
                themePreference: 'dark',
                walletBalance: 0,
                affiliateCode: '',
                suspended: false,
            });
            await createLogEntry({
              source: 'system',
              severity: 'info',
              message: 'Initial admin account created.',
              metadata: { userId: newUserCredential.user.uid },
            });
            toast({
                title: "Admin Account Created!",
                description: "Login successful. Redirecting...",
            });
            // Let the useEffect handle the redirect.
        } catch (creationError: any) {
            let title = "Login Failed";
            let description = creationError.message;
            if (creationError.code === 'auth/email-already-in-use') {
                title = "Invalid Credentials";
                description = "The email or password you entered is incorrect.";
            }
             await createLogEntry({
                source: 'admin',
                severity: 'warning',
                message: `Admin login failed: ${description}`,
                metadata: { email: email, error: creationError.code },
             });
             toast({
                variant: "destructive",
                title: title,
                description: description,
            });
        }
      } else {
        // Handle other errors like network issues, etc.
        console.error("Admin Login Error:", error);
         await createLogEntry({
            source: 'system',
            severity: 'critical',
            message: `Admin login system error: ${error.message}`,
            metadata: { error: error.code },
         });
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "An unexpected error occurred.",
        });
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  // While user status is loading, or if the user is an admin, show a loader.
  // The useEffect will handle the redirect.
  if (isUserLoading || (user && isAdmin)) {
    return (
      <div className="flex h-screen w-full justify-center items-center bg-background dark">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is done and user is not an admin, show the login form.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <BookOpen className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold">CourseVerse Admin</span>
            </div>
          <CardTitle className="text-2xl">Administrator Login</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline text-muted-foreground">
              Return to main site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
