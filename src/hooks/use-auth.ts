import { useContext } from 'react';
import { AuthContext } from '@/components/auth/auth-provider';
import type { User as AppUser } from '@/lib/definitions';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context as typeof context & { setAppUser: (user: AppUser | null) => void };
};
