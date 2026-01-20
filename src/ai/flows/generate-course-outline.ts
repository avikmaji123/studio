
'use server';
/**
 * @fileOverview An AI-powered flow to generate a structured course outline from a raw idea.
 *
 * - generateCourseOutline - Takes a user's raw text idea and returns a structured JSON for a new course.
 * - GenerateCourseOutlineInput - The input type for the function.
 * - GenerateCourseOutlineOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCourseOutlineInputSchema = z.object({
  courseIdea: z.string().describe('The raw text, idea, or syllabus for the course provided by the user.'),
});
export type GenerateCourseOutlineInput = z.infer<typeof GenerateCourseOutlineInputSchema>;

const GenerateCourseOutlineOutputSchema = z.object({
  title: z.string().describe('A catchy and descriptive course title.'),
  shortDescription: z.string().describe('A concise, one-sentence summary ideal for a course card or preview.'),
  description: z.string().describe('A detailed and engaging course description. Use markdown for formatting, including paragraphs and bullet points.'),
  category: z.string().describe('The most appropriate single category for the course (e.g., "Cyber Security", "Web Development", "Marketing").'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("The estimated difficulty level for the target audience."),
  estimatedDuration: z.string().describe('A realistic estimate of the total time to complete the course (e.g., "Approx. 8 hours", "3 Weeks").'),
  totalModules: z.number().int().positive().describe('The suggested number of modules or main sections in the course.'),
  totalLessons: z.number().int().positive().describe('The total number of lessons across all modules.'),
});
export type GenerateCourseOutlineOutput = z.infer<typeof GenerateCourseOutlineOutputSchema>;

export async function generateCourseOutline(
  input: GenerateCourseOutlineInput
): Promise<GenerateCourseOutlineOutput> {
  return generateCourseOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseOutlinePrompt',
  input: { schema: GenerateCourseOutlineInputSchema },
  output: { schema: GenerateCourseOutlineOutputSchema },
  prompt: `You are an expert curriculum designer and copywriter for online courses. A user has provided a raw idea or syllabus for a course. Your task is to analyze this input and generate a structured, professional course outline in JSON format.

User Input:
"{{{courseIdea}}}"

Based on the user's input, generate the following fields:
- title: A catchy and descriptive course title.
- shortDescription: A one-sentence summary for a course card.
- description: A detailed, engaging multi-paragraph course description. Use markdown for formatting, including paragraphs and bullet points for what students will learn.
- category: The most appropriate single category (e.g., "Web Development", "Cyber Security", "Marketing", "Design").
- level: The difficulty level ('Beginner', 'Intermediate', 'Advanced').
- estimatedDuration: A realistic estimate of the course length (e.g., "Approx. 8 hours").
- totalModules: The number of modules or main sections.
- totalLessons: The total number of lessons across all modules.

Your output MUST be a valid JSON object matching the specified schema.`,
});

const generateCourseOutlineFlow = ai.defineFlow(
  {
    name: 'generateCourseOutlineFlow',
    inputSchema: GenerateCourseOutlineInputSchema,
    outputSchema: GenerateCourseOutlineOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
