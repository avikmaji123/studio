'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithRedirect, getRedirectResult, UserCredential } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  const createUserProfileIfNotExists = async (userCredential: UserCredential) => {
    if (!firestore) return;
    const user = userCredential.user;
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const [firstName, ...lastNameParts] = user.displayName?.split(' ') || ['', ''];
      const lastName = lastNameParts.join(' ');
      
      await setDoc(userDocRef, {
        id: user.uid,
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email,
        role: 'student',
        themePreference: 'light',
        walletBalance: 0,
        affiliateCode: '',
        suspended: false,
      });
    }
  };
  
  useEffect(() => {
    if (!auth) {
        setIsProcessingRedirect(false);
        return;
    };

    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          // User has just been redirected from Google.
          toast({
            title: "Processing Login...",
            description: "Please wait while we set up your account.",
          });
          await createUserProfileIfNotExists(result);
          toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting you to the dashboard...",
          });
          router.push('/dashboard');
        } else {
            // No redirect result, so we're not in a redirect flow.
            setIsProcessingRedirect(false);
        }
      })
      .catch((error) => {
        console.error("Google Redirect Error:", error);
        toast({
          variant: "destructive",
          title: "Google Sign-In Failed",
          description: error.message || "Could not complete sign-in with Google.",
        });
        setIsProcessingRedirect(false);
      });
  }, [auth, router, toast, firestore]);

  useEffect(() => {
    // This effect handles redirecting already-logged-in users
    if (!isUserLoading && !isProcessingRedirect && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, isProcessingRedirect, router]);


  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSubmitting(true);
    
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        await createUserProfileIfNotExists(userCredential);
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting you to the dashboard...",
        });
        router.push('/dashboard');
      })
      .catch((error: any) => {
        let title = "Login Failed";
        let description = "An unexpected error occurred. Please try again.";

        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/invalid-email':
          case 'auth/wrong-password':
            title = "Invalid Credentials";
            description = "The email or password you entered is incorrect. Please check and try again.";
            break;
          case 'auth/user-disabled':
            title = "Account Disabled";
            description = "Your account has been disabled. Please contact support.";
            break;
          case 'auth/user-not-found':
            title = "Account Not Found";
            description = "No account found with this email. You may want to sign up instead.";
            break;
          case 'auth/too-many-requests':
            title = "Too Many Attempts";
            description = "Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.";
            break;
          default:
            console.error("Email/Password Sign-In Error:", error);
            description = error.message;
            break;
        }

        toast({ variant: "destructive", title, description });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleGoogleSignIn = () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Error", description: "Authentication service not ready." });
      return;
    }
    
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };


  if (isUserLoading || isProcessingRedirect || user) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-15rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-sm rounded-2xl shadow-premium-light transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl dark:shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
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
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} type="button" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
