
'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ChevronLeft, Star, Phone, Navigation, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addReview } from '@/lib/actions';
import { cn } from '@/lib/utils';
import type { Hostel, Review } from '@/lib/definitions';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent as ContactDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { getFacilityIcon } from '@/lib/facility-icons';
import SingleLocationMap from '../map/single-location-map';
import Link from 'next/link';

function ReviewForm({ itemId, itemType }: { itemId: string, itemType: 'hostel' | 'room' }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [rating, setRating] = useState(0);

    const initialState = { success: false, message: "" };
    async function submitReviewAction(prevState: any, formData: FormData) {
        const comment = formData.get('comment')?.toString();
        const userId = user?.uid;

        if (!userId) {
            return { success: false, message: "You must be logged in to post a review." };
        }
        if (rating === 0 || !comment) {
            return { success: false, message: "Please provide a rating and a comment." };
        }
        
        try {
            await addReview(itemId, itemType, rating, comment, userId);
            return { success: true, message: "Your review has been submitted!" };
        } catch (error) {
            return { success: false, message: "Failed to submit review. Please try again." };
        }
    }
    const [state, formAction] = useFormState(submitReviewAction, initialState);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                setRating(0);
                // In a real app, you'd also want to clear the textarea
            }
        }
    }, [state, toast]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Leave a Review</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Your Rating</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                                    <Star className={cn('h-7 w-7 cursor-pointer transition-colors', star <= rating ? 'text-primary fill-current' : 'text-muted-foreground/50')} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <Textarea name="comment" placeholder="Share your experience..." className="min-h-[100px]" />
                    <Button type="submit" className="w-full" disabled={!user}>
                        {user ? 'Submit Review' : 'Login to Review'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function HostelDetailClient({ hostel, reviews }: { hostel: Hostel, reviews: Review[] }) {
  const router = useRouter();
  const allImages = (hostel.images && hostel.images.length > 0 ? hostel.images : [hostel.image]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    try {
      const recentlyViewedJSON = localStorage.getItem('recentlyViewed');
      let recentlyViewed: (Hostel & { viewedAt: number })[] = recentlyViewedJSON ? JSON.parse(recentlyViewedJSON) : [];
      
      // Remove the hostel if it's already in the list
      recentlyViewed = recentlyViewed.filter(item => item.id !== hostel.id);
      
      // Add the new hostel to the beginning of the list with a timestamp
      const hostelWithTimestamp = { ...hostel, viewedAt: Date.now() };
      recentlyViewed.unshift(hostelWithTimestamp);
      
      // Keep only the 10 most recent items
      recentlyViewed = recentlyViewed.slice(0, 10);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (error) {
      console.warn("Could not update recently viewed hostels:", error);
    }
  }, [hostel]);

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setIsViewerOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };
  
  const handleBackClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.back();
  }

  return (
    <div className='pb-10'>
      <div className="relative h-56 w-full cursor-pointer" onClick={() => openImageViewer(0)}>
        <Image
          src={allImages[0]}
          alt={hostel.name}
          fill
          className="object-cover"
          priority
          data-ai-hint={hostel.imageHints?.[0] || hostel.hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="absolute top-4 left-4 bg-background/70 hover:bg-background/90 p-2 rounded-full z-10 h-auto w-auto"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="absolute bottom-4 left-4 text-white z-10">
          <h1 className="font-headline text-3xl font-bold drop-shadow-lg">{hostel.name}</h1>
          <p className="text-sm drop-shadow-md">
              Posted {formatDistanceToNow(new Date(hostel.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary">₹{hostel.price}</p>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <p className="text-foreground">{hostel.description}</p>
            {allImages.length > 1 && (
              <div>
                <h3 className="font-bold mb-2">More photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {allImages.slice(1, 4).map((img, index) => (
                    <div key={index} className="relative aspect-square cursor-pointer" onClick={() => openImageViewer(index + 1)}>
                       <Image src={img} alt={`${hostel.name} extra photo ${index+1}`} fill className="rounded-lg object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
              <span>{hostel.address || hostel.location}</span>
            </div>
            <SingleLocationMap center={{ lat: hostel.lat!, lng: hostel.lng! }} />
            <Button asChild className="w-full">
              <Link href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hostel.address || hostel.location)}`} target="_blank" rel="noopener noreferrer">
                <Navigation className="mr-2 h-4 w-4" /> Get Directions
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Facilities</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {hostel.facilities?.map((facilityName) => {
              const Icon = getFacilityIcon(facilityName);
              return (
                <div key={facilityName} className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="font-medium">{facilityName}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Contact Owner</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src={hostel.owner?.avatar || 'https://placehold.co/100x100.png'} alt={hostel.owner?.name || 'Owner'} width={48} height={48} className="rounded-full" data-ai-hint="person avatar" />
              <div>
                <p className="font-semibold">{hostel.owner?.name || 'Owner Name'}</p>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button>Contact</Button></AlertDialogTrigger>
                <ContactDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Contact {hostel.owner?.name || 'Owner'}</AlertDialogTitle>
                        <AlertDialogDescription>You can call the owner directly using the button below.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-1 gap-4 pt-4">
                        <Button asChild disabled={!hostel.contact} className="w-full">
                            <a href={`tel:${hostel.contact}`}><Phone className="mr-2 h-4 w-4" /> Call</a>
                        </Button>
                    </div>
                    <AlertDialogFooter className="mt-4"><AlertDialogCancel>Cancel</AlertDialogCancel></AlertDialogFooter>
                </ContactDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Ratings & Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={review.user.avatar} alt={review.user.name} data-ai-hint="person avatar" />
                                    <AvatarFallback>{review.user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{review.user.name}</p>
                                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map(star => (<Star key={star} className={cn("h-4 w-4", star <= review.rating ? 'text-primary fill-current' : 'text-muted-foreground/30')} />))}
                                    </div>
                                    <p className="mt-2 text-sm text-foreground/80">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : ( <p className="text-center text-muted-foreground py-4">No reviews yet. Be the first to leave one!</p> )}
            </CardContent>
        </Card>

        <ReviewForm itemId={hostel.id} itemType="hostel" />
      </div>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-3xl p-0 border-0 bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitleComponent>Image Viewer: {hostel.name}</DialogTitleComponent>
            <DialogDescription>
              Image {selectedImageIndex + 1} of {allImages.length}. Use arrow buttons to navigate images.
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video">
              <Image
                  src={allImages[selectedImageIndex]}
                  alt={`${hostel.name} image ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain"
              />
          </div>
          {allImages.length > 1 && (
              <>
                  <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 z-20"
                      onClick={prevImage}
                  >
                      <ChevronLeft />
                  </Button>
                  <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 z-20"
                      onClick={nextImage}
                  >
                      <ChevronRight />
                  </Button>
              </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
