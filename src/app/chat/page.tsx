'use client';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function ChatPage() {
    const searchParams = useSearchParams();
    const { appUser } = useAuth();
    const withName = searchParams.get('withName') || 'Owner';

    // Dummy messages
    const messages = [
        { id: 1, text: 'Hello! I am interested in the hostel.', sender: 'user' },
        { id: 2, text: 'Hi! Great. What would you like to know?', sender: 'owner' },
        { id: 3, text: 'What is the availability?', sender: 'user' },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col h-full">
                <header className="flex items-center p-2 border-b shrink-0 bg-card fixed top-0 left-0 right-0 z-20">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/home">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3 ml-2">
                        <Avatar>
                            <AvatarImage src="https://placehold.co/100x100.png" alt={withName} data-ai-hint="person avatar" />
                            <AvatarFallback>{withName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h1 className="font-semibold text-lg">{withName}</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-4 pt-20 pb-24">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-[80%] shadow-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                     <div className="text-center text-xs text-muted-foreground py-4">
                        This is a placeholder UI. Chat functionality is not implemented.
                    </div>
                </main>

                <footer className="p-4 border-t bg-card fixed bottom-16 left-0 right-0 z-20">
                    <div className="relative max-w-2xl mx-auto">
                        <Input placeholder="Type a message..." className="pr-12" />
                        <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </footer>
            </div>
        </AppLayout>
    )
}
