'use client';

import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ShieldAlert, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addComplaint } from '@/lib/actions';

async function submitComplaint(prevState: any, formData: FormData) {
  const description = formData.get('description');
  const userId = formData.get('userId')?.toString();

  if (!userId) {
    return { success: false, message: 'You must be logged in to submit a complaint.' };
  }
  if (!description || description.toString().length < 10) {
    return { success: false, message: 'Please provide a more detailed description.' };
  }
  
  await addComplaint({ description: description.toString(), userId });
  
  return { success: true, message: 'Your complaint has been submitted successfully.' };
}

export default function ComplaintPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const initialState = { success: false, message: '' };
  const [state, formAction] = useFormState(submitComplaint, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);


  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="relative flex items-center justify-center mb-6 text-center">
            <Button variant="ghost" size="icon" asChild className="absolute left-0 top-1/2 -translate-y-1/2">
                <Link href="/profile">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
          
          <div className="flex-1">
            <div className="inline-block rounded-full bg-destructive/10 p-3">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="font-headline text-3xl font-bold mt-2">Raise a Complaint</h1>
            <p className="mt-2 text-muted-foreground">
              We are sorry for the inconvenience. Please describe your issue below.
            </p>
          </div>
        </header>
        
        <Card>
            <CardContent className="p-6">
                <form action={formAction} className="space-y-4">
                    {user && <input type="hidden" name="userId" value={user.uid} />}
                    <Textarea name="description" placeholder="Please describe your complaint in detail..." className="min-h-[150px]" />
                    <Button type="submit" className="w-full" variant="destructive" disabled={!user}>
                        {user ? 'Submit Complaint' : 'Please Login to Submit'}
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
