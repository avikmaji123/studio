
'use server';
/**
 * @fileOverview An AI flow for deep security analysis of logs to detect threats and create alerts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

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

const SecurityAlertSchema = z.object({
    caseId: z.string().describe("A unique identifier for this alert case (e.g., a UUID)."),
    timestamp: z.string().describe("The ISO 8601 timestamp of the most recent log event related to this alert."),
    severity: z.enum(['low', 'medium', 'high', 'critical']).describe("The assessed severity of the detected threat."),
    title: z.string().describe("A concise, human-readable title for the alert (e.g., 'Potential Brute-Force Attack')."),
    explanation: z.string().describe("A clear, brief explanation of why the alert was triggered and what it means."),
    confidence: z.number().min(0).max(1).describe("The AI's confidence in this detection, from 0.0 (low) to 1.0 (high)."),
    relatedLogIds: z.array(z.string()).describe("An array of log 'id' values that contributed to this alert."),
});

const DetectThreatsInputSchema = z.object({
  logs: z.array(LogEntrySchema).describe('An array of log entries to be analyzed for security threats.'),
});
export type DetectThreatsInput = z.infer<typeof DetectThreatsInputSchema>;

const DetectThreatsOutputSchema = z.object({
  alerts: z.array(SecurityAlertSchema).describe("A list of generated security alerts. Can be empty if no threats are found."),
});
export type DetectThreatsOutput = z.infer<typeof DetectThreatsOutputSchema>;

export async function detectThreats(
  input: DetectThreatsInput
): Promise<DetectThreatsOutput> {
  return detectThreatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectThreatsPrompt',
  input: { schema: DetectThreatsInputSchema },
  output: { schema: DetectThreatsOutputSchema },
  prompt: `You are a senior SOC architect and security data scientist. Your task is to analyze the provided infrastructure logs and identify potential security threats. Generate a structured list of alerts based on your findings.

**Log Data:**
\`\`\`json
{{{json logs}}}
\`\`\`

**Threat Detection Rules:**

1.  **Brute-Force Login Attempts:**
    *   **Condition:** Identify multiple 'failed login' or 'Invalid credentials' logs from the same IP address within a short time frame (e.g., >5 attempts in 5 minutes).
    *   **Action:** Generate a 'medium' or 'high' severity alert. The title should be "Potential Brute-Force Attack". Explanation should mention the source IP and the number of failed attempts.

2.  **Anomalous Admin Behavior:**
    *   **Condition:** Look for unusual patterns from an admin user ('source: admin'). Examples include: a high number of certificate deletions, rapid user suspensions, or activity from an admin account outside of normal business hours (assume normal hours are 9 AM to 6 PM UTC).
    *   **Action:** Generate a 'high' or 'critical' severity alert. Title should be "Anomalous Admin Activity". Explanation must describe the suspicious action.

3.  **Credential Stuffing:**
    *   **Condition:** Identify multiple 'failed login' events across *different* user accounts originating from the *same* IP address.
    *   **Action:** Generate a 'high' severity alert. Title should be "Potential Credential Stuffing". Explanation should note the source IP and the number of accounts targeted.

4.  **Suspicious Download Spikes:**
    *   **Condition:** Detect an abnormally high number of 'Download' related log entries from a single user or IP address in a short period.
    *   **Action:** Generate a 'medium' severity alert. Title: "Suspicious Download Activity".

5.  **Unauthorized Access Attempts:**
    *   **Condition:** Find any log with 'critical' severity and a message indicating "Unauthorized access attempt" or "Access Denied".
    *   **Action:** Generate a 'critical' severity alert. The title should directly reflect the error message.

**Output Requirements:**

*   For each detected threat, create a 'SecurityAlert' object.
*   The 'caseId' must be a newly generated unique identifier.
*   The 'timestamp' should be the timestamp of the *latest* log entry that triggered the alert.
*   The 'explanation' must be clear and concise.
*   'confidence' should reflect your certainty. A clear pattern match is high confidence (0.8-1.0), while a weaker correlation is lower (0.5-0.7).
*   'relatedLogIds' must contain the 'id' of every log entry that contributed to your analysis for that specific alert.
*   If no threats are detected, return an empty 'alerts' array.

Your entire output MUST be a valid JSON object matching the specified schema.
`,
});

const detectThreatsFlow = ai.defineFlow(
  {
    name: 'detectThreatsFlow',
    inputSchema: DetectThreatsInputSchema,
    outputSchema: DetectThreatsOutputSchema,
  },
  async input => {
    if (!input.logs || input.logs.length === 0) {
      return { alerts: [] };
    }
    const { output } = await prompt(input);
    
    // Ensure every alert has a UUID.
    if (output && output.alerts) {
        output.alerts.forEach(alert => {
            if (!alert.caseId) {
                alert.caseId = uuidv4();
            }
        });
    }

    return output || { alerts: [] };
  }
);
