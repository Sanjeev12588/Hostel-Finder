
'use client';

import { useEffect, useState, useRef } from 'react';
import { useFormState } from 'react-dom';
import AppLayout from '@/components/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, ChevronLeft, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { updateUserAction } from '@/lib/actions';
import type { User } from '@/lib/definitions';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import LoadingIndicator from '@/components/ui/loading-indicator';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";

async function updateProfileAction(prevState: any, formData: FormData) {
    const userId = formData.get('userId')?.toString();
    if (!userId) {
        return { success: false, message: 'User not found.' };
    }
    
    try {
        await updateUserAction(userId, formData);
        return { success: true, message: 'Profile updated successfully!' };
    } catch (error: any) {
        console.error('Update profile error:', error);
        return { success: false, message: error.message || 'Failed to update profile.' };
    }
}

export default function EditProfilePage() {
    const { toast } = useToast();
    const { appUser, loading, refreshAppUser } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const initialState = { success: false, message: '' };
    const [state, formAction] = useFormState(updateProfileAction, initialState);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                refreshAppUser().then(() => {
                    router.push('/profile');
                });
            }
        }
    }, [state, toast, router, refreshAppUser]);
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (appUser?.avatar) {
            setAvatarPreview(appUser.avatar);
        }
    }, [appUser]);

    if (loading) {
        return (
            <AppLayout>
                <div className="h-full">
                    <LoadingIndicator />
                </div>
            </AppLayout>
        );
    }

    if (!appUser) {
        return (
            <AppLayout>
                <div className="p-4 text-center">
                    <p>Please log in to edit your profile.</p>
                    <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
                </div>
            </AppLayout>
        );
    }

    const getAvatarFallback = () => {
        if (!appUser) return '';
        return (appUser.name || appUser.email || 'U').substring(0, 2).toUpperCase();
    }

    return (
        <AppLayout>
            <div className="p-4 space-y-6">
                 <header className="relative flex items-center justify-center mb-6">
                    <Button variant="ghost" size="icon" asChild className="absolute left-0">
                        <Link href="/profile">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <h1 className="font-headline text-2xl font-bold">Edit Profile</h1>
                </header>

                <Card>
                    <CardContent className="p-6 space-y-6">
                       <form action={formAction} className="space-y-4">
                            <Dialog>
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative">
                                        <DialogTrigger asChild>
                                            <Avatar className="h-24 w-24 cursor-pointer">
                                                <AvatarImage src={avatarPreview || appUser.avatar} alt={appUser.name} />
                                                <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                                            </Avatar>
                                        </DialogTrigger>
                                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8" type="button" onClick={() => fileInputRef.current?.click()}>
                                            <Camera className="h-4 w-4" />
                                            <span className="sr-only">Change photo</span>
                                        </Button>
                                    </div>
                                    <Link href="/profile/my-uid" className="text-sm text-primary hover:underline flex items-center gap-1">
                                      <Fingerprint className="h-4 w-4" />
                                      Get My Admin User ID
                                    </Link>
                                </div>
                                 <DialogContent className="p-0 w-fit border-0 bg-transparent shadow-none">
                                    <Avatar className="h-80 w-80">
                                        <AvatarImage src={avatarPreview || appUser.avatar} alt={appUser.name} />
                                         <AvatarFallback className="text-6xl">{getAvatarFallback()}</AvatarFallback>
                                    </Avatar>
                                </DialogContent>
                            </Dialog>

                            <input type="file" name="avatarFile" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" />
                            <input type="hidden" name="userId" value={appUser.id} />
                            
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input name="fullName" id="fullName" defaultValue={appUser.name} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input name="email" id="email" type="email" defaultValue={appUser.email} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input name="phone" id="phone" type="tel" defaultValue={appUser.phone} placeholder="+91 12345 67890" />
                            </div>
                            <Button type="submit" className="w-full">Save Changes</Button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
