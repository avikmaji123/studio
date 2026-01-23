'use server';
/**
 * @fileOverview An AI-powered flow for admins to generate showcase reviews for a course.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateReviewsInputSchema = z.object({
  courseTitle: z.string(),
  courseDescription: z.string(),
  count: z.number().int().min(1).max(5),
});
export type GenerateReviewsInput = z.infer<typeof GenerateReviewsInputSchema>;

const ReviewSchema = z.object({
  userName: z.string().describe("A plausible, common-sounding first and last name."),
  rating: z.number().int().min(4).max(5).describe("A rating between 4 and 5."),
  title: z.string().describe("A short, catchy, positive review title."),
  text: z.string().describe("A 2-3 sentence positive review text, highlighting a benefit of the course."),
});

const GenerateReviewsOutputSchema = z.object({
  reviews: z.array(ReviewSchema),
});
export type GenerateReviewsOutput = z.infer<typeof GenerateReviewsOutputSchema>;

export async function generateReviews(input: GenerateReviewsInput): Promise<GenerateReviewsOutput> {
  return generateReviewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReviewsPrompt',
  input: { schema: GenerateReviewsInputSchema },
  output: { schema: GenerateReviewsOutputSchema },
  prompt: `You are an AI assistant tasked with generating realistic, positive reviews for a course. These are for showcase purposes only.

Course Title: "{{{courseTitle}}}"
Course Description: "{{{courseDescription}}}"

Generate exactly {{{count}}} unique, positive reviews.
- Each review must have a unique, realistic user name.
- The rating must be 4 or 5.
- The title and text should be positive and sound authentic, as if a real student wrote it.
- The review text should be concise (2-3 sentences).

Your output MUST be a valid JSON object with a "reviews" array.`,
});

const generateReviewsFlow = ai.defineFlow({
    name: 'generateReviewsFlow',
    inputSchema: GenerateReviewsInputSchema,
    outputSchema: GenerateReviewsOutputSchema,
  }, async (input) => {
    const { output } = await prompt(input);
    return output!;
});

    