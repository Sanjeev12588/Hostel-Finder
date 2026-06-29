import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl p-4">
        <header className="relative flex items-center justify-center mb-6">
            <Button variant="ghost" size="icon" asChild className="absolute left-0">
                <Link href="/profile">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold">Privacy Policy</h1>
        </header>

        <Card>
            <CardContent className="p-6 space-y-4 text-muted-foreground">
                <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
                <p>Welcome to Hostel Finder. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
                
                <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
                <p>We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, when you participate in activities on the app or otherwise when you contact us.</p>
                <p>The personal information that we collect depends on the context of your interactions with us and the app, the choices you make and the products and features you use. The personal information we collect may include the following: name, phone number, email address, and other similar data.</p>
                
                <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
                <p>We use personal information collected via our app for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>

                <h2 className="text-xl font-semibold text-foreground">4. Will Your Information Be Shared With Anyone?</h2>
                <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
                 <p className="pt-4 text-sm">Last updated: July 26, 2024</p>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
