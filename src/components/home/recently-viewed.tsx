
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MapPin, Star } from 'lucide-react';
import type { Hostel } from '@/lib/definitions';
import { getHostelsByIds } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';

type RecentlyViewedHostel = Hostel & { viewedAt: number };

export default function RecentlyViewed() {
  const [viewedItems, setViewedItems] = useState<RecentlyViewedHostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterRecentlyViewed = async () => {
      try {
        const storedItemsJSON = localStorage.getItem('recentlyViewed');
        if (!storedItemsJSON) {
          setIsLoading(false);
          return;
        }

        let items: RecentlyViewedHostel[] = JSON.parse(storedItemsJSON);
        
        // Filter out items older than 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentItems = items.filter(item => item.viewedAt > sevenDaysAgo);
        
        if (recentItems.length === 0) {
          localStorage.removeItem('recentlyViewed');
          setViewedItems([]);
          setIsLoading(false);
          return;
        }

        // Check which items still exist in the database
        const itemIds = recentItems.map(item => item.id);
        const existingHostels = await getHostelsByIds(itemIds);
        const existingIds = new Set(existingHostels.map(h => h.id));
        
        // Filter out items that no longer exist
        const validRecentItems = recentItems.filter(item => existingIds.has(item.id));
        
        // Update localStorage with the cleaned list
        if (validRecentItems.length !== items.length) {
            localStorage.setItem('recentlyViewed', JSON.stringify(validRecentItems));
        }
        
        setViewedItems(validRecentItems);

      } catch (error) {
        console.error("Could not load recently viewed items:", error);
        // Clear local storage if there's a parsing error or other issue.
        try {
          localStorage.removeItem('recentlyViewed');
        } catch (e) {
            console.error("Could not clear recently viewed items from localStorage:", e);
        }
        setViewedItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndFilterRecentlyViewed();
  }, []);

  if (isLoading) {
      return (
          <section className="space-y-4">
              <h2 className="font-headline text-2xl font-bold px-4 text-center">Recently Viewed</h2>
              <div className="px-4 pb-4 flex space-x-4">
                  {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-64 space-y-2">
                           <Skeleton className="h-32 w-full" />
                           <Skeleton className="h-5 w-5/6" />
                           <Skeleton className="h-4 w-4/6" />
                      </div>
                  ))}
              </div>
          </section>
      );
  }

  if (viewedItems.length === 0) {
    return null; // Don't render the section if there's nothing to show
  }

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-2xl font-bold px-4 text-center">Recently Viewed</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md px-4">
        <div className="flex w-max space-x-4 pb-4">
          {viewedItems.map((hostel) => (
            <Link key={hostel.id} href={`/hostels/${hostel.id}`} className="group">
              <Card className="w-64 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl active:scale-95">
                <div className="relative h-32">
                  <Image
                    src={hostel.image}
                    alt={hostel.name}
                    fill
                    className="object-cover"
                    data-ai-hint={hostel.hint}
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-bold truncate">{hostel.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {hostel.location}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-md text-primary font-bold">
                      ₹{hostel.price}
                      <span className="text-xs font-normal text-muted-foreground">/month</span>
                    </p>
                    <div className="flex items-center gap-1 text-sm bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                      <Star className="text-yellow-600 fill-current h-4 w-4" />
                      <span className="font-bold">{hostel.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
