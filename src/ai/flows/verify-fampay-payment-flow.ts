'use server';

/**
 * @fileOverview This file defines the verifyFamPayPayment flow, which uses the Gmail API and AI to verify FamPay payments.
 * It fetches the latest payment confirmation email from a specific sender, extracts payment details,
 * verifies them against the course price, and grants course access in Firestore upon success.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';

// Initialize Firebase Admin SDK to interact with Firestore
// Note: This assumes server-side execution with appropriate credentials.
const { firestore } = initializeFirebase();

const verifyPaymentInputSchema = z.object({
  courseId: z.string().describe("The ID of the course being purchased."),
  coursePrice: z.string().describe("The expected price of the course (e.g., '₹499')."),
  userId: z.string().describe("The ID of the user purchasing the course."),
});
export type VerifyPaymentInput = z.infer<typeof verifyPaymentInputSchema>;

const verifyPaymentOutputSchema = z.object({
  verified: z.boolean().describe("Whether the payment was successfully verified."),
  reasoning: z.string().describe("The reason for the verification outcome."),
});
export type VerifyPaymentOutput = z.infer<typeof verifyPaymentOutputSchema>;

// Mock response for the Gmail tool
const mockGmailResponse = {
    snippet: 'You have received a payment of ₹499 from John Doe. Transaction ID: FAMPAY123456789.',
    payload: {
        headers: [
            { name: 'From', value: 'no-reply@famapp.in' },
            { name: 'Subject', value: 'Payment Received' },
        ],
        body: {
            data: Buffer.from('Full email body content here, including details like: Amount: ₹499, From: John Doe, Txn ID: FAMPAY123456789.').toString('base64'),
        }
    }
};

const getLatestFamPayEmail = ai.defineTool(
  {
    name: 'getLatestFamPayEmail',
    description: 'Fetches the most recent unread payment notification email from FamPay (no-reply@famapp.in). This tool requires read-only access to the avikmaji911@gmail.com inbox.',
    inputSchema: z.object({}),
    outputSchema: z.any(),
  },
  async () => {
    // In a real implementation, this would use the Gmail API with OAuth.
    // For this prototype, we return a mock response.
    console.log("Tool: getLatestFamPayEmail is using mock data.");
    return mockGmailResponse;
  }
);


export async function verifyFamPayPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
  return verifyFamPayPaymentFlow(input);
}

const verifyFamPayPaymentFlow = ai.defineFlow(
  {
    name: 'verifyFamPayPaymentFlow',
    inputSchema: verifyPaymentInputSchema,
    outputSchema: verifyPaymentOutputSchema,
  },
  async (input) => {
    const email = await getLatestFamPayEmail({});

    if (!email || !email.snippet) {
      return { verified: false, reasoning: 'No new FamPay payment email found. Please try again in a few moments.' };
    }

    // AI prompt to analyze the email content
    const verificationResult = await ai.generate({
      prompt: `You are a payment verification assistant. Analyze the following email snippet to verify a payment for a course that costs ${input.coursePrice}.
      
      Email content: "${email.snippet}"

      Your task:
      1. Confirm if the payment amount matches exactly ${input.coursePrice}.
      2. Extract the Transaction ID.
      3. Based on the amount match, decide if the payment is verified.

      Return a JSON object with two fields: 'verified' (boolean) and 'reasoning' (string).
      If verified, the reasoning should state the matched amount and transaction ID.
      If not verified, explain why (e.g., amount mismatch, details not found).
      `,
      output: {
        schema: z.object({
          verified: z.boolean(),
          reasoning: z.string(),
        })
      },
    });

    const result = verificationResult.output();

    if (!result) {
        throw new Error("AI verification returned no result.");
    }
    
    // If payment is verified by the AI, grant course access
    if (result.verified) {
      try {
        const enrollmentRef = doc(firestore, 'users', input.userId, 'enrollments', input.courseId);
        await setDoc(enrollmentRef, {
          id: input.courseId,
          userId: input.userId,
          courseId: input.courseId,
          enrollmentDate: serverTimestamp(),
          completionPercentage: 0,
        });
        
        // Optionally, log this action
        // await addDoc(collection(firestore, 'adminActionLogs'), { ... });

      } catch (error: any) {
        console.error("Firestore error: Failed to create enrollment.", error);
        // Even if verification was "correct", we return false if the DB operation fails.
        return { verified: false, reasoning: `Payment was verified, but we couldn't grant you access due to a database error. Please contact support. Error: ${error.message}` };
      }
    }

    return result;
  }
);
