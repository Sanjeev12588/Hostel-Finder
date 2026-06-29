

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const BoyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm0 12c-3.866 0-7 2.239-7 5v2h14v-2c0-2.761-3.134-5-7-5Z"/>
        <path d="M18.5,18.15a1.2,1.2,0,0,0-1-1.15l-1.3-.35a1,1,0,0,0-1.2.8l-.5,1.85h-5l-.5-1.85a1,1,0,0,0-1.2-.8L6.5,17a1.2,1.2,0,0,0-1,1.15L5,22h14Z" />
        <path fill="hsl(var(--background))" stroke="hsl(var(--background))" strokeWidth="0.5" d="M9.4,18.5a1,1,0,0,1,1.2-.8l1.4.35l1.4-.35a1,1,0,0,1,1.2.8l.6,2.2H8.8Z" />
    </svg>
);

const GirlIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.25c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 10.5c-3.31 0-6 2.69-6 6v1.5h12v-1.5c0-3.31-2.69-6-6-6z"/>
    </svg>
);


const hostelCategories = [
  { name: 'For Boys', icon: BoyIcon, href: '/hostels?for=boys', description: 'Find hostels exclusively for boys.', cardClass: 'bg-blue-300' },
  { name: 'For Girls', icon: GirlIcon, href: '/hostels?for=girls', description: 'Find hostels exclusively for girls.', cardClass: 'bg-pink-300' },
  { name: 'Co-living', icon: Users, href: '/hostels?for=coliving', description: 'Find hostels for everyone.', cardClass: 'bg-gradient-to-r from-[#E0F2FE] to-[#FFD1DC]' },
];

export default function HostelCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [selectedHref, setSelectedHref] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setSelectedHref(href);
    setIsDialogOpen(true);
  };

  const handleLocationSubmit = () => {
    if (!location.trim()) {
      toast({
        variant: 'destructive',
        title: 'Location Required',
        description: 'Please enter a city to search.',
      });
      return;
    }
    setIsDialogOpen(false);
    router.push(`${selectedHref}&location=${encodeURIComponent(location)}`);
  };

  const handleDetectLocation = async () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        toast({ variant: "destructive", title: "Configuration Error", description: "Google Maps API Key is not configured." });
        return;
    }
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Geolocation not supported", description: "Your browser does not support location detection." });
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
          const data = await response.json();
          if (data.results && data.results[0]) {
            const address = data.results[0].address_components;
            const cityComponent = address.find((c: any) => c.types.includes('locality') || c.types.includes('administrative_area_level_3'));
            if (cityComponent) {
                setLocation(cityComponent.long_name);
                toast({ title: "Location Detected", description: `Searching for hostels in ${cityComponent.long_name}.` });
            } else {
                 throw new Error("City not found in location data");
            }
          } else { throw new Error("No results found"); }
        } catch (error) {
          toast({ variant: "destructive", title: "Could not fetch address", description: "Please enter your city manually." });
        } finally { setIsDetectingLocation(false); }
      },
      () => {
        toast({ variant: "destructive", title: "Location access denied", description: "Please allow location access in your browser settings." });
        setIsDetectingLocation(false);
      }
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="relative flex items-center justify-center mb-6">
          <Button variant="ghost" size="icon" asChild className="absolute left-0">
            <Link href="/home">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold">Find a Hostel</h1>
        </header>

        <p className="text-center text-muted-foreground mb-6">Select the type of accommodation you're looking for.</p>

        <div className="grid grid-cols-1 gap-6">
          {hostelCategories.map((category) => {
            const Icon = category.icon;
            return (
            <a href={category.href} onClick={(e) => handleCategoryClick(e, category.href)} key={category.name} className="group cursor-pointer">
              <Card className={cn(
                "h-full transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl border-0",
                category.cardClass
              )}>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center text-black">
                  <Icon className="h-16 w-16 transition-colors" />
                  <h2 className="mt-4 font-headline text-2xl font-semibold">{category.name}</h2>
                  <p className="mt-2 text-sm">{category.description}</p>
                </CardContent>
              </Card>
            </a>
          )})}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Location</DialogTitle>
            <DialogDescription>
              Enter a city name or let us detect your location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                <MapPin className="inline-block h-5 w-5"/>
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Bengaluru"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button variant="outline" onClick={handleDetectLocation} disabled={isDetectingLocation}>
                {isDetectingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                Detect My Location
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={handleLocationSubmit} className="w-full">Search Hostels</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
