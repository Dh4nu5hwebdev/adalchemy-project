'use server';
/**
 * @fileOverview Generates four banner images based on a text prompt.
 *
 * - generateBannerImages - A function that handles the banner image generation process.
 * - GenerateBannerImagesInput - The input type for the generateBannerImages function.
 * - GenerateBannerImagesOutput - The return type for the generateBannerImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBannerImagesInputSchema = z.object({
  prompt: z.string().describe('The text prompt to use for generating the banner images.'),
});
export type GenerateBannerImagesInput = z.infer<typeof GenerateBannerImagesInputSchema>;

const GenerateBannerImagesOutputSchema = z.object({
  bannerImages: z
    .array(z.string().describe('A data URI of a generated banner image.'))
    .describe('The generated banner images as data URIs.'),
});
export type GenerateBannerImagesOutput = z.infer<typeof GenerateBannerImagesOutputSchema>;

export async function generateBannerImages(input: GenerateBannerImagesInput): Promise<GenerateBannerImagesOutput> {
  return generateBannerImagesFlow(input);
}

const generateBannerImagesFlow = ai.defineFlow(
  {
    name: 'generateBannerImagesFlow',
    inputSchema: GenerateBannerImagesInputSchema,
    outputSchema: GenerateBannerImagesOutputSchema,
  },
  async input => {
    const bannerImages: string[] = [];

    for (let i = 0; i < 4; i++) {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: input.prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      bannerImages.push(media.url!);
    }

    return {bannerImages};
  }
);
