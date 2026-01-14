'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getRedirectResult, UserCredential } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { useDoc, WithId } from './firestore/use-doc';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Define a type for the user profile data stored in Firestore
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'admin' | 'affiliate';
  // Add other profile fields as needed
}

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  profile: WithId<UserProfile> | null;
  isUserLoading: boolean;
  isProfileLoading: boolean;
  userError: Error | null;
  profileError: Error | null;
}

export interface FirebaseServicesAndUser extends UserAuthAndProfileHookResult {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export interface UserAuthAndProfileHookResult {
  user: User | null;
  profile: WithId<UserProfile> | null;
  isUserLoading: boolean;
  isProfileLoading: boolean;
  userError: Error | null;
  profileError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  const createUserProfileIfNotExists = async (userCredential: UserCredential) => {
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
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    // This handles the result from a a `signInWithRedirect` call.
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          // User has successfully signed in.
          await createUserProfileIfNotExists(result);
           toast({
            title: "Login Successful",
            description: "Welcome! Redirecting you to the dashboard...",
          });
          router.push('/dashboard');
        }
        // If result is null, it means the user has not just signed in via redirect.
        // The onAuthStateChanged listener below will handle existing sessions.
      })
      .catch((error) => {
        console.error("Redirect Result Error:", error);
        toast({
          variant: "destructive",
          title: "Sign-In Failed",
          description: error.message || "An error occurred during the sign-in process.",
        });
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth, firestore, router, toast]);

  const userDocRef = useMemoFirebase(
    () => (userAuthState.user ? doc(firestore, 'users', userAuthState.user.uid) : null),
    [firestore, userAuthState.user]
  );
  
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      profile: profile,
      isUserLoading: userAuthState.isUserLoading,
      isProfileLoading: isProfileLoading,
      userError: userAuthState.userError,
      profileError: profileError,
    };
  }, [firebaseApp, firestore, auth, userAuthState, profile, isProfileLoading, profileError]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    profile: context.profile,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    isProfileLoading: context.isProfileLoading,
    profileError: context.profileError,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

export const useUser = (): UserAuthAndProfileHookResult => {
  const { user, profile, isUserLoading, userError, isProfileLoading, profileError } = useFirebase();
  return { user, profile, isUserLoading, userError, isProfileLoading, profileError };
};
