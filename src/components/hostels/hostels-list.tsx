
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Star, SlidersHorizontal, Heart, Building2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import type { Hostel } from '@/lib/definitions';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { toggleFavorite, getFavoriteIdsForClient } from '@/lib/actions';
import { cn, getDistanceFromLatLonInKm } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const allAmenities = [
    { id: 'WiFi', label: 'WiFi' },
    { id: 'Laundry', label: 'Laundry' },
    { id: 'Food Included', label: 'Food Included' },
];

const allRoomTypes = [
    { id: 'ac', label: 'AC' },
    { id: 'non-ac', label: 'Non-AC' },
];

const allSharingTypes = [
    { id: '1-sharing', label: '1 Sharing' },
    { id: '2-sharing', label: '2 Sharing' },
    { id: '3-sharing', label: '3 Sharing' },
    { id: '4-sharing', label: '4 Sharing' },
];

export default function HostelsListClient({ initialHostels }: { initialHostels: Hostel[] }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [hostels, setHostels] = useState<Hostel[]>(initialHostels);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('any');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
    const [selectedSharingTypes, setSelectedSharingTypes] = useState<string[]>([]);
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
            const areaSuggestions = initialHostels
                .map(h => h.areaLandmark)
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
        
        let filtered = [...initialHostels];
        
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
                    filtered = filtered.filter(h => {
                        const distance = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, h.lat, h.lng);
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
            filtered = filtered.filter(h => 
                (h.areaLandmark && h.areaLandmark.toLowerCase().includes(term)) ||
                (h.location && h.location.toLowerCase().includes(term))
            );
        }
        
        if (selectedAmenities.length > 0) {
            filtered = filtered.filter(h => 
                h.facilities && selectedAmenities.every(amenity => h.facilities!.includes(amenity))
            );
        }

        if (selectedRoomTypes.length > 0) {
            filtered = filtered.filter(h => 
                h.roomType && selectedRoomTypes.every(rt => h.roomType!.includes(rt))
            );
        }

        if (selectedSharingTypes.length > 0) {
            filtered = filtered.filter(h => 
                h.sharingType && selectedSharingTypes.every(st => h.sharingType!.includes(st))
            );
        }

        if (sortBy === 'price-low-to-high') {
            filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'price-high-to-low') {
            filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortBy === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }
        
        setHostels(filtered);
        setIsSheetOpen(false);
        setIsApplyingFilters(false);
    };
    
    const handleClearFilters = () => {
        setSearchTerm('');
        setSortBy('any');
        setSelectedAmenities([]);
        setSelectedRoomTypes([]);
        setSelectedSharingTypes([]);
        setRadius([50]);
        setHostels(initialHostels);
        setIsSheetOpen(false);
    };

    const handleAmenityChange = (amenityId: string, checked: boolean) => {
        setSelectedAmenities(prev => 
            checked ? [...prev, amenityId] : prev.filter(id => id !== amenityId)
        );
    };

    const handleRoomTypeChange = (roomTypeId: string, checked: boolean) => {
        setSelectedRoomTypes(prev => 
            checked ? [...prev, roomTypeId] : prev.filter(id => id !== roomTypeId)
        );
    };

    const handleSharingTypeChange = (sharingTypeId: string, checked: boolean) => {
        setSelectedSharingTypes(prev => 
            checked ? [...prev, sharingTypeId] : prev.filter(s => s !== sharingTypeId)
        );
    };

    const handleFavoriteToggle = (e: React.MouseEvent, hostelId: string) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Please log in to add favorites.' });
            return;
        }
        startTransition(async () => {
            const newFavoriteIds = new Set(favoriteIds);
            if (newFavoriteIds.has(hostelId)) {
                newFavoriteIds.delete(hostelId);
            } else {
                newFavoriteIds.add(hostelId);
            }
            setFavoriteIds(newFavoriteIds);
            await toggleFavorite(user.uid, hostelId, 'hostel');
        });
    };

    if (initialHostels.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 space-y-4 text-center">
            <Building2 className="h-24 w-24 text-muted-foreground/50" />
            <h1 className="font-headline text-3xl font-bold">No Hostels Found</h1>
            <p className="text-muted-foreground">We couldn't find any hostels in this city. Try another location.</p>
            <Button asChild>
              <Link href="/hostels/category">Change Location</Link>
            </Button>
          </div>
        );
    }

  return (
    <div className="p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="font-headline text-3xl font-bold">Hostels in {searchParams.get('location')}</h1>
        <p className="text-muted-foreground">Browse through hundreds of verified listings.</p>
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
                    <RadioGroupItem value="rating" id="rating" />
                    <Label htmlFor="rating">Highest Rated</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-low-to-high" id="low-to-high" />
                    <Label htmlFor="low-to-high">Price: Low to High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-high-to-low" id="high-to-low" />
                    <Label htmlFor="high-to-low">Price: High to Low</Label>
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
                <h4 className="text-base font-semibold">Amenities</h4>
                <div className="mt-2 space-y-2">
                  {allAmenities.map(amenity => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={amenity.id} 
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={(checked) => handleAmenityChange(amenity.id, !!checked)}
                        />
                        <Label htmlFor={amenity.id}>{amenity.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
               <div>
                <h4 className="text-base font-semibold">Room Type</h4>
                <div className="mt-2 space-y-2">
                  {allRoomTypes.map(rt => (
                    <div key={rt.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`rt-${rt.id}`} 
                            checked={selectedRoomTypes.includes(rt.id)}
                            onCheckedChange={(checked) => handleRoomTypeChange(rt.id, !!checked)}
                        />
                        <Label htmlFor={`rt-${rt.id}`}>{rt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
               <Separator />
               <div>
                <h4 className="text-base font-semibold">Sharing Type</h4>
                <div className="mt-2 space-y-2">
                  {allSharingTypes.map(st => (
                    <div key={st.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`st-${st.id}`} 
                            checked={selectedSharingTypes.includes(st.id)}
                            onCheckedChange={(checked) => handleSharingTypeChange(st.id, !!checked)}
                        />
                        <Label htmlFor={`st-${st.id}`}>{st.label}</Label>
                    </div>
                  ))}
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
      
      {hostels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostels.map(hostel => (
             <Link href={`/hostels/${hostel.id}`} key={hostel.id} className="group">
                <Card className="overflow-hidden h-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    <div className="relative">
                      <Image src={hostel.image} alt={hostel.name} width={400} height={200} className="w-full object-cover aspect-[3/2]" data-ai-hint={hostel.hint} />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
                        onClick={(e) => handleFavoriteToggle(e, hostel.id)}
                        disabled={isPending}
                      >
                        <Heart className={cn("h-4 w-4 text-white", favoriteIds.has(hostel.id) && "fill-red-500 text-red-500")} />
                        <span className="sr-only">Add to Favourites</span>
                      </Button>
                    </div>
                    <CardContent className="p-4">
                        <h3 className="font-bold text-lg truncate">{hostel.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {hostel.location}
                        </p>
                        <p className="text-sm my-2 h-10 overflow-hidden text-ellipsis text-foreground/80">
                          {hostel.description.substring(0, 100)}{hostel.description.length > 100 ? '...' : ''}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-lg text-primary font-bold">₹{hostel.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
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
      ) : (
         <div className="flex flex-col items-center justify-center h-full p-4 space-y-4 text-center mt-10">
            <Search className="h-24 w-24 text-muted-foreground/50" />
            <h1 className="font-headline text-3xl font-bold">No Results</h1>
            <p className="text-muted-foreground">No hostels matched your search. Try a different area or filter.</p>
            <div className="flex gap-2">
                <Button onClick={handleClearFilters}>Clear Filters</Button>
                <Button asChild variant="outline">
                    <Link href="/hostels/category">Change Location</Link>
                </Button>
            </div>
          </div>
      )}
    </div>
  );
}

    
