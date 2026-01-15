'use server';
/**
 * @fileOverview A Genkit flow for refining course content using AI.
 *
 * - refineText - A function that takes a piece of text and a field type, and returns an AI-improved version.
 * - RefineTextInput - The input type for the refineText function.
 * - RefineTextOutput - The return type for the refineText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RefineTextInputSchema = z.object({
  text: z.string().describe('The text to be refined.'),
  fieldType: z
    .enum(['title', 'short-description', 'description'])
    .describe('The type of content being refined.'),
});
export type RefineTextInput = z.infer<typeof RefineTextInputSchema>;

const RefineTextOutputSchema = z.object({
  refinedText: z.string().describe('The AI-refined text.'),
});
export type RefineTextOutput = z.infer<typeof RefineTextOutputSchema>;

export async function refineText(
  input: RefineTextInput
): Promise<RefineTextOutput> {
  return refineTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineTextPrompt',
  input: { schema: RefineTextInputSchema },
  output: { schema: RefineTextOutputSchema },
  prompt: `You are an expert copywriter specializing in creating compelling content for online courses. Your task is to refine the provided text for a course's '{{{fieldType}}}'.

Rewrite the following text to make it more engaging, clear, and professional.

- If it's a 'title', make it catchy and descriptive.
- If it's a 'short-description', make it a concise and compelling summary that grabs attention.
- If it's a 'description', make it detailed, easy to read, and persuasive, using paragraphs and bullet points where appropriate.

Do not change the core meaning. Just improve the wording, tone, and structure.

Original text:
"{{{text}}}"

Your output must be a JSON object with a single key 'refinedText' containing your improved version.`,
});

const refineTextFlow = ai.defineFlow(
  {
    name: 'refineTextFlow',
    inputSchema: RefineTextInputSchema,
    outputSchema: RefineTextOutputSchema,
  },
  async input => {
    if (!input.text) {
      return {
        refinedText: '',
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
