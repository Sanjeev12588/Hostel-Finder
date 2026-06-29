
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface CarouselSlide {
  id: string;
  title: string;
  price: string;
  subtitle: string;
  imageUrl: string;
  href: string;
  order: number;
  imageHint?: string;
}

const placeholderSlides: CarouselSlide[] = [
    {
      id: '1',
      title: 'Co-living Rooms',
      price: 'Live Together. Thrive Together.',
      subtitle: 'Shared & Private Rooms',
      imageUrl: 'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBiZWRyb29tfGVufDB8fHx8MTc1MzExODg4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      href: '/hostels?for=coliving',
      order: 1,
      imageHint: 'modern bedroom',
    },
    {
      id: '2',
      title: 'Find Your Roommate',
      price: 'Stay Together. Live Better.',
      subtitle: 'Connect with verified users',
      imageUrl: 'https://images.unsplash.com/photo-1643061754933-82a75ce41f1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxncm91cCUyMGZyaWVuZHMlMjBsYXVnaGluZ3xlbnwwfHx8fDE3NTMxMTg4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      href: '/roommates/category',
      order: 2,
      imageHint: 'group friends laughing',
    },
    {
      id: '3',
      title: 'Location-Based Search',
      price: 'Find places near you',
      subtitle: 'Discover hostels in your desired area',
      imageUrl: 'https://images.unsplash.com/photo-1587400873582-230980eb46eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxtYXAlMjBsb2NhdGlvbiUyMHBpbnxlbnwwfHx8fDE3NTMxMTg4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      href: '/map',
      order: 3,
      imageHint: 'map location pin',
    },
    {
      id: '4',
      title: 'Verified Listings',
      price: 'Verified Spaces. Peace of Mind.',
      subtitle: 'Explore verified hostels, rooms, and flats.',
      imageUrl: 'https://images.unsplash.com/photo-1702825342501-0d007615f073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx2ZXJpZmllZCUyMHN0YW1wJTIwY2hlY2ttYXJrfGVufDB8fHx8MTc1MzExODg4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      href: '/hostels/category',
      order: 4,
      imageHint: 'verified stamp checkmark',
    },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    const fetchCarouselData = async () => {
      if (!db) {
        console.warn("Firestore is not initialized, using placeholder data.");
        setSlides(placeholderSlides);
        setIsLoading(false);
        return;
      }
      try {
        const carouselQuery = query(collection(db, "carouselImages"), orderBy("order"));
        const querySnapshot = await getDocs(carouselQuery);
        if (querySnapshot.empty) {
          setSlides(placeholderSlides);
        } else {
          const slideData: CarouselSlide[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            slideData.push({
              id: doc.id,
              ...data,
            } as CarouselSlide);
          });
          setSlides(slideData);
        }
      } catch (error) {
        console.error("Failed to fetch carousel data, using placeholders:", error);
        setSlides(placeholderSlides);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  const nextSlide = React.useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 1) {
      const intervalId = setInterval(nextSlide, 5000); // Change slide every 5 seconds
      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [slides.length, nextSlide]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };
  
  if (isLoading) {
    return <Skeleton className="w-full h-56 md:h-64 rounded-lg bg-muted" />;
  }

  if (slides.length === 0) {
    return null;
  }
  
  return (
    <div className="relative w-full h-56 md:h-64 overflow-hidden group rounded-lg">
        {slides.map((slide, index) => (
             <Link 
                href={slide.href} 
                key={slide.id}
                className={cn(
                    "absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out",
                    index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
                aria-hidden={index !== currentIndex}
             >
                <div className="relative w-full h-full">
                <Image 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    fill 
                    className="object-cover" 
                    data-ai-hint={slide.imageHint || 'abstract background'}
                    priority={index === 0}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-white">
                    <p className="text-xl md:text-2xl font-medium drop-shadow-lg">{slide.title}</p>
                    <p className="text-2xl md:text-4xl font-bold drop-shadow-lg my-1">{slide.price}</p>
                    <p className="text-base md:text-lg text-white/90 drop-shadow-lg">{slide.subtitle}</p>
                </div>
                </div>
            </Link>
        ))}
      
      <Button onClick={(e) => { e.preventDefault(); prevSlide(); }} variant="ghost" size="icon" className="absolute top-1/2 left-1 md:left-4 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button onClick={(e) => { e.preventDefault(); nextSlide(); }} variant="ghost" size="icon" className="absolute top-1/2 right-1 md:right-4 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={(e) => { e.preventDefault(); goToSlide(slideIndex); }}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-300',
              currentIndex === slideIndex ? 'bg-white w-6' : 'bg-white/50'
            )}
            aria-label={`Go to slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
