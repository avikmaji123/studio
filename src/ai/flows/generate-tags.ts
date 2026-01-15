'use server';
/**
 * @fileOverview A Genkit flow for generating relevant tags for a course.
 *
 * - generateTags - A function that takes course title and description and returns suggested tags.
 * - GenerateTagsInput - The input type for the generateTags function.
 * - GenerateTagsOutput - The return type for the generateTags function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTagsInputSchema = z.object({
  title: z.string().describe('The title of the course.'),
  description: z.string().describe('The detailed description of the course.'),
});
export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;

const GenerateTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of relevant keywords or tags for the course.'),
});
export type GenerateTagsOutput = z.infer<typeof GenerateTagsOutputSchema>;

export async function generateTags(
  input: GenerateTagsInput
): Promise<GenerateTagsOutput> {
  return generateTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTagsPrompt',
  input: { schema: GenerateTagsInputSchema },
  output: { schema: GenerateTagsOutputSchema },
  prompt: `You are an expert in SEO and course curation. Based on the following course title and description, generate a list of 5 to 7 relevant tags or keywords that would help users discover this course.

Focus on specific technologies, skills, and concepts mentioned. Avoid overly generic terms.

Title: "{{{title}}}"
Description: "{{{description}}}"

Your output MUST be a JSON object with a single key 'tags' which is an array of strings. For example: { "tags": ["react", "web development", "javascript", "frontend"] }`,
});

const generateTagsFlow = ai.defineFlow(
  {
    name: 'generateTagsFlow',
    inputSchema: GenerateTagsInputSchema,
    outputSchema: GenerateTagsOutputSchema,
  },
  async input => {
    if (!input.title && !input.description) {
      return {
        tags: [],
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
