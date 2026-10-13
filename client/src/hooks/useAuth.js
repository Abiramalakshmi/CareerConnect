import { useEffect, useState, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { attachAuthInterceptor } from '../services/api';
import { fetchMyProfile } from '../services/profileService';

// Wraps Clerk's own auth state with our app-specific "has this person
// finished onboarding?" check against our own `users` table.
export function useAuth() {
  const { isLoaded: clerkLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();

  const [profile, setProfile] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(null); // null = not checked yet
  const [loading, setLoading] = useState(true);

  const checkProfile = useCallback(async () => {
    if (!isSignedIn) {
      setIsOnboarded(false);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      attachAuthInterceptor(getToken);
      const { onboarded, user: dbUser } = await fetchMyProfile();
      setIsOnboarded(onboarded);
      setProfile(dbUser ?? null);
    } catch (err) {
      console.error('Failed to check onboarding status:', err);
      setIsOnboarded(false);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!clerkLoaded) return;
    checkProfile();
  }, [clerkLoaded, checkProfile]);

  return {
    isSignedIn: !!isSignedIn,
    clerkUser: user,
    profile,
    role: profile?.role ?? null,
    isOnboarded,
    loading: !clerkLoaded || loading,
    refetchProfile: checkProfile,
  };
}
