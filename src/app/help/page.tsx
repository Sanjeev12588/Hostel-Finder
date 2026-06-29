
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "How do I post an ad for my hostel or room?",
        answer: "Navigate to the 'Post' tab from the bottom navigation bar. Choose whether you want to list a 'Hostel' or a 'Room'. Fill in all the required details, upload images, and click 'Post Ad'. Your listing will then be live."
    },
    {
        question: "How can I find a hostel in a specific city?",
        answer: "Go to Home > Find Hostel. Select a category (e.g., For Boys, For Girls). You will then be prompted to enter a city or detect your current location to see relevant listings."
    },
    {
        question: "Is it safe to contact owners directly?",
        answer: "We provide a platform to connect, but we always recommend exercising caution. Meet in public places for the first time, verify property details, and never share sensitive personal information or make payments before seeing the property and signing an agreement."
    },
    {
        question: "How do I edit my profile?",
        answer: "Go to the 'Menu' tab and tap on your profile card at the top or the 'Edit Profile' option. You can update your name, phone number, and profile picture there."
    },
    {
        question: "How can I report an issue or a fraudulent ad?",
        answer: "If you encounter any issues with the app or suspect a fraudulent listing, please use the 'Raise a Complaint' option in the 'Menu' tab. Provide as much detail as possible, and our team will investigate."
    },
    {
        question: "How does the AI Room Matcher work?",
        answer: "The AI Room Matcher helps you evaluate how well a potential room or roommate fits your needs. Go to the 'AI Matcher' from the home screen, enter your personal criteria (like lifestyle, cleanliness habits, etc.) and the description of the listing. The AI will provide a suitability score and detailed reasons."
    }
]

export default function HelpAndFaqPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl p-4">
        <header className="relative flex items-center justify-center mb-6">
            <Button variant="ghost" size="icon" asChild className="absolute left-0">
                <Link href="/profile">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold">Help & FAQ</h1>
        </header>
        
        <div className="text-center mb-6">
            <div className="inline-block rounded-full bg-primary/10 p-3">
                <HelpCircle className="h-10 w-10 text-primary" />
            </div>
        </div>

        <Card>
            <CardContent className="p-6">
                 <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
