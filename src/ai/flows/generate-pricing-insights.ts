
'use server';
/**
 * @fileOverview An AI-powered engine to analyze sales data and generate actionable growth insights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Course, PaymentTransaction, Coupon } from '@/lib/types';

// Define schemas for the data we'll pass to the AI
const CourseDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string(),
  enrollmentCount: z.number().optional().default(0),
  status: z.string().optional(),
});

const TransactionDataSchema = z.object({
  courseId: z.string(),
  amount: z.number(),
  transactionDate: z.string(),
  couponUsed: z.string().optional(),
});

const CouponDataSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number(),
  status: z.enum(['active', 'inactive']),
  usageLimit: z.number(),
  usageCount: z.number(),
  expiresAt: z.string(),
  applicableCourseIds: z.array(z.string()),
});

// Define the structure of the input for our main flow
const GeneratePricingInsightsInputSchema = z.object({
  courses: z.array(CourseDataSchema),
  transactions: z.array(TransactionDataSchema),
  coupons: z.array(CouponDataSchema),
});
export type GeneratePricingInsightsInput = z.infer<typeof GeneratePricingInsightsInputSchema>;

// Define the structures for the different types of insights the AI can generate
const PriceSuggestionInsightSchema = z.object({
  type: z.enum(['PRICE_SUGGESTION']),
  courseId: z.string(),
  courseTitle: z.string(),
  currentPrice: z.number(),
  suggestedPrice: z.number(),
  reasoning: z.string(),
});

const OfferOpportunityInsightSchema = z.object({
  type: z.enum(['OFFER_OPPORTUNITY']),
  courseId: z.string(),
  courseTitle: z.string(),
  currentPrice: z.number(),
  suggestedDiscountPercentage: z.number().min(5).max(50),
  durationHours: z.number().min(24).max(168),
  reasoning: z.string(),
});

const CouponPerformanceInsightSchema = z.object({
    type: z.enum(['COUPON_ANALYSIS']),
    couponCode: z.string(),
    conversionRate: z.number(),
    totalUses: z.number(),
    reasoning: z.string(),
});


// The final output will be an array of any of the above insight types
const GeneratePricingInsightsOutputSchema = z.object({
  insights: z.array(
    z.union([
      PriceSuggestionInsightSchema,
      OfferOpportunityInsightSchema,
      CouponPerformanceInsightSchema,
    ])
  ),
});
export type GeneratePricingInsightsOutput = z.infer<typeof GeneratePricingInsightsOutputSchema>;
export type Insight = GeneratePricingInsightsOutput['insights'][0];


export async function generatePricingInsights(
  input: GeneratePricingInsightsInput
): Promise<GeneratePricingInsightsOutput> {
  return generatePricingInsightsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generatePricingInsightsPrompt',
  input: { schema: GeneratePricingInsightsInputSchema },
  output: { schema: GeneratePricingInsightsOutputSchema },
  prompt: `You are a Senior E-commerce Growth Analyst for an online course platform. Your task is to analyze the provided sales data and generate actionable insights to boost revenue.

**DATA PROVIDED:**
1.  **Courses**: \`\`\`json
{{{json courses}}}\`\`\`
2.  **Transactions**: \`\`\`json
{{{json transactions}}}\`\`\`
3.  **Coupons**: \`\`\`json
{{{json coupons}}}\`\`\`

**ANALYSIS RULES & INSIGHT GENERATION:**

Your entire output must be a valid JSON object matching the output schema. Generate an array of 'insights'.

1.  **PRICE_SUGGESTION**:
    *   **Identify candidates for price increase:** Look for courses with a high number of sales (high \`enrollmentCount\`) and consistently positive performance that are priced lower than comparable courses.
    *   **Identify candidates for price decrease:** Look for courses with very low sales (\`enrollmentCount\` is low) despite being published for a while. A price drop might stimulate interest.
    *   **Action:** Generate a \`PRICE_SUGGESTION\` insight. The \`suggestedPrice\` should be a reasonable increment/decrement (e.g., 10-25%). The \`reasoning\` must be concise and data-driven.

2.  **OFFER_OPPORTUNITY**:
    *   **Identify candidates for a flash sale:** Look for popular courses where sales have recently slowed down. A limited-time offer can create urgency and recapture momentum.
    *   **Action:** Generate an \`OFFER_OPPORTUNITY\` insight. Suggest a \`suggestedDiscountPercentage\` (between 10% and 40%) and a realistic \`durationHours\` (e.g., 48, 72). The \`reasoning\` should explain why this course is a good candidate for a sale.

3.  **COUPON_ANALYSIS**:
    *   **Analyze coupon effectiveness:** For each coupon, calculate its conversion rate (number of uses / total transactions if possible, or just note high usage).
    *   **Action:** Generate a \`COUPON_ANALYSIS\` insight for coupons with notable performance (either very high or very low). The \`reasoning\` should state whether the coupon is effective and suggest an action (e.g., "Promote this coupon more" or "Consider discontinuing this coupon").

**IMPORTANT:**
*   Be conservative. Only generate insights where there is a clear data-driven reason.
*   Do not invent data. Base all reasoning on the provided JSON.
*   If no significant insights can be drawn from the data, return an empty 'insights' array.
*   The prices in the input data are strings like "₹499". You must parse the number out of them for calculations. The output prices should be numbers.
`,
});

const generatePricingInsightsFlow = ai.defineFlow(
  {
    name: 'generatePricingInsightsFlow',
    inputSchema: GeneratePricingInsightsInputSchema,
    outputSchema: GeneratePricingInsightsOutputSchema,
  },
  async (input) => {
    if (!input.courses.length && !input.transactions.length) {
        return { insights: [] };
    }
    const { output } = await prompt(input);
    return output || { insights: [] };
  }
);
