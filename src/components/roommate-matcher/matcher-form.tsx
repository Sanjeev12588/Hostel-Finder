'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { matchRoommate } from '@/ai/flows/roommate-matching';
import type { MatchRoommateOutput } from '@/ai/flows/roommate-matching';
import { Progress } from '../ui/progress';

const matcherSchema = z.object({
  criteria: z.string().min(20, 'Please describe your criteria in more detail (min 20 characters).'),
  listingDescription: z.string().min(20, 'Please provide a more detailed listing description (min 20 characters).'),
});

export function MatcherForm() {
  const [result, setResult] = useState<MatchRoommateOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof matcherSchema>>({
    resolver: zodResolver(matcherSchema),
    defaultValues: {
      criteria: '',
      listingDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof matcherSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const matchResult = await matchRoommate(values);
      setResult(matchResult);
    } catch (error) {
      console.error('Error matching roommate:', error);
      // You can use toast notifications for errors
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Your Criteria</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I'm a quiet student looking for a clean, non-smoking environment. I prefer a roommate who is also a student, enjoys calm evenings, and respects personal space."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="listingDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Listing Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., One room available in a 2BHK apartment. Shared with a working professional. Rent includes WiFi. No parties. 10 min walk from university."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Match
                </>
              )}
            </Button>
          </form>
        </Form>

        {result && (
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                {result.suitabilityScore > 0.6 ? <ThumbsUp className="text-green-500"/> : <ThumbsDown className="text-red-500" />}
                Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                 <p className="font-semibold mb-1">Suitability Score: {Math.round(result.suitabilityScore * 100)}%</p>
                 <Progress value={result.suitabilityScore * 100} className="h-3" />
               </div>
              <div>
                <h4 className="font-semibold">Reasons:</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.reasons}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
