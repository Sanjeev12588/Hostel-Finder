'use client';

import { SignupForm } from '@/components/auth/signup-form';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
           <div className="rounded-full bg-primary/10 p-4">
              <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-headline text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Join Hostel Finder to find your crib.</p>
        </div>
        <SignupForm />
         <p className="pt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
                Login
            </Link>
        </p>
      </div>
    </div>
  );
}
