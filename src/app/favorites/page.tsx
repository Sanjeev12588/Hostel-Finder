
'use client';

import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeartCrack, MapPin, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState, useTransition } from 'react';
import { getFavoritesForClient, toggleFavorite } from '@/lib/actions';
import type { Hostel, Room } from '@/lib/definitions';
import Image from 'next/image';
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
import { useToast } from '@/hooks/use-toast';
import LoadingIndicator from '@/components/ui/loading-indicator';


type FavoriteItem = (Hostel & { adType: 'Hostel' }) | (Room & { adType: 'Room' });

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adToDelete, setAdToDelete] = useState<FavoriteItem | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setLoading(false);
        return;
    }

    async function fetchFavorites() {
        try {
            const favs = await getFavoritesForClient(user!.uid);
            setFavorites(favs as FavoriteItem[]);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchFavorites();
  }, [user, authLoading]);

  const handleDelete = () => {
    if (!user || !adToDelete) return;
    
    startTransition(async () => {
        await toggleFavorite(user.uid, adToDelete.id, adToDelete.adType.toLowerCase() as 'hostel' | 'room');
        setFavorites(favorites.filter(fav => fav.id !== adToDelete.id));
        toast({
            title: "Removed from Favourites",
            description: "The item has been removed from your favourites.",
        });
        setAdToDelete(null);
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="mb-6">
          <h1 className="font-headline text-3xl font-bold">Favourites</h1>
        </header>

        {loading || authLoading ? (
            <div className="h-[calc(100vh-200px)]">
              <LoadingIndicator />
            </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-card p-12 text-center">
            <HeartCrack className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 font-headline text-2xl font-semibold">Please log in</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Log in to view your favorited items.
            </p>
            <Button asChild className="mt-6">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-card p-12 text-center">
            <HeartCrack className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 font-headline text-2xl font-semibold">No favourites yet.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart on any listing to save it here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/hostels/category">Browse Listings</Link>
            </Button>
          </div>
        ) : (
          <AlertDialog>
            <div className="space-y-4">
                {favorites.map((item) => (
                    <div key={item.id} className="relative group">
                         {item.adType === 'Hostel' ? (
                            <Link href={`/hostels/${item.id}`} className="block">
                                <Card className="overflow-hidden h-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                                    <div className="relative h-40">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" data-ai-hint={item.hint} />
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-bold text-lg truncate">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-4 w-4" />
                                            {item.location}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-lg text-primary font-bold">₹{item.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                                            <div className="flex items-center gap-1 text-sm bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                                                <Star className="text-yellow-600 fill-current h-4 w-4" />
                                                <span className="font-bold">{item.rating}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ) : (
                            <Link href={`/roommates/${item.id}`} className="block">
                                <Card className="overflow-hidden h-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                                <div className="relative h-40">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" data-ai-hint={item.hint} />
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-bold text-lg truncate">{item.name}, {item.age}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-4 w-4" />
                                            {item.location}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-lg text-primary font-bold">₹{item.rent}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                                            <p className="text-sm">{item.occupation}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )}
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={() => setAdToDelete(item)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                    </div>
                ))}
            </div>
             <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the item from your favorites.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setAdToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                    {isPending ? 'Removing...' : 'Remove'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </AppLayout>
  );
}
