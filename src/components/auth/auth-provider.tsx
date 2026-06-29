
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/lib/actions';
import type { User as AppUser } from '@/lib/definitions';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  setAppUser: (user: AppUser | null) => void;
  refreshAppUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchAppUser = useCallback(async (uid: string) => {
    try {
        const profile = await getUser(uid);
        setAppUser(profile);
        return profile;
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setAppUser(null);
        return null;
    }
  }, []);

  const refreshAppUser = useCallback(async () => {
    if (user) {
      await fetchAppUser(user.uid);
    }
  }, [user, fetchAppUser]);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      if (firebaseUser) {
          await fetchAppUser(firebaseUser.uid);
      } else {
          setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAppUser]);

  useEffect(() => {
    if (!loading && appUser) {
      if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname === '/') {
        router.push('/home');
      }
    }
  }, [appUser, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, appUser, loading, setAppUser, refreshAppUser }}>
      {children}
    </AuthContext.Provider>
  );
}
