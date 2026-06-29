
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const isFirebaseDisabled = !auth;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast({
                title: 'Check Your Email',
                description: `If an account exists for ${email}, a password reset link has been sent.`,
            });
            setSubmitted(true);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not send password reset link. Please try again.',
            });
             console.error("Password reset error:", error);
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
            <div className="rounded-full bg-primary/10 p-4">
                <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-headline text-3xl font-bold">Forgot Password</h1>
            <p className="text-muted-foreground">No worries, we'll send you reset instructions.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <Link href="/login" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4 justify-center">
                <ChevronLeft className="h-4 w-4" />
                Back to Login
            </Link>

             {submitted ? (
                <div className="text-center text-muted-foreground p-4 bg-muted rounded-md">
                    <p>If an account with that email exists, you will receive a password reset link shortly. Please check your inbox and spam folder.</p>
                </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || isFirebaseDisabled} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || isFirebaseDisabled}>
                    {isFirebaseDisabled ? "Firebase Not Configured"
                      : isLoading ? <ChevronLeft className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                  </Button>
                </form>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
