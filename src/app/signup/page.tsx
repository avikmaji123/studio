'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const createUserProfileIfNotExists = async (userCredential: UserCredential, fName?: string, lName?: string) => {
    if (!firestore) return;
    const user = userCredential.user;
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const displayName = user.displayName;
      const firstNameToSet = fName || (displayName ? displayName.split(' ')[0] : '');
      const lastNameToSet = lName || (displayName ? displayName.split(' ').slice(1).join(' ') : '');
      
      await setDoc(userDocRef, {
        id: user.uid,
        firstName: firstNameToSet,
        lastName: lastNameToSet,
        email: user.email,
        role: 'student',
        themePreference: 'light',
        walletBalance: 0,
        affiliateCode: '',
        suspended: false,
      });
    }
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsSubmitting(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`.trim(),
        });
        await createUserProfileIfNotExists(userCredential, firstName, lastName);
        toast({
            title: "Account Created",
            description: "Welcome! Redirecting you to the dashboard...",
        });
        // The useEffect hook will handle the redirect
      })
      .catch((error: any) => {
        let title = "Sign-up Failed";
        let description = "An unexpected error occurred. Please try again.";

        switch (error.code) {
          case 'auth/email-already-in-use':
            title = "Email In Use";
            description = "This email is already registered. Please try logging in instead.";
            break;
          case 'auth/invalid-email':
            title = "Invalid Email";
            description = "Please enter a valid email address.";
            break;
          case 'auth/weak-password':
            title = "Weak Password";
            description = "Your password must be at least 6 characters long.";
            break;
          default:
             console.error("Sign-up Error:", error);
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
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    setIsSubmitting(true);
    signInWithPopup(auth, provider)
      .then(async (result) => {
        await createUserProfileIfNotExists(result);
        toast({
            title: "Account Created",
            description: "Welcome! Redirecting you to the dashboard...",
        });
        router.push('/dashboard');
      })
      .catch((error) => {
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          console.error("Google Sign-In Error:", error);
          toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: error.message || "An unexpected error occurred during Google sign-up.",
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  
  if (isUserLoading || user) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-15rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create an account to start your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp} className="grid gap-4">
             <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="Max" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSubmitting}/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSubmitting}/>
              </div>
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create an account
            </Button>
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign up with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
