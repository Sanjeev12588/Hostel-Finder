
'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, MapPin, Phone, Star, Navigation, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addReview } from '@/lib/actions';
import { cn } from '@/lib/utils';
import type { Room, Review } from '@/lib/definitions';
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
import SingleLocationMap from '../map/single-location-map';

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

export default function RoommateDetailClient({ roommate, reviews }: { roommate: Room, reviews: Review[] }) {
  const router = useRouter();
  const allImages = (roommate.images && roommate.images.length > 0 ? roommate.images : [roommate.image]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    <div className="pb-10">
      <div className="relative h-56 w-full cursor-pointer" onClick={() => openImageViewer(0)}>
         <Image
          src={allImages[0]}
          alt={roommate.name}
          fill
          className="object-cover"
          priority
          data-ai-hint={roommate.imageHints?.[0] || roommate.hint}
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
            <h1 className="font-headline text-3xl font-bold drop-shadow-lg">{roommate.name}, {roommate.age}</h1>
            <p className="text-sm drop-shadow-md">{roommate.occupation}</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground">Posted {formatDistanceToNow(new Date(roommate.createdAt), { addSuffix: true })}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{roommate.rent}</p>
                <span className="text-muted-foreground text-sm">/ month</span>
              </div>
            </div>
            <p className="text-foreground pt-4">{roommate.about}</p>
             {allImages.length > 1 && (
              <div>
                <h3 className="font-bold mb-2">More photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {allImages.slice(1, 4).map((img, index) => (
                    <div key={index} className="relative aspect-square cursor-pointer" onClick={() => openImageViewer(index + 1)}>
                       <Image src={img} alt={`${roommate.name} extra photo ${index+1}`} fill className="rounded-lg object-cover" />
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
              <span>{roommate.location}</span>
            </div>
            <SingleLocationMap center={{ lat: roommate.lat!, lng: roommate.lng! }} />
            <Button asChild className="w-full">
              <Link href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(roommate.location)}`} target="_blank" rel="noopener noreferrer">
                <Navigation className="mr-2 h-4 w-4" /> Get Directions
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Looking for</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {roommate.preferences?.map((pref) => (
              <Badge key={pref} variant="secondary">{pref}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Posted by</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={roommate.postedBy?.avatar} alt={roommate.postedBy?.name} data-ai-hint="person avatar" />
                <AvatarFallback>{roommate.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{roommate.postedBy?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">Looking for a flatmate</p>
              </div>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button>Contact</Button></AlertDialogTrigger>
                <ContactDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Contact {roommate.postedBy?.name || 'User'}</AlertDialogTitle>
                        <AlertDialogDescription>You can call them directly using the button below.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-1 gap-4 pt-4">
                        <Button asChild disabled={!roommate.contact} className="w-full">
                            <a href={`tel:${roommate.contact}`}><Phone className="mr-2 h-4 w-4" /> Call</a>
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
                                        {[1, 2, 3, 4, 5].map(star => ( <Star key={star} className={cn("h-4 w-4", star <= review.rating ? 'text-primary fill-current' : 'text-muted-foreground/30')} />))}
                                    </div>
                                    <p className="mt-2 text-sm text-foreground/80">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : ( <p className="text-center text-muted-foreground py-4">No reviews yet. Be the first to leave one!</p> )}
            </CardContent>
        </Card>

        <ReviewForm itemId={roommate.id} itemType="room" />
      </div>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-3xl p-0 border-0 bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitleComponent>Image Viewer: {roommate.name}</DialogTitleComponent>
            <DialogDescription>
              Image {selectedImageIndex + 1} of {allImages.length}. Use arrow buttons to navigate images.
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video">
              <Image
                  src={allImages[selectedImageIndex]}
                  alt={`${roommate.name} image ${selectedImageIndex + 1}`}
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
