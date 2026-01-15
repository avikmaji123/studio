
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from "react";
import { Loader2, BookOpen } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, profile, isUserLoading, isProfileLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('avik911@courseverse.admin');
  const [password, setPassword] = useState('122911');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isLoading = isUserLoading || isProfileLoading;
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      router.push('/admin911');
    }
  }, [user, isLoading, isAdmin, router]);


  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsSubmitting(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        toast({
          title: "Admin Login Successful",
          description: "Welcome back! Redirecting you to the dashboard...",
        });
        // The useEffect will handle redirection
      } else {
        // If the user exists but is not an admin, sign them out.
        await auth.signOut();
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have administrative privileges.",
        });
      }
    } catch (error: any) {
       let title = "Login Failed";
       let description = "An unexpected error occurred. Please try again.";

        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/invalid-email':
          case 'auth/wrong-password':
            title = "Invalid Credentials";
            description = "The email or password you entered is incorrect.";
            break;
          case 'auth/user-not-found':
             title = "Admin Not Found";
             description = "This admin account does not exist. Please contact support.";
            break;
          default:
            console.error("Admin Sign-In Error:", error);
            description = error.message;
            break;
        }

        toast({ variant: "destructive", title, description });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading || isAdmin) {
    return (
        <div className="flex h-screen w-full justify-center items-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

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

