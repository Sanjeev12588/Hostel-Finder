'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const onboardingSteps = [
  {
    image: "https://images.unsplash.com/photo-1587400873582-230980eb46eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxtYXAlMjBsb2NhdGlvbiUyMHBpbnxlbnwwfHx8fDE3NTMxMTg4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "map location pin",
    title: "Discover Nearby Hostels",
    description: "Easily find available rooms close to your location."
  },
  {
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxyb29tc3xlbnwwfHx8fDE3NTMxMjAyMzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "cozy room",
    title: "Find Your Perfect Roommate",
    description: "Connect with like-minded people to share your space."
  },
  {
    image: "https://images.unsplash.com/photo-1709805619372-40de3f158e83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8aG9zdGVsc3xlbnwwfHx8fDE3NTMxMTg1NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "hostel building",
    title: "List Your Own Space",
    description: "Easily rent out your room or hostel to verified users."
  }
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const setOnboardingComplete = () => {
    try {
      localStorage.setItem('hasOnboarded', 'true');
    } catch (e) {
      console.warn('Could not access localStorage to set onboarding status.');
    }
  };

  const handleGetStarted = () => {
    setOnboardingComplete();
    router.push('/signup');
  };

  const nextSlide = () => {
    if (currentIndex === onboardingSteps.length - 1) {
        handleGetStarted();
    } else {
        setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? onboardingSteps.length - 1 : prevIndex - 1));
  };


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 flex flex-col items-center p-6 text-center overflow-hidden pt-20">
        <div className="relative w-full h-full flex-1">
          {onboardingSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-in-out",
                index === currentIndex ? "opacity-100" : "opacity-0"
              )}
            >
              {index === currentIndex && (
                <div className="flex flex-col h-full">
                  <div className="flex-[2_2_0%] flex items-center justify-center">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={400}
                      height={300}
                      className="mx-auto rounded-lg object-contain max-h-full"
                      data-ai-hint={step.imageHint}
                      priority
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-center gap-4 pt-6">
                    <h1 className="font-headline text-3xl font-bold">{step.title}</h1>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="p-6 space-y-4">
        <div className="flex justify-between items-center">
            <Button onClick={prevSlide} variant="ghost" size="icon" className="rounded-full" disabled={currentIndex === 0}>
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex justify-center space-x-2">
                {onboardingSteps.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                    'h-2 w-2 rounded-full transition-all duration-300',
                    currentIndex === index ? 'bg-primary w-6' : 'bg-muted'
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                />
                ))}
            </div>
             <Button onClick={nextSlide} variant="ghost" size="icon" className="rounded-full">
                <ChevronRight className="h-6 w-6" />
            </Button>
        </div>
         <Button size="lg" className="w-full" onClick={nextSlide}>
          {currentIndex === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </footer>
    </div>
  );
}
