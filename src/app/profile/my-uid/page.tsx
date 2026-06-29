
'use client';

import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Check, ChevronLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import LoadingIndicator from '@/components/ui/loading-indicator';

export default function MyUidPage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!user) return;
        navigator.clipboard.writeText(user.uid);
        setCopied(true);
        toast({
            title: 'Copied to Clipboard!',
            description: 'Your user ID has been copied.',
        });
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="h-full">
                    <LoadingIndicator />
                </div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <div className="container mx-auto max-w-2xl p-4">
                 <header className="relative flex items-center justify-center mb-6">
                    <Button variant="ghost" size="icon" asChild className="absolute left-0">
                        <Link href="/profile/edit">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <h1 className="font-headline text-2xl font-bold">Your User ID</h1>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Admin Configuration</CardTitle>
                        <CardDescription>
                            To access the admin panel, copy this User ID and set it as the `ADMIN_UID` secret in your environment variables.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user ? (
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted border">
                                <code className="flex-1 text-sm text-muted-foreground truncate">{user.uid}</code>
                                <Button size="icon" variant="ghost" onClick={handleCopy}>
                                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                    <span className="sr-only">Copy UID</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground p-8">
                                <p>You must be logged in to view your User ID.</p>
                                <Button asChild className="mt-4">
                                    <Link href="/login">Login</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

