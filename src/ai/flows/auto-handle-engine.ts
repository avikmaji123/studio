'use server';

/**
 * @fileOverview This file defines the autoHandleEngine flow, which uses AI to analyze a payment screenshot
 * for risk and extract key transaction details.
 *
 * It does NOT verify the payment but provides data for hard validation checks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoHandleEngineInputSchema = z.object({
  coursePrice: z.string().describe("The expected price of the course (e.g., '₹499')."),
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of the payment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AutoHandleEngineInput = z.infer<typeof AutoHandleEngineInputSchema>;

const AutoHandleEngineOutputSchema = z.object({
  riskScore: z.enum(['low', 'medium', 'high']).describe("The AI's assessed risk level for this transaction."),
  reasoning: z.string().describe('The AI’s reasoning behind the assigned risk score.'),
  amountDetected: z.string().optional().describe('The payment amount detected in the screenshot, if any.'),
  utrDetected: z.string().optional().describe('The UTR detected in the screenshot, if any.'),
  receiverUpiIdDetected: z.string().optional().describe('The UPI ID of the receiver detected in the screenshot, if any.'),
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
  prompt: `You are a highly accurate AI fraud detection analyst for a course platform. Your task is to analyze a payment screenshot and assess its risk. You MUST NOT approve the payment. Your only job is to extract information and identify risk factors.

The expected course price is exactly {{{coursePrice}}}.

**Analysis Steps:**

1.  **Analyze the payment screenshot:** {{media url=screenshotDataUri}}
2.  **Extract Data:**
    *   Carefully extract the exact payment amount.
    *   Extract the UTR (Unique Transaction Reference).
    *   Extract the receiver's UPI ID.
3.  **Assess Risk:** Based on your analysis, determine a risk score ('low', 'medium', 'high').
    *   **High Risk:** Assign 'high' if you see ANY signs of tampering, editing, cropping, or if the screenshot looks like a generic image from the internet. Also consider it high risk if critical information (amount, UTR) is missing.
    *   **Medium Risk:** Assign 'medium' if the screenshot seems legitimate but some details are blurry or slightly ambiguous.
    *   **Low Risk:** Assign 'low' only if the screenshot appears completely authentic, is a full-screen capture, and all key details are perfectly clear.
4.  **Provide Reasoning:** Briefly explain your risk assessment. For example: "High risk due to signs of image cropping and unusual font on the UTR." or "Low risk, all details are clear and screenshot appears authentic."

Your output MUST be a JSON object with the extracted fields and the risk assessment. DO NOT make a verification decision.`,
});

const autoHandleEngineFlow = ai.defineFlow(
  {
    name: 'autoHandleEngineFlow',
    inputSchema: AutoHandleEngineInputSchema,
    outputSchema: AutoHandleEngineOutputSchema,
  },
  async input => {
    // Ensure all inputs are present
    if (!input.coursePrice || !input.screenshotDataUri) {
       return {
        riskScore: 'high',
        reasoning: "Missing required information for analysis (course price or screenshot).",
      };
    }
    
    const {output} = await autoHandleEnginePrompt(input);
    return output!;
  }
);
