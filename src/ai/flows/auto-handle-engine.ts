'use server';

/**
 * @fileOverview This file defines the autoHandleEngine flow, which uses AI to analyze payment submissions and provide trust scores.
 *
 * The flow analyzes UTR format, timestamp behavior, duplicate detection and screenshot reuse to assess the trustworthiness of a payment.
 * It outputs a trust score and a suggestion for approval or rejection.
 *
 * @requires genkit
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoHandleEngineInputSchema = z.object({
  utr: z.string().describe('The UTR (Unique Transaction Reference) of the payment.'),
  timestamp: z.string().describe('The timestamp of the payment submission.'),
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of the payment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  previousScreenshots: z
    .array(z.string())
    .optional()
    .describe('A list of data URIs of previously submitted screenshots by the user.'),
});
export type AutoHandleEngineInput = z.infer<typeof AutoHandleEngineInputSchema>;

const AutoHandleEngineOutputSchema = z.object({
  trustScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score between 0 and 100 indicating the trustworthiness of the payment.'),
  suggestion: z
    .enum(['approve', 'reject', 'review'])
    .describe('A suggestion for the admin to approve, reject, or review the payment.'),
  reasoning: z
    .string()
    .describe('The AI’s reasoning behind the trust score and suggestion.'),
});
export type AutoHandleEngineOutput = z.infer<typeof AutoHandleEngineOutputSchema>;

export async function autoHandleEngine(
  input: AutoHandleEngineInput
): Promise<AutoHandleEngineOutput> {
  return autoHandleEngineFlow(input);
}

const autoHandleEnginePrompt = ai.definePrompt({
  name: 'autoHandleEnginePrompt',
  input: {schema: AutoHandleEngineInputSchema},
  output: {schema: AutoHandleEngineOutputSchema},
  prompt: `You are an AI assistant that helps admins to decide whether to approve or reject payments.

You will receive the UTR, timestamp, and screenshot of the payment submission, along with any previous screenshots submitted by the user.

Analyze the information and provide a trust score between 0 and 100, a suggestion to approve, reject, or review the payment, and your reasoning.

Consider the following factors:

*   UTR format: Is the UTR valid?
*   Timestamp behavior: Is the timestamp consistent with the payment submission time?
*   Screenshot reuse: Has the screenshot been used before by the same user? Compare to the following previous screenshots: {{#each previousScreenshots}}{{{media url=this}}}{{#sep}}, {{/sep}}{{/each}}

Here's the payment information:

UTR: {{{utr}}}
Timestamp: {{{timestamp}}}
Screenshot: {{media url=screenshotDataUri}}

Output should be in JSON format, following this schema: ${JSON.stringify(
    AutoHandleEngineOutputSchema.shape
  )}.

Make sure to include "trustScore", "suggestion", and "reasoning" fields in the output.`,
});

const autoHandleEngineFlow = ai.defineFlow(
  {
    name: 'autoHandleEngineFlow',
    inputSchema: AutoHandleEngineInputSchema,
    outputSchema: AutoHandleEngineOutputSchema,
  },
  async input => {
    const {output} = await autoHandleEnginePrompt(input);
    return output!;
  }
);
