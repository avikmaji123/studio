'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v4 as uuidv4 } from 'uuid';

const FaqSchema = z.object({
  id: z.string().describe("A unique UUID for the FAQ item."),
  question: z.string().describe('A frequently asked question about the course.'),
  answer: z.string().describe('A clear and concise answer to the question.'),
});

const GenerateCourseFaqsInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  courseDescription: z.string().describe('The description of the course content.'),
});
export type GenerateCourseFaqsInput = z.infer<typeof GenerateCourseFaqsInputSchema>;

const GenerateCourseFaqsOutputSchema = z.object({
  faqs: z.array(FaqSchema).length(4).describe('An array of 4 frequently asked questions.'),
});
export type GenerateCourseFaqsOutput = z.infer<typeof GenerateCourseFaqsOutputSchema>;

export async function generateCourseFaqs(input: GenerateCourseFaqsInput): Promise<GenerateCourseFaqsOutput> {
  return generateCourseFaqsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseFaqsPrompt',
  input: { schema: GenerateCourseFaqsInputSchema },
  output: { schema: GenerateCourseFaqsOutputSchema },
  prompt: `You are an expert curriculum assistant. Your task is to generate a short list of frequently asked questions (FAQs) based on the provided course material. These FAQs should address common queries a potential student might have.

Course Title: {{{courseTitle}}}
Course Description:
{{{courseDescription}}}

Generate exactly 4 unique and relevant FAQs. For each FAQ, provide a question and a concise answer. Generate a unique UUID for each FAQ's 'id' field.

Focus on questions about course content, prerequisites, target audience, or what makes the course unique.
DO NOT generate questions about pricing, platform features, or login issues.

Your output MUST be a valid JSON object matching the specified schema, containing a 'faqs' array.
`,
});

const generateCourseFaqsFlow = ai.defineFlow(
  {
    name: 'generateCourseFaqsFlow',
    inputSchema: GenerateCourseFaqsInputSchema,
    outputSchema: GenerateCourseFaqsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Ensure every FAQ has a UUID if the model forgets.
    if (output && output.faqs) {
        output.faqs.forEach(faq => {
            if (!faq.id) {
                faq.id = uuidv4();
            }
        });
    }
    return output!;
  }
);
