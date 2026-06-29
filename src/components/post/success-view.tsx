
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import AppLayout from '@/components/app-layout';

interface SuccessViewProps {
  viewAdHref: string;
}

export default function SuccessView({ viewAdHref }: SuccessViewProps) {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4 flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <Card className="text-center p-8 w-full shadow-lg">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="mx-auto inline-block rounded-full bg-green-100 p-3">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="font-headline text-3xl font-bold mt-4">Ad Posted Successfully!</h1>
            <p className="text-muted-foreground mt-2 max-w-sm">Your ad is now live. You can view it or return to the home page.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full">
              <Button className="w-full" onClick={() => router.push('/home')}>
                Go to Home
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push(viewAdHref)}>
                View Your Ad
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
