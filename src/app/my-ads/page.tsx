
'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Trash2, Building2, Users, BadgePlus, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getMyAdsForClient } from '@/lib/actions';
import { deleteAd as deleteAdAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Hostel, Room } from '@/lib/definitions';
import LoadingIndicator from '@/components/ui/loading-indicator';

type Ad = (Hostel & { adType: 'Hostel' }) | (Room & { adType: 'Room' });

export default function MyAdsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [postedAds, setPostedAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);

  useEffect(() => {
    if (user) {
      const fetchAds = async () => {
        setIsLoading(true);
        const ads = await getMyAdsForClient(user.uid);
        setPostedAds(ads as Ad[]);
        setIsLoading(false);
      };
      fetchAds();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const handleDelete = async () => {
    if (!adToDelete) return;
    
    await deleteAdAction(adToDelete.id, adToDelete.adType);
    setPostedAds(postedAds.filter(ad => ad.id !== adToDelete.id));
    toast({
        title: "Ad Deleted",
        description: "Your ad has been successfully deleted.",
    });
    setAdToDelete(null);
  };

  if (isLoading) {
    return (
        <AppLayout>
             <div className="h-full">
                <LoadingIndicator />
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="relative flex items-center justify-center mb-6">
          <Button variant="ghost" size="icon" asChild className="absolute left-0">
            <Link href="/profile">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold">Your Ads</h1>
        </header>

        {postedAds.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-card p-12 text-center">
            <BadgePlus className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 font-headline text-2xl font-semibold">{user ? "No ads posted yet." : "Please log in."}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {user ? "Your posted ads will appear here." : "Log in to see your posted ads."}
            </p>
            <Button asChild className="mt-6">
              <Link href={user ? "/post" : "/login"}>{user ? "Post an Ad" : "Login"}</Link>
            </Button>
          </div>
        ) : (
          <AlertDialog>
            <div className="space-y-4">
              {postedAds.map(ad => (
                <Card key={ad.id} className="overflow-hidden">
                  <CardContent className="p-3 flex items-center gap-4">
                    <Image src={ad.image} alt={ad.name} width={80} height={80} className="rounded-lg object-cover aspect-square" data-ai-hint={ad.hint} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {ad.adType === 'Hostel' ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                        <span>{ad.adType} Ad</span>
                      </div>
                      <h3 className="font-bold text-lg">{ad.name}</h3>
                    </div>
                    <div className="flex gap-2">
                        <Link href={ad.adType === 'Hostel' ? `/hostels/${ad.id}` : `/roommates/${ad.id}`}>
                            <Button variant="outline" size="icon">
                                <Eye className="h-5 w-5" />
                                <span className="sr-only">View Ad</span>
                            </Button>
                        </Link>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" onClick={() => setAdToDelete(ad)}>
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Delete Ad</span>
                          </Button>
                        </AlertDialogTrigger>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
             <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your ad.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setAdToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </AppLayout>
  );
}

    