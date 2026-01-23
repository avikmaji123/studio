'use server';
/**
 * @fileOverview An AI-powered flow for moderating user-submitted course reviews.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ModerateReviewInputSchema = z.object({
  reviewTitle: z.string(),
  reviewText: z.string(),
});
export type ModerateReviewInput = z.infer<typeof ModerateReviewInputSchema>;

const ModerateReviewOutputSchema = z.object({
  status: z.enum(['approved', 'pending', 'rejected']),
  reason: z.string().describe('A brief reason for the decision. E.g., "Positive sentiment" or "Contains abusive language."'),
});
export type ModerateReviewOutput = z.infer<typeof ModerateReviewOutputSchema>;

export async function moderateReview(input: ModerateReviewInput): Promise<ModerateReviewOutput> {
  return moderateReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateReviewPrompt',
  input: { schema: ModerateReviewInputSchema },
  output: { schema: ModerateReviewOutputSchema },
  prompt: `You are a strict but fair content moderator for a course platform. Analyze the following review.

Review Title: "{{{reviewTitle}}}"
Review Text: "{{{reviewText}}}"

Your task is to classify the review based on these rules:
1.  **Auto-reject**: If the review contains spam, hate speech, abusive language, personal attacks, fake claims, or is completely nonsensical, set status to 'rejected'.
2.  **Auto-reject**: If the review's primary purpose is to attack or defame CourseVerse as a platform (not constructive criticism of a course), set status to 'rejected'.
3.  **Manual Review (pending)**: If the review is negative or contains neutral/constructive criticism, set status to 'pending'. This allows an admin to review it.
4.  **Auto-approve**: If the review is clearly positive, genuine, and provides helpful feedback, set status to 'approved'.

Provide a brief, clear reason for your decision. Your output must be a valid JSON object.`,
});

const moderateReviewFlow = ai.defineFlow({
    name: 'moderateReviewFlow',
    inputSchema: ModerateReviewInputSchema,
    outputSchema: ModerateReviewOutputSchema,
  }, async (input) => {
    const { output } = await prompt(input);
    return output!;
});

    