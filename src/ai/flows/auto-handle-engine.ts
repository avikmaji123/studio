'use server';

/**
 * @fileOverview This file defines the autoHandleEngine flow, which uses AI to verify UPI payments.
 * It analyzes a user-submitted screenshot and UTR to confirm payment details against the course price.
 *
 * It performs a primary check on the screenshot content and a fallback check on the UTR format.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoHandleEngineInputSchema = z.object({
  coursePrice: z.string().describe("The expected price of the course (e.g., '₹499')."),
  utr: z.string().describe('The UTR (Unique Transaction Reference) of the payment.'),
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of the payment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AutoHandleEngineInput = z.infer<typeof AutoHandleEngineInputSchema>;

const AutoHandleEngineOutputSchema = z.object({
  verified: z.boolean().describe('Whether the payment was successfully verified.'),
  reasoning: z.string().describe('The AI’s reasoning behind the verification outcome.'),
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
  prompt: `You are a highly accurate AI payment verification assistant. Your task is to verify a UPI payment for a course that costs exactly {{{coursePrice}}}.

You will be given the user-submitted UTR and a payment screenshot. Follow these steps strictly:

**1. PRIMARY CHECK (Screenshot Analysis):**
   - Analyze the payment screenshot: {{media url=screenshotDataUri}}
   - Extract the paid amount, date/time, and UTR from the image.
   - **Crucial:** Does the paid amount in the screenshot EXACTLY match {{{coursePrice}}}?
   - Is the timestamp recent and plausible?
   - Does the screenshot look authentic (not cropped, edited, or fake)?
   - If all conditions are met, the payment is verified.

**2. FALLBACK CHECK (UTR Validation - only if screenshot analysis fails):**
   - If the screenshot is unclear or fails analysis, examine the user-submitted UTR: {{{utr}}}
   - Does the UTR follow a valid UPI format (typically 12 alphanumeric characters)?
   - If the UTR format is valid and the screenshot wasn't obviously fraudulent, you can consider the payment verified with lower confidence.

**3. FINAL DECISION:**
   - If the Primary Check passes, set 'verified' to true. The reasoning should state that the screenshot details matched.
   - If the Primary Check fails but the Fallback Check passes, set 'verified' to true. The reasoning should state that verification is based on the submitted UTR as the screenshot was unclear.
   - If both checks fail, set 'verified' to false. Explain clearly why verification failed (e.g., "Amount in screenshot does not match course price," "Screenshot appears to be fake," or "Invalid UTR format").

Your output MUST be a JSON object with two fields: 'verified' (boolean) and 'reasoning' (string).`,
});

const autoHandleEngineFlow = ai.defineFlow(
  {
    name: 'autoHandleEngineFlow',
    inputSchema: AutoHandleEngineInputSchema,
    outputSchema: AutoHandleEngineOutputSchema,
  },
  async input => {
    // Ensure all inputs are present
    if (!input.coursePrice || !input.utr || !input.screenshotDataUri) {
      return {
        verified: false,
        reasoning: "Missing required information. Please provide Course Price, UTR, and a Screenshot."
      };
    }
    
    const {output} = await autoHandleEnginePrompt(input);
    return output!;
  }
);
