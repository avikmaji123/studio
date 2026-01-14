'use client';

import { useFirebase } from '@/firebase/provider';
import type { UserAuthAndProfileHookResult } from '@/firebase/provider';

/**
 * Hook specifically for accessing the authenticated user's state, including their Firestore profile.
 * @returns {UserAuthAndProfileHookResult} Object with user, profile, loading status, and errors.
 */
export const useUser = (): UserAuthAndProfileHookResult => {
  const { user, profile, isUserLoading, userError, isProfileLoading, profileError } = useFirebase();
  return { user, profile, isUserLoading, userError, isProfileLoading, profileError };
};
