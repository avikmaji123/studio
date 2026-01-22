
'use server';
/**
 * @fileOverview A Genkit flow for analyzing system logs to provide a high-level status summary.
 *
 * This flow is a general-purpose system health check. For detailed security threat analysis,
 * see the detect-threats.ts flow.
 *
 * - summarizeSystemStatus - Takes a list of log entries and returns a system status assessment.
 * - SummarizeSystemStatusInput - The input type for the function.
 * - SummarizeSystemStatusOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const LogEntrySchema = z.object({
    id: z.string(),
    timestamp: z.string().describe('The ISO 8601 timestamp of the log entry.'),
    severity: z.enum(['info', 'warning', 'critical']),
    source: z.enum(['admin', 'user', 'system', 'api']),
    message: z.string(),
    metadata: z.object({
        userId: z.string().optional(),
        courseId: z.string().optional(),
        paymentId: z.string().optional(),
        route: z.string().optional(),
        ip: z.string().optional(),
        error: z.string().optional(),
    }).optional(),
});

const SummarizeSystemStatusInputSchema = z.object({
  logs: z.array(LogEntrySchema).describe('An array of recent log entries.'),
});
export type SummarizeSystemStatusInput = z.infer<typeof SummarizeSystemStatusInputSchema>;

const SummarizeSystemStatusOutputSchema = z.object({
  status: z.enum(["All Systems Normal", "Minor Warnings", "Action Required", "Critical Alert"]).describe('A concise classification of the system status.'),
  explanation: z.string().describe('A brief, human-readable explanation of the current system status based on the logs.'),
  action: z.string().optional().describe('A suggested next step for the administrator, if any is required.'),
});
export type SummarizeSystemStatusOutput = z.infer<typeof SummarizeSystemStatusOutputSchema>;

export async function summarizeSystemStatus(
  input: SummarizeSystemStatusInput
): Promise<SummarizeSystemStatusOutput> {
  return summarizeSystemStatusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSystemStatusPrompt',
  input: { schema: SummarizeSystemStatusInputSchema },
  output: { schema: SummarizeSystemStatusOutputSchema },
  prompt: `You are an expert system administrator. Your task is to analyze the following recent system log entries and provide a concise summary of the system's overall health. Do not focus on security threats unless they are system-breaking.

Logs (JSON format):
{{{json logs}}}

Analyze the logs for operational patterns and errors:
- Look for critical errors like database connection failures, service outages, or API failures.
- Note any repeated non-critical warnings.
- Assess general system activity.

Based on your analysis, classify the system status:
1.  **All Systems Normal**: No errors or significant warnings. System is operating perfectly.
2.  **Minor Warnings**: Some informational logs, maybe a minor, non-critical warning. Nothing that requires immediate attention.
3.  **Action Required**: One or more non-critical issues that should be investigated soon (e.g., repeated non-critical errors).
4.  **Critical Alert**: A serious operational issue that requires immediate attention (e.g., service outage, critical error).

Provide a brief, clear 'explanation' for your chosen status. If there is a problem, state what it is.
If 'Action Required' or 'Critical Alert' is issued, suggest a specific 'action' for the admin to take.

Your output MUST be a JSON object matching the specified schema.`,
});

const summarizeSystemStatusFlow = ai.defineFlow(
  {
    name: 'summarizeSystemStatusFlow',
    inputSchema: SummarizeSystemStatusInputSchema,
    outputSchema: SummarizeSystemStatusOutputSchema,
  },
  async input => {
    if (!input.logs || input.logs.length === 0) {
      return {
        status: 'All Systems Normal',
        explanation: 'No system activity recorded yet.',
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
