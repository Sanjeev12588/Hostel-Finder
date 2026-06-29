import AppLayout from '@/components/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users } from 'lucide-react';
import Link from 'next/link';

export default function PostAdPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="mb-6 text-center">
          <h1 className="font-headline text-3xl font-bold">Post Your Ad</h1>
          <p className="text-muted-foreground">Choose what you'd like to list.</p>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link href="/post/hostel" className="group">
            <Card className="h-full transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl bg-primary text-primary-foreground">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Building2 className="h-16 w-16 text-primary-foreground transition-colors" />
                <h2 className="mt-4 font-headline text-2xl font-semibold">Post Hostel Ad</h2>
                <p className="mt-2 text-sm text-primary-foreground/90">List your hostel or PG for students and professionals.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/post/roommate" className="group">
            <Card className="h-full transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl bg-primary text-primary-foreground">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="h-16 w-16 text-primary-foreground transition-colors" />
                <h2 className="mt-4 font-headline text-2xl font-semibold">Post Room Ad</h2>
                <p className="mt-2 text-sm text-primary-foreground/90">Find a flatmate for your shared room or apartment.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
