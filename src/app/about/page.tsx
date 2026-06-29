
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function AboutAppPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl p-4">
        <header className="relative flex items-center justify-center mb-6">
            <Button variant="ghost" size="icon" asChild className="absolute left-0">
                <Link href="/profile">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold">About App</h1>
        </header>

        <Card>
            <CardContent className="p-6 space-y-4 text-muted-foreground">
                <div className="text-center mb-6">
                    <div className="inline-block rounded-full bg-primary/10 p-3">
                        <Info className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground text-center">Hostel Finder</h2>
                <p className="text-center">Version 1.0.0</p>
                
                <p>Welcome to Hostel Finder, your one-stop solution for finding the perfect hostel or roommate. Our mission is to simplify the search for accommodation, making it easier, safer, and more efficient for students and professionals alike.</p>
                
                <h3 className="text-lg font-semibold text-foreground pt-2">Key Features:</h3>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><b>Extensive Listings:</b> Browse a wide variety of hostels and rooms in your desired location.</li>
                    <li><b>Direct Contact:</b> Easily get in touch with property owners or potential roommates.</li>
                    <li><b>User Reviews:</b> Read honest reviews from other users to make informed decisions.</li>
                    <li><b>AI-Powered Matching:</b> Use our AI Roommate Matcher to find the perfect fit based on your lifestyle and preferences.</li>
                    <li><b>Secure & Private:</b> We prioritize your privacy and data security.</li>
                </ul>

                <p className="pt-4">We are continuously working to improve the app and add new features. If you have any feedback or suggestions, please don't hesitate to reach out to us through the "Give Feedback" option in the menu.</p>

                <p className="text-sm text-center pt-6">Thank you for using Hostel Finder!</p>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
