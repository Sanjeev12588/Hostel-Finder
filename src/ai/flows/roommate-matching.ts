'use server';

/**
 * @fileOverview A roommate matching AI agent.
 *
 * - matchRoommate - A function that handles the roommate matching process.
 * - MatchRoommateInput - The input type for the matchRoommate function.
 * - MatchRoommateOutput - The return type for the matchRoommate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchRoommateInputSchema = z.object({
  criteria: z
    .string()
    .describe('The criteria for finding a roommate, including preferences for lifestyle, cleanliness, noise level, and interests.'),
  listingDescription: z
    .string()
    .describe('The description of the available room or apartment.'),
});
export type MatchRoommateInput = z.infer<typeof MatchRoommateInputSchema>;

const MatchRoommateOutputSchema = z.object({
  suitabilityScore: z
    .number()
    .describe('A score from 0 to 1 indicating how well the listing matches the criteria, where 1 is a perfect match.'),
  reasons: z
    .string()
    .describe('A detailed explanation of why the listing is or is not a good match for the criteria.'),
});
export type MatchRoommateOutput = z.infer<typeof MatchRoommateOutputSchema>;

export async function matchRoommate(input: MatchRoommateInput): Promise<MatchRoommateOutput> {
  return matchRoommateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchRoommatePrompt',
  input: {schema: MatchRoommateInputSchema},
  output: {schema: MatchRoommateOutputSchema},
  prompt: `You are an expert roommate matching assistant.  You will receive a description of an available room or apartment, and the criteria of a person looking for a roommate.

You will evaluate how well the listing matches the criteria, and provide a suitability score from 0 to 1, where 1 is a perfect match.  You will also provide detailed reasons for your score.

Listing Description: {{{listingDescription}}}
Criteria: {{{criteria}}}`,
});

const matchRoommateFlow = ai.defineFlow(
  {
    name: 'matchRoommateFlow',
    inputSchema: MatchRoommateInputSchema,
    outputSchema: MatchRoommateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
