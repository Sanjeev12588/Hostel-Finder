
'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { ChevronLeft, Upload, Loader2, X, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { postRoommateAction } from '@/lib/actions';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const allSharerOptions = [
  { id: '1-sharer', label: '1 Sharer' },
  { id: '2-sharers', label: '2 Sharers' },
  { id: '3-sharers', label: '3 Sharers' },
  { id: '4-plus-sharers', label: '4+ Sharers' },
];

export default function PostRoommateAdPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newAdId, setNewAdId] = useState<string | undefined>();
  
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  // States for controlled components
  const [yourName, setYourName] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [areaLandmark, setAreaLandmark] = useState('');
  const [rentRange, setRentRange] = useState('');
  const [sharers, setSharers] = useState<string[]>([]);
  const [showCustomSharer, setShowCustomSharer] = useState(false);
  const [customSharer, setCustomSharer] = useState('');
  const [roomType, setRoomType] = useState<string[]>([]);
  const [forType, setForType] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [contact, setContact] = useState('');
  
  const fetchPincodeData = async (code: string) => {
    setIsPincodeLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await response.json();
      if (data && data[0] && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setCity(postOffice.Block === "N/A" ? postOffice.District : postOffice.Block);
        setDistrict(postOffice.District);
        setStateName(postOffice.State);
        return true;
      } else {
         toast({ variant: "destructive", title: "Invalid Pincode", description: "Could not find location for this pincode." });
         return false;
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Pincode Error", description: "Failed to fetch pincode details." });
       return false;
    } finally {
      setIsPincodeLoading(false);
    }
  };

  useEffect(() => {
    if (pincode.length === 6) {
      fetchPincodeData(pincode);
    }
  }, [pincode]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

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
            const pincodeComponent = address.find((c: any) => c.types.includes('postal_code'));
            const streetComponent = address.find((c: any) => c.types.includes('route') || c.types.includes('sublocality_level_1') || c.types.includes('sublocality'));
            if (streetComponent) setAreaLandmark(streetComponent.long_name);
            if (pincodeComponent) {
                const fetchedPincode = pincodeComponent.long_name;
                setPincode(fetchedPincode);
                await fetchPincodeData(fetchedPincode);
                toast({ title: "Location Detected", description: "Address fields have been pre-filled." });
            } else {
                 throw new Error("Pincode not found in location data");
            }
          } else { throw new Error("No results found"); }
        } catch (error) {
          toast({ variant: "destructive", title: "Could not fetch address", description: "Please enter your details manually." });
        } finally { setIsDetectingLocation(false); }
      },
      () => {
        toast({ variant: "destructive", title: "Location access denied", description: "Please allow location access in your browser settings." });
        setIsDetectingLocation(false);
      }
    );
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const fiveMB = 5 * 1024 * 1024;
      
      const validFiles: File[] = [];
      const oversizedFiles: string[] = [];
      const totalFiles = files.length + selectedFiles.length;

      if (totalFiles > 4) {
        toast({
          variant: 'destructive',
          title: 'Too Many Images',
          description: 'You can upload a maximum of 4 images.',
        });
        return;
      }
      
      for (const file of selectedFiles) {
        if (file.size > fiveMB) {
          oversizedFiles.push(file.name);
        } else {
          validFiles.push(file);
        }
      }

      if (oversizedFiles.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Some Images Too Large',
          description: `The following files are over 5MB and were not added: ${oversizedFiles.join(', ')}`,
        });
      }
      
      setFiles(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setFiles(files.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.delete('images');
    files.forEach(file => formData.append('images', file, file.name));

    try {
        const result = await postRoommateAction(formData);
        if (result.success && result.newAdId) {
            setNewAdId(result.newAdId);
            setShowSuccessDialog(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error Posting Ad',
                description: result.message,
            });
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred while posting your ad.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDialogAction = (path: string) => {
    setShowSuccessDialog(false);
    router.refresh(); // Refresh data on other pages
    router.push(path);
  };

  const handleDialogOnOpenChange = (open: boolean) => {
    if (!open) {
      // This handles closing via Esc or overlay click
      router.refresh();
    }
    setShowSuccessDialog(open);
  };

    if (!user) {
        return (
            <AppLayout>
                <div className="container mx-auto max-w-2xl p-4 text-center">
                    <h1 className="font-headline text-2xl font-bold">Post Room Ad</h1>
                    <p className="mt-4">Please log in to post an ad.</p>
                    <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
                </div>
            </AppLayout>
        )
    }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4 pb-28">
        <header className="relative flex items-center justify-center mb-6">
          <Button variant="ghost" size="icon" asChild className="absolute left-0"><Link href="/post"><ChevronLeft className="h-6 w-6" /></Link></Button>
          <h1 className="font-headline text-2xl font-bold">Post Room Ad</h1>
        </header>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              <input type="hidden" name="userId" value={user.uid} />

              {/* Hidden inputs for React state values */}
              {sharers.map((s) => ( <input key={s} type="hidden" name="sharers" value={s} /> ))}
              {roomType.map((r) => ( <input key={r} type="hidden" name="room-type" value={r} /> ))}
              {forType.map((f) => ( <input key={f} type="hidden" name="for" value={f} /> ))}

              <div className="space-y-2">
                <Label htmlFor="your-name">Your Name <span className="text-destructive">*</span></Label>
                <Input name="your-name" id="your-name" placeholder="e.g., Priya Singh" required value={yourName} onChange={e => setYourName(e.target.value)} />
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label>Full Address <span className="text-destructive">*</span></Label>
                    <Button type="button" variant="link" size="sm" onClick={handleDetectLocation} disabled={isDetectingLocation}>
                        {isDetectingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Detect Location
                    </Button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md border p-4">
                    <div className="relative">
                      <Input name="pincode" placeholder="Pincode" pattern="[0-9]{6}" title="Pincode must be 6 digits" required value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} />
                      {isPincodeLoading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                    </div>
                    <Input name="state" placeholder="State" required value={stateName} onChange={(e) => setStateName(e.target.value)} />
                    <Input name="district" placeholder="District" required value={district} onChange={(e) => setDistrict(e.target.value)} />
                    <Input name="city" placeholder="City" required value={city} onChange={(e) => setCity(e.target.value)} />
                    <div className="md:col-span-2">
                        <Input name="areaLandmark" placeholder="Area / Landmark" required value={areaLandmark} onChange={e => setAreaLandmark(e.target.value)} />
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent-range">Rent Range (₹) <span className="text-destructive">*</span></Label>
                <Input name="rent-range" id="rent-range" placeholder="e.g., 8000 - 10000" required value={rentRange} onChange={e => setRentRange(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Sharers Preferred <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-md border p-4">
                  {allSharerOptions.map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox value={item.label} id={`sharer-${item.id}`} checked={sharers.includes(item.label)} onCheckedChange={(checked) => { setSharers(prev => checked ? [...prev, item.label] : prev.filter(s => s !== item.label)) }} />
                      <Label htmlFor={`sharer-${item.id}`} className="font-normal">{item.label}</Label>
                    </div>
                  ))}
                   <div className="flex items-center space-x-2">
                    <Checkbox id="other-sharer" checked={showCustomSharer} onCheckedChange={(checked) => setShowCustomSharer(!!checked)} />
                    <Label htmlFor="other-sharer" className="font-normal">Other</Label>
                  </div>
                </div>
                {showCustomSharer && (
                  <div className="pt-2"><Input name="custom-sharer" placeholder="Enter custom preference" value={customSharer} onChange={e => setCustomSharer(e.target.value)} /></div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type <span className="text-destructive">*</span></Label>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox value="ac" id="ac" checked={roomType.includes('ac')} onCheckedChange={(checked) => { setRoomType(prev => checked ? [...prev, 'ac'] : prev.filter(r => r !== 'ac')) }} />
                      <Label htmlFor="ac" className="font-normal">AC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox value="non-ac" id="non-ac" checked={roomType.includes('non-ac')} onCheckedChange={(checked) => { setRoomType(prev => checked ? [...prev, 'non-ac'] : prev.filter(r => r !== 'non-ac')) }} />
                      <Label htmlFor="non-ac" className="font-normal">Non-AC</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                    <Label>Room For <span className="text-destructive">*</span></Label>
                     <div className="flex items-center space-x-4 pt-2">
                        {['boys', 'girls', 'coliving'].map(type => (
                            <div className="flex items-center space-x-2" key={type}>
                                <Checkbox value={type} id={`for-${type}`} checked={forType.includes(type)} onCheckedChange={(checked) => { setForType(prev => checked ? [...prev, type] : prev.filter(f => f !== type)) }} />
                                <Label htmlFor={`for-${type}`} className="font-normal capitalize">{type === 'coliving' ? 'Any (Co-living)' : type}</Label>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea name="description" id="description" placeholder="Describe your lifestyle, habits, and what you're looking for in a flatmate." className="min-h-[120px]" value={description} onChange={e => setDescription(e.target.value)} />
              </div>

               <div className="space-y-2">
                  <Label>Available From <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <DatePicker date={date} setDate={setDate} />
              </div>

              <div className="space-y-2">
                <Label>Upload Your Image <span className="text-destructive">*</span></Label>
                <p className="text-xs text-muted-foreground">Upload up to 4 images. Max 5MB each.</p>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 my-2">
                    {imagePreviews.map((src, index) => (
                      <div key={src} className="relative aspect-square group">
                        <Image src={src} alt={`Preview ${index}`} fill className="rounded-md object-cover" />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove image ${index + 1}`}><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-center w-full mt-2">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                    </div>
                    <input id="dropzone-file" name="images" type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} disabled={files.length >= 4} />
                  </label>
                </div> 
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Details <span className="text-destructive">*</span></Label>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground h-10">+91</span>
                    <Input name="contact" id="contact" type="tel" pattern="[0-9]{10}" title="Phone number must be 10 digits" placeholder="XXXXXXXXXX" required className="rounded-l-none" value={contact} onChange={e => setContact(e.target.value)} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting Ad...
                    </>
                ) : 'Post Ad'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showSuccessDialog} onOpenChange={handleDialogOnOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
             <div className="mx-auto inline-block rounded-full bg-green-100 p-3">
                <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold pt-4">Ad Posted Successfully!</DialogTitle>
            <DialogDescription>
              Your ad is now live. You can view it or return to the home page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 mt-4">
            <Button className="w-full" onClick={() => handleDialogAction(`/roommates/${newAdId}`)}>
              View Ad
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleDialogAction('/home')}>
              Go to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
