'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  questionText: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer text from the options array.'),
});

export const GenerateQuizInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  courseDescription: z.string().describe('The description of the course content.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).length(10).describe('An array of 10 multiple-choice questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an expert curriculum developer. Your task is to create a challenging 10-question multiple-choice quiz based on the provided course material.

The quiz must test the user's understanding of the key concepts from the course.

Course Title: {{{courseTitle}}}
Course Description:
{{{courseDescription}}}

Generate exactly 10 multiple-choice questions. Each question must have exactly 4 possible answers. One of the answers must be correct.
Ensure the questions are relevant to the course content and vary in difficulty.

Your output MUST be a valid JSON object matching the specified schema, containing a 'questions' array. For each question, provide the question text, an array of 4 options, and the text of the correct answer.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
