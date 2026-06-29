
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, SlidersHorizontal, Heart, Users, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import type { Room } from '@/lib/definitions';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { toggleFavorite, getFavoriteIdsForClient } from '@/lib/actions';
import { cn, getDistanceFromLatLonInKm } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';


export default function RoommatesListClient({ initialRoommates }: { initialRoommates: Room[] }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [roommates, setRoommates] = useState<Room[]>(initialRoommates);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('any');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [radius, setRadius] = useState([50]);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  
  useEffect(() => {
    if (user) {
        getFavoriteIdsForClient(user.uid).then(ids => {
            setFavoriteIds(new Set(ids));
        });
    }
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
        const areaSuggestions = initialRoommates
            .map(r => r.areaLandmark)
            .filter((area): area is string => !!area)
            .filter(area => area.toLowerCase().includes(value.toLowerCase()));
        
        const uniqueSuggestions = [...new Set(areaSuggestions)];
        setSuggestions(uniqueSuggestions.slice(0, 5));
    } else {
        setSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    handleApplyFilters(suggestion);
  };

  const handleApplyFilters = async (currentSearchTerm = searchTerm) => {
    setIsApplyingFilters(true);
    let filtered = [...initialRoommates];

    if (radius[0] < 50) {
        try {
            const userLocation = await new Promise<GeolocationCoordinates>((resolve, reject) => {
                if (!navigator.geolocation) {
                    return reject(new Error("Geolocation is not supported by your browser."));
                }
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve(position.coords),
                    (error) => reject(error)
                );
            });

            if (userLocation) {
                filtered = filtered.filter(r => {
                    const distance = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, r.lat, r.lng);
                    return distance <= radius[0];
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Location Error',
                description: error.code === 1 ? "To filter by distance, please enable location access in your browser settings." : "Could not get your location.",
            });
            setIsApplyingFilters(false);
            return;
        }
    }
    
    if (currentSearchTerm) {
        const term = currentSearchTerm.toLowerCase();
        filtered = filtered.filter(r => 
            (r.areaLandmark && r.areaLandmark.toLowerCase().includes(term)) ||
            (r.location && r.location.toLowerCase().includes(term))
        );
    }
    
    if (selectedGenders.length > 0) {
        filtered = filtered.filter(r => r.type && selectedGenders.some(g => r.type.includes(g)));
    }
    
    const parseRent = (rent: string) => parseFloat(rent.split('-')[0].trim()) || 0;

    if (sortBy === 'rent-low-to-high') {
        filtered.sort((a, b) => parseRent(a.rent) - parseRent(b.rent));
    } else if (sortBy === 'rent-high-to-low') {
        filtered.sort((a, b) => parseRent(b.rent) - parseRent(a.rent));
    } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }
    
    setRoommates(filtered);
    setIsSheetOpen(false);
    setIsApplyingFilters(false);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('any');
    setSelectedGenders([]);
    setRadius([50]);
    setRoommates(initialRoommates);
    setIsSheetOpen(false);
  };
  
  const handleGenderChange = (gender: string, checked: boolean) => {
    setSelectedGenders(prev => 
        checked ? [...prev, gender] : prev.filter(g => g !== gender)
    );
  };
  
  const handleFavoriteToggle = (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Please log in to add favorites.' });
        return;
    }
    startTransition(async () => {
        const newFavoriteIds = new Set(favoriteIds);
        if (newFavoriteIds.has(roomId)) {
            newFavoriteIds.delete(roomId);
        } else {
            newFavoriteIds.add(roomId);
        }
        setFavoriteIds(newFavoriteIds);
        await toggleFavorite(user.uid, roomId, 'room');
    });
  };

  if (initialRoommates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-4 text-center">
        <Users className="h-24 w-24 text-muted-foreground/50" />
        <h1 className="font-headline text-3xl font-bold">No Rooms Found</h1>
        <p className="text-muted-foreground">We couldn't find any rooms in this city. Try another location.</p>
        <Button asChild>
          <Link href="/roommates/category">Change Location</Link>
        </Button>
      </div>
    );
  }

  return (
      <div className="p-4 space-y-6">
        <header className="space-y-2">
          <h1 className="font-headline text-3xl font-bold">Rooms in {searchParams.get('location')}</h1>
          <p className="text-muted-foreground">Connect with potential flatmates in your city.</p>
        </header>

        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input 
                placeholder="Search by area or landmark..." 
                className="pl-10" 
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleApplyFilters();
                        setSuggestions([]);
                    }
                }}
                onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            />
            {suggestions.length > 0 && (
              <Card className="absolute top-full mt-1 w-full z-20">
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                      <li key={index}
                          onMouseDown={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-2 cursor-pointer hover:bg-muted"
                      >
                          {suggestion}
                      </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
               <Button variant="outline" size="icon" className="shrink-0">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6 flex-1 overflow-y-auto">
                 <div>
                  <Label className="text-base font-semibold">Sort by</Label>
                  <RadioGroup value={sortBy} onValueChange={setSortBy} className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rating" id="rent-rating" />
                      <Label htmlFor="rent-rating">Highest Rated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rent-low-to-high" id="rent-low-to-high" />
                      <Label htmlFor="rent-low-to-high">Rent: Low to High</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rent-high-to-low" id="rent-high-to-low" />
                      <Label htmlFor="rent-high-to-low">Rent: High to Low</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Separator />
                <div>
                  <Label className="text-base font-semibold">Distance</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={radius}
                      onValueChange={setRadius}
                      max={50}
                      step={1}
                    />
                    <span className="text-sm font-medium w-24 text-right">
                      {radius[0] < 50 ? `Within ${radius[0]} km` : 'Any'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Uses your current location.</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-base font-semibold">Looking for</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="boys" checked={selectedGenders.includes('boys')} onCheckedChange={(c) => handleGenderChange('boys', !!c)} />
                      <Label htmlFor="boys">Boys</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="girls" checked={selectedGenders.includes('girls')} onCheckedChange={(c) => handleGenderChange('girls', !!c)} />
                      <Label htmlFor="girls">Girls</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="coliving" checked={selectedGenders.includes('coliving')} onCheckedChange={(c) => handleGenderChange('coliving', !!c)} />
                      <Label htmlFor="coliving">Co-living</Label>
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter className="mt-auto flex-col sm:flex-col sm:space-x-0 gap-2">
                 <Button variant="outline" onClick={handleClearFilters} className="w-full">
                  Clear Filters
                </Button>
                <Button onClick={() => handleApplyFilters()} className="w-full" disabled={isApplyingFilters}>
                  {isApplyingFilters ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Applying...</> : 'Apply Filters'}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        
        {roommates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roommates.map(roommate => (
               <Link href={`/roommates/${roommate.id}`} key={roommate.id} className="group">
                  <Card className="overflow-hidden h-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                      <div className="relative">
                        <Image src={roommate.image} alt={roommate.name} width={400} height={200} className="w-full object-cover aspect-[3/2]" data-ai-hint={roommate.hint} />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
                          onClick={(e) => handleFavoriteToggle(e, roommate.id)}
                          disabled={isPending}
                        >
                          <Heart className={cn("h-4 w-4 text-white", favoriteIds.has(roommate.id) && "fill-red-500 text-red-500")} />
                          <span className="sr-only">Add to Favourites</span>
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white p-2 rounded-lg">
                          <h3 className="font-bold text-lg">{roommate.name}</h3>
                          <p className="text-sm">{roommate.age}, {roommate.occupation}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4" />
                              {roommate.location}
                          </p>
                          <p className="text-sm my-2 h-10 overflow-hidden text-ellipsis text-foreground/80">
                            {roommate.shortBio}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-lg text-primary font-bold">₹{roommate.rent}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            {roommate.rating > 0 && (
                                <div className="flex items-center gap-1 text-sm bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                                    <Star className="text-yellow-600 fill-current h-4 w-4" />
                                    <span className="font-bold">{roommate.rating.toFixed(1)}</span>
                                </div>
                            )}
                          </div>
                      </CardContent>
                  </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 space-y-4 text-center mt-10">
            <Search className="h-24 w-24 text-muted-foreground/50" />
            <h1 className="font-headline text-3xl font-bold">No Results</h1>
            <p className="text-muted-foreground">No rooms matched your search. Try a different area or filter.</p>
            <div className="flex gap-2">
                <Button onClick={handleClearFilters}>Clear Filters</Button>
                <Button asChild variant="outline">
                    <Link href="/roommates/category">Change Location</Link>
                </Button>
            </div>
          </div>
        )}
      </div>
  );
}

    
