'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/auto-handle-engine.ts';
import '@/ai/flows/refine-text.ts';
import '@/ai/flows/generate-tags.ts';
import '@/ai/flows/analyze-logs.ts';
import '@/ai/flows/faq-assistant.ts';
import '@/ai/flows/generate-quiz.ts';
