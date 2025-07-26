import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lesson-plan.ts';
import '@/ai/flows/generate-assessment.ts';
import '@/ai/flows/generate-class-notes.ts';
import '@/ai/flows/generate-story.ts';
import '@/ai/flows/generate-visual-aid-guide.ts';
