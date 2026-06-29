
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import Onboarding from '@/components/auth/onboarding';

export default function RootPage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    let onboardingStatus = false;
    try {
      // Check localStorage only on the client side and handle potential access errors
      onboardingStatus = localStorage.getItem('hasOnboarded') === 'true';
    } catch (e) {
      console.warn('Could not access localStorage. This is expected in a sandboxed environment.');
    }
    
    setHasOnboarded(onboardingStatus);

    const timer = setTimeout(() => {
      setShowSplash(false);
      if (onboardingStatus) {
        router.push('/login');
      }
    }, 2000); // Splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, [router]);

  if (showSplash) {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="rounded-full bg-primary/10 p-6">
                    <div className="rounded-full bg-primary/20 p-5">
                    <Building2 className="h-16 w-16 text-primary" />
                    </div>
                </div>
                </div>
                <h1 
                className="font-headline text-4xl md:text-5xl font-bold text-foreground fade-in"
                style={{ animationDelay: '0.5s' }}
                >
                Hostel Finder
                </h1>
                <p 
                className="text-lg text-muted-foreground fade-in"
                style={{ animationDelay: '0.8s' }}
                >
                Find your perfect room easily
                </p>
            </div>
        </main>
    );
  }
  
  // After splash, if user hasn't onboarded, show onboarding.
  // Otherwise, the effect has already redirected to /login.
  if (hasOnboarded === false) {
      return <Onboarding />;
  }
  
  // Render nothing or a loading indicator while checking status and redirecting.
  return null; 
}
