
'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Edit, Heart, LogOut, Star, BadgePlus, Shield, ShieldAlert, FileText, Moon, Sun, Laptop, Info, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const menuItems = [
    { href: '/profile/edit', icon: Edit, label: 'Edit Profile' },
    { href: '/my-ads', icon: BadgePlus, label: 'Your Ads' },
    { href: '/favorites', icon: Heart, label: 'Favourites' },
    { href: '/feedback', icon: Star, label: 'Give Feedback' },
];

function ThemeSwitcher() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center p-4 hover:bg-muted/50 w-full text-left">
                     <Sun className="h-5 w-5 mr-4 text-primary dark:hidden" />
                     <Moon className="h-5 w-5 mr-4 text-primary hidden dark:inline-block" />
                    <span className="flex-1 font-medium">Theme</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function ProfilePage() {
    const { appUser, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const isFirebaseDisabled = !auth;

    const handleLogout = async () => {
        if (!auth) {
            toast({ variant: 'destructive', title: 'Logout Failed', description: 'Firebase is not configured.' });
            return;
        }
        try {
            await signOut(auth);
            toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log you out. Please try again.' });
        }
    };

    const getAvatarFallback = () => {
        if (!appUser) return 'U';
        if (appUser.name) {
            const nameParts = appUser.name.split(' ');
            if (nameParts.length > 1) {
                return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
            }
            return appUser.name.substring(0, 2).toUpperCase();
        }
        if (appUser.email) {
            return appUser.email.substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    return (
        <AppLayout>
            <div className="p-4 space-y-6">
                <Card className="bg-primary text-primary-foreground">
                    <CardContent className="p-4 flex items-center gap-4">
                        {loading ? (
                            <>
                                <Skeleton className="h-16 w-16 rounded-full bg-primary-foreground/30" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32 bg-primary-foreground/30" />
                                    <Skeleton className="h-4 w-48 bg-primary-foreground/30" />
                                </div>
                            </>
                        ) : appUser ? (
                            <>
                                <Link href="/profile/edit">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={appUser.avatar} alt={appUser.name} />
                                        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex-1">
                                    <p className="font-bold text-lg">{appUser.name}</p>
                                    <p className="text-sm text-primary-foreground/80">{appUser.email}</p>

                                </div>
                                <Button variant="ghost" size="icon" asChild className="hover:bg-primary-foreground/20">
                                <Link href="/profile/edit">
                                    <Edit className="h-5 w-5" />
                                </Link>
                                </Button>
                            </>
                        ) : (
                             <div className="flex-1 text-primary-foreground">
                                <p>Not logged in.</p>
                                {isFirebaseDisabled ? (
                                    <span className="text-destructive-foreground">Auth is disabled.</span>
                                ) : (
                                    <Link href="/login" className="font-bold underline">Login now</Link>
                                )}
                             </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <ul className="divide-y">
                        {menuItems.map(item => (
                             <li key={item.href}>
                                <Link href={item.href} className="flex items-center p-4 hover:bg-muted/50">
                                    <item.icon className="h-5 w-5 mr-4 text-primary" />
                                    <span className="flex-1 font-medium">{item.label}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>
                
                 <Card>
                    <ul className="divide-y">
                       <li>
                           <ThemeSwitcher />
                        </li>
                    </ul>
                </Card>

                 <Card>
                    <ul className="divide-y">
                        <li>
                            <Link href="/about" className="flex items-center p-4 hover:bg-muted/50">
                                <Info className="h-5 w-5 mr-4 text-primary" />
                                <span className="flex-1 font-medium">About App</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </li>
                         <li>
                            <Link href="/help" className="flex items-center p-4 hover:bg-muted/50">
                                <HelpCircle className="h-5 w-5 mr-4 text-primary" />
                                <span className="flex-1 font-medium">Help & FAQ</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </li>
                       <li>
                            <Link href="/privacy-policy" className="flex items-center p-4 hover:bg-muted/50">
                                <Shield className="h-5 w-5 mr-4 text-primary" />
                                <span className="flex-1 font-medium">Privacy Policy</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </li>
                         <li>
                            <Link href="/terms-and-conditions" className="flex items-center p-4 hover:bg-muted/50">
                                <FileText className="h-5 w-5 mr-4 text-primary" />
                                <span className="flex-1 font-medium">Terms & Conditions</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </li>
                        <li>
                            <Link href="/complaint" className="flex items-center p-4 hover:bg-muted/50">
                                <ShieldAlert className="h-5 w-5 mr-4 text-primary" />
                                <span className="flex-1 font-medium">Raise a Complaint</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </li>
                    </ul>
                </Card>

                 <Card>
                    <ul>
                        <li>
                            <button onClick={handleLogout} className="w-full flex items-center p-4 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50" disabled={!appUser || isFirebaseDisabled}>
                                <LogOut className="h-5 w-5 mr-4" />
                                <span className="flex-1 font-medium text-left">Logout</span>
                            </button>
                        </li>
                    </ul>
                </Card>
            </div>
        </AppLayout>
    );
}
