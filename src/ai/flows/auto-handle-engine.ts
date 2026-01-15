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
  prompt: `You are an expert fraud detection analyst specializing in forensic analysis of payment screenshots. Your only task is to analyze the provided image for signs of tampering and extract key information. You MUST NOT make a final decision to approve or deny the payment.

The expected course price is exactly {{{coursePrice}}}.

**Forensic Analysis Checklist:**

1.  **Analyze the payment screenshot:** {{media url=screenshotDataUri}}
2.  **Extract Critical Data:**
    *   Carefully extract the exact payment amount.
    *   Extract the UTR (Unique Transaction Reference) or Transaction ID.
    *   Extract the receiver's UPI ID.
3.  **Assess Risk Score:** Based on your forensic analysis, determine a risk score ('low', 'medium', 'high').
    *   **High Risk:** Assign 'high' for any of the following red flags:
        *   **Signs of Editing:** Mismatched fonts, pixelation around text, unnatural spacing, or alignment issues in the amount, UTR, or date.
        *   **Cropping/Incompleteness:** The screenshot is heavily cropped, missing critical context like the status bar, time, or app interface.
        *   **Generic Image:** The image appears to be a stock photo or a generic example from the internet.
        *   **Missing Data:** Critical information like the amount or UTR is completely absent or unreadable.
    *   **Medium Risk:** Assign 'medium' if the screenshot appears generally authentic but has minor issues:
        *   **Blurriness:** Key details are blurry but still legible.
        *   **Slight Cropping:** The image is slightly cropped but still contains most contextual UI elements.
    *   **Low Risk:** Assign 'low' ONLY if the screenshot meets all these criteria:
        *   **Authentic Appearance:** Looks like a genuine, unaltered screenshot from a real payment app.
        *   **Full Context:** Includes device elements like the status bar (time, battery), and the app's own UI.
        *   **Crystal Clear:** All text is sharp, well-aligned, and uses a consistent font.
4.  **Provide Clear Reasoning:** Justify your risk score with specific observations from your analysis.
    *   *Good Example:* "High risk. The font used for the UTR is different from the rest of the text, and there is visible pixel distortion around the amount, suggesting digital alteration."
    *   *Bad Example:* "It looks fake."

Your output MUST be a valid JSON object matching the specified schema, containing the extracted data, the risk score, and your reasoning.`,
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
