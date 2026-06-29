
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Building2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import HeroCarousel from '@/components/home/hero-carousel';
import QuickActions from '@/components/home/quick-actions';
import RecentlyViewed from '@/components/home/recently-viewed';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';

export default function HomeClient() {
  const { appUser, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Check if user is logged in and if we haven't asked for permission before
      if (appUser && !localStorage.getItem('locationPermissionRequested')) {
        localStorage.setItem('locationPermissionRequested', 'true');
        
        if ('geolocation' in navigator) {
          toast({
              title: "Location Access",
              description: "To help you find nearby places, please allow location access.",
          });

          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Location access granted. We don't need to do anything with the position here,
              // as other components will use it when needed.
              console.log("Location access granted:", position.coords);
              toast({
                  title: "Location Access Granted",
                  description: "You can now find places near you.",
              });
            },
            (error) => {
              // Location access denied by user is a common case, so we won't show a toast for it.
              // We'll log it for debugging and only show a toast for other errors.
              console.warn(`Location access error: ${error.message}`);
              if (error.code !== error.PERMISSION_DENIED) {
                  toast({
                      variant: 'destructive',
                      title: "Location Error",
                      description: "Could not get your location. Please check your browser settings.",
                  });
              }
            }
          );
        }
      }
    } catch (error) {
      console.warn('Could not access localStorage for location permission check.');
    }
  }, [appUser, toast]);

  const getFirstName = () => {
    if (!appUser || !appUser.name) return 'There';
    return appUser.name.split(' ')[0];
  };

  const getAvatarFallback = () => {
    if (!appUser) return 'U';
    if (appUser.name) {
        const nameParts = appUser.name.split(' ');
        if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        }
        return appUser.name.substring(0, 2).toUpperCase();
    }
    if (appUser.email) {
        return appUser.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex flex-col space-y-6">
      <header className="space-y-4 p-4">
        <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-md flex items-center justify-between relative h-24">
            <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                <span className="font-headline text-xl font-bold">Hostel Finder</span>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center hidden md:block">
                {loading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-6 w-24 bg-primary-foreground/30" />
                    <Skeleton className="h-4 w-32 bg-primary-foreground/30" />
                  </div>
                ) : (
                  <>
                    <h1 className="font-headline text-3xl font-bold">
                      Welcome, {getFirstName()}!
                    </h1>
                    <p className="text-base text-primary-foreground/90">Find your ideal stay today.</p>
                  </>
                )}
            </div>
             <Button asChild variant="ghost" className="rounded-full p-0 h-10 w-10 hover:bg-primary-foreground/20">
                <Link href="/profile">
                    {loading ? (
                        <Skeleton className="h-10 w-10 rounded-full bg-primary-foreground/30" />
                    ) : appUser ? (
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={appUser.avatar} alt={appUser.name} />
                            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <Avatar className="h-10 w-10 bg-primary-foreground/30">
                            <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                    )}
                </Link>
            </Button>
        </div>
      </header>
      
      <div className="px-4">
          <HeroCarousel />
      </div>

      <QuickActions />

      <RecentlyViewed />

      <section className="px-4">
          <h2 className="font-headline text-2xl font-bold text-center mb-4">Support and Complaint</h2>
          <Link href="/complaint" className="group">
              <div className="flex items-center justify-center gap-4 rounded-xl px-6 py-8 text-2xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all hover:scale-105">
                  <ShieldAlert className="h-10 w-10" />
                  <span>Raise a Complaint</span>
              </div>
          </Link>
      </section>
    </div>
  );
}
