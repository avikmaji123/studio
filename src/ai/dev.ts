
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/auto-handle-engine.ts';
import '@/ai/flows/refine-text.ts';
import '@/ai/flows/generate-tags.ts';
import '@/ai/flows/summarize-system-status.ts';
import '@/ai/flows/faq-assistant.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-course-outline.ts';
import '@/ai/flows/moderate-review.ts';
import '@/ai/flows/generate-reviews.ts';
import '@/ai/flows/generate-pricing-insights.ts';
import '@/ai/flows/generate-course-faqs.ts';

    
