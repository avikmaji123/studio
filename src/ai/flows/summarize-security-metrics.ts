
'use server';
/**
 * @fileOverview An AI flow to summarize key security metrics from raw log data.
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

const SecurityMetricsInputSchema = z.object({
  logs: z.array(LogEntrySchema).describe('An array of log entries from the last 24 hours.'),
});
export type SecurityMetricsInput = z.infer<typeof SecurityMetricsInputSchema>;

const SecurityMetricsOutputSchema = z.object({
  activeSecurityEvents: z.number().int().describe('Total count of logs with "warning" or "critical" severity.'),
  failedLoginAttempts: z.number().int().describe('Count of logs specifically indicating a failed login attempt.'),
  adminActions: z.number().int().describe('Total count of logs where the source is "admin".'),
  highRiskIpCount: z.number().int().describe('Count of unique IP addresses associated with "critical" severity events.'),
});
export type SecurityMetricsOutput = z.infer<typeof SecurityMetricsOutputSchema>;

export async function summarizeSecurityMetrics(
  input: SecurityMetricsInput
): Promise<SecurityMetricsOutput> {
  return summarizeSecurityMetricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSecurityMetricsPrompt',
  input: { schema: SecurityMetricsInputSchema },
  output: { schema: SecurityMetricsOutputSchema },
  prompt: `You are a security analyst. Your sole task is to parse the provided JSON log data and extract specific metrics. Do not analyze for threats, just count the occurrences based on the rules below.

Log data:
{{{json logs}}}

**Metric Calculation Rules:**

1.  **activeSecurityEvents**: Count every log entry where 'severity' is 'warning' or 'critical'.
2.  **failedLoginAttempts**: Count every log entry where the 'message' contains the words "failed login" or "Invalid credentials" or "Non-admin user attempted to access admin".
3.  **adminActions**: Count every log entry where 'source' is exactly 'admin'.
4.  **highRiskIpCount**: First, find all log entries where 'severity' is 'critical'. Then, count the number of *unique* IP addresses found in the 'metadata.ip' field of those critical logs.

Your output MUST be a valid JSON object matching the specified schema, containing only the calculated counts.`,
});

const summarizeSecurityMetricsFlow = ai.defineFlow(
  {
    name: 'summarizeSecurityMetricsFlow',
    inputSchema: SecurityMetricsInputSchema,
    outputSchema: SecurityMetricsOutputSchema,
  },
  async input => {
    if (!input.logs || input.logs.length === 0) {
      return {
        activeSecurityEvents: 0,
        failedLoginAttempts: 0,
        adminActions: 0,
        highRiskIpCount: 0,
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
