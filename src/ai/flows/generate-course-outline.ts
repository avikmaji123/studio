
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
import { v4 as uuidv4 } from 'uuid';

const GenerateCourseOutlineInputSchema = z.object({
  courseIdea: z.string().describe('The raw text, idea, or syllabus for the course provided by the user.'),
});
export type GenerateCourseOutlineInput = z.infer<typeof GenerateCourseOutlineInputSchema>;

const GenerateCourseOutlineOutputSchema = z.object({
  title: z.string().describe('A catchy and descriptive course title.'),
  tagline: z.string().describe('A single, powerful, outcome-focused tagline for the course hero section.'),
  shortDescription: z.string().describe('A concise, one-sentence summary ideal for a course card or preview.'),
  description: z.string().describe('A detailed and engaging course description. Use markdown for formatting, including paragraphs and bullet points.'),
  category: z.string().describe('The most appropriate single category for the course (e.g., "Cyber Security", "Web Development", "Marketing").'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("The estimated difficulty level for the target audience."),
  estimatedDuration: z.string().describe('A realistic estimate of the total time to complete the course (e.g., "Approx. 8 hours", "3 Weeks").'),
  totalModules: z.number().int().describe('The suggested number of modules or main sections in the course. This must be a positive integer.'),
  totalLessons: z.number().int().describe('The total number of lessons across all modules. This must be a positive integer.'),
  highlights: z.array(z.string()).describe('A list of 3-5 key course highlights or features (e.g., "Hands-on labs", "Real-world scenarios").'),
  whoIsThisFor: z.array(z.string()).describe('A list of 3-4 ideal student profiles for this course.'),
  courseFaqs: z.array(z.object({
      id: z.string().describe("A unique UUID for the FAQ item."),
      question: z.string(),
      answer: z.string(),
  })).describe('A list of 3-4 frequently asked questions with answers specific to this course.'),
  learningOutcomes: z.array(z.string()).describe('A list of 5-7 specific, action-oriented skills or knowledge students will gain.'),
  prerequisites: z.array(z.string()).describe('A list of required knowledge or recommended experience for the course.'),
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
  prompt: `You are an expert curriculum designer and copywriter for online courses. A user has provided a raw idea or syllabus. Your task is to analyze this and generate a complete, professional course outline in JSON format.

User Input:
"{{{courseIdea}}}"

Based on the input, generate all fields in the output schema.
- **title**: A catchy and descriptive course title.
- **tagline**: A powerful, single-sentence tagline focusing on the main outcome.
- **shortDescription**: A one-sentence summary for a course card.
- **description**: A detailed, engaging multi-paragraph course description. Use markdown for formatting.
- **category**: The most appropriate single category (e.g., "Web Development", "Cyber Security").
- **level**: 'Beginner', 'Intermediate', or 'Advanced'.
- **estimatedDuration**: A realistic course length (e.g., "Approx. 8 hours").
- **totalModules/totalLessons**: The number of main sections and total lessons.
- **highlights**: 3-5 key features of the course (e.g., "Hands-on labs").
- **whoIsThisFor**: 3-4 ideal student profiles.
- **learningOutcomes**: 5-7 specific, action-oriented skills students will gain.
- **prerequisites**: A list of required knowledge or experience.
- **courseFaqs**: 3-4 frequently asked questions with answers. Generate a unique UUID for each FAQ's 'id' field.

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
    // Ensure every FAQ has a UUID if the model forgets.
    if (output && output.courseFaqs) {
        output.courseFaqs.forEach(faq => {
            if (!faq.id) {
                faq.id = uuidv4();
            }
        });
    }
    return output!;
  }
);
