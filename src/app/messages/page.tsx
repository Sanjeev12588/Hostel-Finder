import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  // This is a placeholder for actual message data
  const conversations: any[] = [];

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="mb-6">
          <h1 className="font-headline text-3xl font-bold">Messages</h1>
        </header>

        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-card p-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 font-headline text-2xl font-semibold">No messages yet.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your conversations with hosts and roommates will appear here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/hostels/category">Start Browsing</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Map through conversations and render cards here */}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
