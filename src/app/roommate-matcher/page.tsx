import AppLayout from '@/components/app-layout';
import { MatcherForm } from '@/components/roommate-matcher/matcher-form';
import { Users, Bot } from 'lucide-react';

export default function RoommateMatcherPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl p-4">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center gap-3">
             <Users className="h-10 w-10 text-primary" />
             <Bot className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-headline text-3xl font-bold mt-2">AI Room Matcher</h1>
          <p className="mt-2 text-muted-foreground">
            Let our AI analyze a listing to see how well it fits your preferences.
          </p>
        </header>
        <MatcherForm />
      </div>
    </AppLayout>
  );
}
