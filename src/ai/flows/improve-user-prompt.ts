
'use server';

/**
 * @fileOverview A flow to refine user prompts using AI suggestions to improve clarity and detail for ad banner generation.
 *
 * - improveUserPrompt - A function that takes a user prompt and returns an improved version.
 * - ImproveUserPromptInput - The input type for the improveUserPrompt function.
 * - ImproveUserPromptOutput - The return type for the improveUserPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveUserPromptInputSchema = z.object({
  userPrompt: z.string().describe('The user-provided prompt to be refined.'),
});
export type ImproveUserPromptInput = z.infer<typeof ImproveUserPromptInputSchema>;

const ImproveUserPromptOutputSchema = z.object({
  improvedPrompt: z.string().describe('The refined prompt with improved clarity and detail, suitable for generating ad banners.'),
});
export type ImproveUserPromptOutput = z.infer<typeof ImproveUserPromptOutputSchema>;

export async function improveUserPrompt(input: ImproveUserPromptInput): Promise<ImproveUserPromptOutput> {
  return improveUserPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveUserPromptPrompt',
  input: {schema: ImproveUserPromptInputSchema},
  output: {schema: ImproveUserPromptOutputSchema},
  prompt: `You are an expert AI prompt engineer specializing in creating effective prompts for ad banner image generation.
Your task is to take a user-provided prompt and enhance it. The enhanced prompt should be:
- More detailed and specific.
- Optimized for visual output, suggesting colors, styles, moods, or objects if appropriate.
- Action-oriented and clear for an image generation AI.
- Creative and engaging.
- **Concise:** Ensure the final prompt is not excessively long and is suitable for image generation models which often have input length restrictions. Aim for a length that is typically effective for these models.

Original Prompt: {{{userPrompt}}}

Return only the improved prompt text.`,
});

const improveUserPromptFlow = ai.defineFlow(
  {
    name: 'improveUserPromptFlow',
    inputSchema: ImproveUserPromptInputSchema,
    outputSchema: ImproveUserPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to return an improved prompt.');
    }
    return output;
  }
);

