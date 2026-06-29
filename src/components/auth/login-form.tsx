
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, X, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addUserProfile, getUser } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/use-auth';


const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginForm() {
  const { toast } = useToast();
  const { setAppUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isFirebaseDisabled = !auth;
  const [showUserNotFoundDialog, setShowUserNotFoundDialog] = useState(false);
  const [showDifferentProviderDialog, setShowDifferentProviderDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Login Successful',
        description: 'Redirecting...',
      });
      // The AuthProvider will handle the redirect.
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
         try {
            const methods = await fetchSignInMethodsForEmail(auth, values.email);
            if (methods.length > 0) {
              if (methods.includes(GoogleAuthProvider.PROVIDER_ID)) {
                setShowDifferentProviderDialog(true);
              } else {
                 toast({
                    variant: 'destructive',
                    title: 'Login Failed',
                    description: `This email is associated with a different sign-in method (${methods.join(', ')}).`,
                });
              }
            } else {
              setShowUserNotFoundDialog(true);
            }
         } catch (fetchError) {
            setShowUserNotFoundDialog(true);
         }
      } else {
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/too-many-requests') {
          description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can try again later.';
        } else {
          description = error.message || description;
        }
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: description,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!auth) return;
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const existingProfile = await getUser(user.uid);
      if (!existingProfile) {
        const userProfile: User = {
          id: user.uid,
          name: user.displayName || 'Google User',
          email: user.email || '',
          phone: user.phoneNumber || '',
          avatar: user.photoURL || '',
        };
        await addUserProfile(userProfile);
        setAppUser(userProfile);
        toast({
          title: 'Account Created!',
          description: "We've created your account for you.",
        });
      } else {
        setAppUser(existingProfile);
        toast({
          title: 'Login Successful',
          description: 'Redirecting...',
        });
      }
      // The AuthProvider will handle the redirect.
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // No toast needed
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: 'An account already exists with this email. Please sign in using the original method.',
        });
      } else {
        console.error("Google Sign-In Error:", error);
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message || 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" className="mr-2 h-5 w-5">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.275-11.303-7.738H6.306C9.656,39.663,16.318,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C39.712,35.419,44,29.861,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );

  return (
    <>
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} disabled={isLoading || isGoogleLoading || isFirebaseDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={isLoading || isGoogleLoading || isFirebaseDisabled} 
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isFirebaseDisabled}>
              {isFirebaseDisabled ? "Firebase Not Configured"
                : isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} type="button" disabled={isLoading || isGoogleLoading || isFirebaseDisabled}>
          {isFirebaseDisabled ? (
            "Firebase Not Configured"
          ) : isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Sign in with Google</span>
            </>
          )}
        </Button>
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      <AlertDialog open={showUserNotFoundDialog} onOpenChange={setShowUserNotFoundDialog}>
        <AlertDialogContent>
           <AlertDialogCancel asChild>
                <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Not Found</AlertDialogTitle>
            <AlertDialogDescription>
              We couldn't find an account with that email address. Would you like to create a new account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction asChild>
            <Link href="/signup">Sign Up</Link>
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={showDifferentProviderDialog} onOpenChange={setShowDifferentProviderDialog}>
        <AlertDialogContent>
            <AlertDialogCancel asChild>
                <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign-in method mismatch</AlertDialogTitle>
            <AlertDialogDescription>
              You've previously signed in with Google. Please use the "Sign in with Google" button to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleGoogleSignIn}>
            <GoogleIcon />
            Sign in with Google
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
