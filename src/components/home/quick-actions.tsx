
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function QuickActions() {

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-2xl font-bold px-4 text-center">Quick Access</h2>
      <div className="grid gap-4 px-4 grid-cols-1 max-w-md mx-auto">
        <Link href="/hostels/category" className="group">
          <Card className="overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
            <div className="relative h-44">
                <Image src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxob3N0ZWxzfGVufDB8fHx8MTc1MzExODU2Nnww&ixlib=rb-4.1.0&q=80&w=1080" alt="Hostel building" fill className="object-cover" data-ai-hint="hostel exterior" />
            </div>
            <CardContent className="p-3 text-center bg-primary text-primary-foreground">
              <p className="font-semibold">Find Hostel</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/roommates/category" className="group">
          <Card className="overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
             <div className="relative h-44">
                <Image src="https://images.unsplash.com/photo-1531835551805-16d864c8d311?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxN3x8cm9vbXN8ZW58MHx8fHwxNzUzMTIwMjM3fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Group of friends" fill className="object-cover" data-ai-hint="friends laughing" />
            </div>
            <CardContent className="p-3 text-center bg-primary text-primary-foreground">
              <p className="font-semibold">Find Room</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
