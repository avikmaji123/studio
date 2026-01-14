'use server';

/**
 * @fileOverview This file defines the verifyFamPayPayment flow, which uses the Gmail API and AI to verify FamPay payments.
 * It fetches the latest payment confirmation email from a specific sender, extracts payment details,
 * verifies them against the course price, and grants course access in Firestore upon success.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { google } from 'googleapis';

// Initialize Firebase Admin SDK only if it hasn't been initialized yet.
if (!admin.apps.length) {
  try {
    // In a Firebase App Hosting environment, initializeApp() with no arguments 
    // automatically uses the service account credentials and project configuration.
    admin.initializeApp();
    console.log("Firebase Admin initialized successfully.");
  } catch (e) {
    console.error("Firebase Admin initialization error:", e);
  }
}

const firestore = admin.firestore();


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

const getLatestFamPayEmail = ai.defineTool(
  {
    name: 'getLatestFamPayEmail',
    description: 'Fetches the most recent unread payment notification email from FamPay (no-reply@famapp.in). This tool requires read-only access to the avikmaji911@gmail.com inbox.',
    inputSchema: z.object({}),
    outputSchema: z.any(),
  },
  async () => {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      });

      const gmail = google.gmail({ version: 'v1', auth });

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'from:no-reply@famapp.in is:unread',
        maxResults: 1,
      });

      if (!response.data.messages || response.data.messages.length === 0) {
        return null;
      }

      const messageId = response.data.messages[0].id;
      if (!messageId) {
        return null;
      }
      
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      // Mark the email as read
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        }
      });

      return {
        snippet: message.data.snippet,
      };
    } catch(e) {
      console.error("Error fetching email", e);
      return null;
    }
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

    // CRITICAL: Check if a real email was found. If not, fail verification.
    if (!email || !email.snippet) {
      return { verified: false, reasoning: 'No new FamPay payment email found. Please ensure you have paid and try again in a few moments.' };
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

    const result = verificationResult.output;

    if (!result) {
        throw new Error("AI verification returned no result.");
    }
    
    // If payment is verified by the AI, grant course access
    if (result.verified) {
      try {
        const enrollmentRef = firestore.collection('users').doc(input.userId).collection('enrollments').doc(input.courseId);
        await enrollmentRef.set({
          id: input.courseId,
          userId: input.userId,
          courseId: input.courseId,
          enrollmentDate: Timestamp.now(),
          completionPercentage: 0,
        });
        
      } catch (error: any) {
        console.error("Firestore error: Failed to create enrollment.", error);
        // Even if verification was "correct", we return false if the DB operation fails.
        return { verified: false, reasoning: `Payment was verified, but we couldn't grant you access due to a database error. Please contact support. Error: ${error.message}` };
      }
    }

    return result;
  }
);
