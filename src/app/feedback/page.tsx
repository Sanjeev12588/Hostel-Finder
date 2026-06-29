'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addFeedback } from '@/lib/actions';

async function submitFeedbackAction(prevState: any, formData: FormData) {
  const rating = formData.get('rating');
  const description = formData.get('description');
  const userId = formData.get('userId')?.toString();

  if (!userId) {
    return { success: false, message: "You must be logged in." };
  }
  if (!rating || !description) {
      return { success: false, message: "Please provide a rating and description." };
  }
  
  await addFeedback({ rating: Number(rating), description: description.toString(), userId });
  
  return { success: true, message: "Thank you for your feedback!" };
}

export default function FeedbackPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const initialState = { success: false, message: "" };
  const [state, formAction] = useFormState(submitFeedbackAction, initialState);

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
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="relative flex items-center justify-center mb-6">
            <Button variant="ghost" size="icon" asChild className="absolute left-0">
                <Link href="/profile">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold">Give App Feedback</h1>
        </header>

        <Card>
          <CardContent className="p-6">
            <form action={formAction} className="space-y-6">
              {user && <input type="hidden" name="userId" value={user.uid} />}
              <input type="hidden" name="rating" value={rating} />
             
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'h-8 w-8 cursor-pointer transition-colors',
                          star <= rating ? 'text-primary fill-current' : 'text-muted-foreground/50'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">Feedback Description</label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about your experience with the app..."
                  className="min-h-[120px]"
                />
              </div>

              <Button type="submit" className="w-full" disabled={!user}>
                {user ? 'Submit Feedback' : 'Please Login to Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
