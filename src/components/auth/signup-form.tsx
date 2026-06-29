
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { Loader2, X, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
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
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/definitions';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import Link from 'next/link';
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
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters.' })
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, { message: 'Password must contain at least one special character.' }),
  confirmPassword: z.string(),
  terms: z.literal<boolean>(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function SignupForm() {
  const { toast } = useToast();
  const { setAppUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isFirebaseDisabled = !auth;
  const [showAccountExistsDialog, setShowAccountExistsDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.fullName });

      const userProfile: User = {
          id: user.uid,
          name: values.fullName,
          email: values.email,
          phone: '',
          avatar: '',
      };
      await addUserProfile(userProfile);
      setAppUser(userProfile);

      toast({
        title: 'Account Created!',
        description: "We've created your account for you.",
      });
      // The AuthProvider will handle the redirect.
    } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/email-already-in-use') {
            setShowAccountExistsDialog(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: error.message || 'An unexpected error occurred. Please try again.',
            });
        }
    } finally {
        setIsLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    if (!auth) return;
    if (!form.getValues('terms')) {
      toast({
        variant: 'destructive',
        title: 'Agreement Required',
        description: 'Please agree to the Terms and Conditions and Privacy Policy to continue.',
      });
      return;
    }
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
            description: 'Redirecting you to the home page...',
        });
      } else {
        setAppUser(existingProfile);
        toast({
            title: 'Welcome Back!',
            description: 'Redirecting you to the home page...',
        });
      }
      // The AuthProvider will handle the redirect.
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // No toast for this action
      } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/email-already-in-use') {
        setShowAccountExistsDialog(true);
      } else {
        console.error("Google Sign-Up Error:", error);
        toast({
          variant: 'destructive',
          title: 'Google Sign-Up Failed',
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isLoading || isGoogleLoading || isFirebaseDisabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>Password</FormLabel>
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading || isGoogleLoading || isFirebaseDisabled} 
                      className="pr-10"
                    />
                  </FormControl>
                   <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading || isGoogleLoading || isFirebaseDisabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal text-muted-foreground">
                    I agree to the{' '}
                      <Link href="/terms-and-conditions" className="text-primary hover:underline" target="_blank">
                          Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy-policy" className="text-primary hover:underline" target="_blank">
                          Privacy Policy
                      </Link>
                      .
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isFirebaseDisabled}>
            {isFirebaseDisabled ? "Firebase Not Configured" 
              : isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or sign up with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} type="button" disabled={isLoading || isGoogleLoading || isFirebaseDisabled || !form.getValues('terms')}>
        {isFirebaseDisabled ? (
          "Firebase Not Configured"
        ) : isGoogleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Signing up...</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>Sign up with Google</span>
          </>
        )}
      </Button>

      <AlertDialog open={showAccountExistsDialog} onOpenChange={setShowAccountExistsDialog}>
        <AlertDialogContent>
            <AlertDialogCancel asChild>
                <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              An account with this email address already exists. Please log in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction asChild>
            <Link href="/login">Login</Link>
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
