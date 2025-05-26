'use server';
/**
 * @fileOverview Provides prompt suggestions to kickstart the creative process for banner image generation.
 *
 * - generatePromptSuggestions - A function that generates prompt suggestions.
 * - GeneratePromptSuggestionsInput - The input type for the generatePromptSuggestions function (currently empty).
 * - GeneratePromptSuggestionsOutput - The return type for the generatePromptSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromptSuggestionsInputSchema = z.object({});
export type GeneratePromptSuggestionsInput = z.infer<typeof GeneratePromptSuggestionsInputSchema>;

const GeneratePromptSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested prompts.'),
});
export type GeneratePromptSuggestionsOutput = z.infer<typeof GeneratePromptSuggestionsOutputSchema>;

export async function generatePromptSuggestions(
  input: GeneratePromptSuggestionsInput
): Promise<GeneratePromptSuggestionsOutput> {
  return generatePromptSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromptSuggestionsPrompt',
  input: {schema: GeneratePromptSuggestionsInputSchema},
  output: {schema: GeneratePromptSuggestionsOutputSchema},
  prompt: `You are a creative marketing assistant helping users generate banner images. Provide a list of 4 distinct prompt suggestions that users can use to generate banner images. Be creative and think outside the box. Suggestions should be specific enough to yield good results.

Output the prompt suggestions as a JSON array of strings.`,
});

const generatePromptSuggestionsFlow = ai.defineFlow(
  {
    name: 'generatePromptSuggestionsFlow',
    inputSchema: GeneratePromptSuggestionsInputSchema,
    outputSchema: GeneratePromptSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
