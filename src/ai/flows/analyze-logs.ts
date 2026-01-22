
'use server';
/**
 * @fileOverview A Genkit flow for analyzing system logs to detect anomalies.
 *
 * - analyzeLogs - Takes a list of log entries and returns a system status assessment.
 * - AnalyzeLogsInput - The input type for the analyzeLogs function.
 * - AnalyzeLogsOutput - The return type for the analyzeLogs function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define Zod schema for LogEntry to use within Genkit flows
const LogEntrySchema = z.object({
    id: z.string(),
    timestamp: z.string().describe('The ISO 8601 timestamp of the log entry.'),
    severity: z.enum(['info', 'warning', 'critical']),
    source: z.enum(['admin', 'user', 'system', 'api']),
    message: z.string(),
    metadata: z.object({
        ip: z.string().optional(),
        userId: z.string().optional(),
        courseId: z.string().optional(),
    }).optional(),
});

const AnalyzeLogsInputSchema = z.object({
  logs: z.array(LogEntrySchema).describe('An array of the most recent log entries.'),
});
export type AnalyzeLogsInput = z.infer<typeof AnalyzeLogsInputSchema>;

const AnalyzeLogsOutputSchema = z.object({
  status: z.enum(["All OK", "Normal Activity", "Warning", "Critical Alert"]).describe('A concise classification of the system status.'),
  explanation: z.string().describe('A brief, human-readable explanation of the current system status based on the logs.'),
  action: z.string().optional().describe('A suggested next step for the administrator, if any is required.'),
});
export type AnalyzeLogsOutput = z.infer<typeof AnalyzeLogsOutputSchema>;

export async function analyzeLogs(
  input: AnalyzeLogsInput
): Promise<AnalyzeLogsOutput> {
  return analyzeLogsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLogsPrompt',
  input: { schema: AnalyzeLogsInputSchema },
  output: { schema: AnalyzeLogsOutputSchema },
  prompt: `You are an expert system administrator and security analyst. Your task is to analyze the following recent system log entries and provide a concise summary of the system's health.

Logs (JSON format):
{{{json logs}}}

Analyze the logs for patterns, errors, and security events. Look for:
- Repeated critical errors (e.g., gateway timeouts, database connection failures).
- Security-related events (e.g., failed logins, unauthorized access attempts, blacklisted IPs).
- A high frequency of warnings.
- Unusual user activity.

Based on your analysis, classify the current system status into one of four categories:
1.  **All OK**: No errors or significant warnings. System is operating perfectly.
2.  **Normal Activity**: Some informational logs, maybe a minor warning, but nothing that requires immediate attention. This is a healthy, active system.
3.  **Warning**: One or more non-critical issues that should be investigated soon (e.g., repeated non-critical errors, a spike in failed logins).
4.  **Critical Alert**: A serious issue that requires immediate attention (e.g., service outage, security breach, critical error).

Provide a brief, clear 'explanation' for your chosen status. If there is a problem, state what it is. If everything is fine, say so.
If a 'Warning' or 'Critical Alert' is issued, suggest a specific 'action' for the admin to take.

Your output MUST be a JSON object matching the specified schema.`,
});

const analyzeLogsFlow = ai.defineFlow(
  {
    name: 'analyzeLogsFlow',
    inputSchema: AnalyzeLogsInputSchema,
    outputSchema: AnalyzeLogsOutputSchema,
  },
  async input => {
    if (!input.logs || input.logs.length === 0) {
      return {
        status: 'All OK',
        explanation: 'No system activity recorded yet.',
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
