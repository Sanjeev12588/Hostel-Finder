'use client';

import { LoginForm } from '@/components/auth/login-form';
import { Building2 } from 'lucide-react';

export default function LoginPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
           <div className="rounded-full bg-primary/10 p-4">
              <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-headline text-3xl font-bold">Welcome to Hostel Finder</h1>
          <p className="text-muted-foreground">Sign in or create an account to continue.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
