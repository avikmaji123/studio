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
import { useSiteSettings } from "@/hooks/use-settings";

export default function AdminLoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, profile, isUserLoading } = useUser();
  const { settings, isLoading: settingsLoading } = useSiteSettings();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('admin@courseverse.com');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isUserLoading && user && isAdmin) {
      router.replace('/admin911');
    }
  }, [user, isUserLoading, isAdmin, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore || settingsLoading) return;
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
      } else {
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
      if (error.code === 'auth/user-not-found') {
        if (settings.isInitialAdminCreated) {
           await createLogEntry({ source: 'admin', severity: 'warning', message: 'Admin login failed: Invalid credentials (user not found, but setup complete).', metadata: { email }});
           toast({ variant: "destructive", title: "Invalid Credentials", description: "The email or password you entered is incorrect." });
        } else {
          toast({ title: "First-Time Admin Setup", description: "No admin account found. Creating one now..." });
          try {
            const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userDocRef = doc(firestore, 'users', newUserCredential.user.uid);
            
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
            
            const settingsRef = doc(firestore, 'settings', 'global');
            await setDoc(settingsRef, { isInitialAdminCreated: true }, { merge: true });

            await createLogEntry({ source: 'system', severity: 'info', message: 'Initial admin account created.', metadata: { userId: newUserCredential.user.uid } });
            toast({ title: "Admin Account Created!", description: "Login successful. Redirecting..." });
          } catch (creationError: any) {
             await createLogEntry({ source: 'system', severity: 'critical', message: `Initial admin creation failed: ${creationError.message}`, metadata: { email, error: creationError.code } });
             toast({ variant: "destructive", title: "Setup Failed", description: creationError.message });
          }
        }
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          await createLogEntry({ source: 'admin', severity: 'warning', message: 'Admin login failed: Invalid credentials.', metadata: { email } });
          toast({ variant: "destructive", title: "Invalid Credentials", description: "The email or password you entered is incorrect." });
      } else {
        console.error("Admin Login Error:", error);
         await createLogEntry({ source: 'system', severity: 'critical', message: `Admin login system error: ${error.message}`, metadata: { error: error.code } });
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

  if (isUserLoading || (user && isAdmin) || settingsLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center bg-background dark">
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
