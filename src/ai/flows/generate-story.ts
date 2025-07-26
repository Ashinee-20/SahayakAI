'use server';

/**
 * @fileOverview Generates educational stories based on user-defined criteria.
 *
 * - generateStory - A function that generates educational stories tailored to a specific grade, subject, and topic, with adjustable tone and creativity levels.
 * - GenerateStoryInput - The input type for the generateStory function.
 * - GenerateStoryOutput - The return type for the generateStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryInputSchema = z.object({
  grade: z.string().describe('The grade level of the story.'),
  subject: z.string().describe('The subject of the story.'),
  topic: z.string().describe('The topic of the story.'),
  tone: z.enum(['Engaging', 'Serious', 'Humorous']).describe('The tone of the story.'),
  creativityLevel: z.enum(['Low', 'Medium', 'High']).describe('The creativity level of the story.'),
});

export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const GenerateStoryOutputSchema = z.object({
  story: z.string().describe('The generated story.'),
});

export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const generateStoryPrompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  input: {schema: GenerateStoryInputSchema},
  output: {schema: GenerateStoryOutputSchema},
  prompt: `You are an expert story teller specializing in educational stories.

You will generate a story based on the following criteria:

Grade: {{{grade}}}
Subject: {{{subject}}}
Topic: {{{topic}}}
Tone: {{{tone}}}
Creativity Level: {{{creativityLevel}}}

Write an educational story.`,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async input => {
    const {output} = await generateStoryPrompt(input);
    return output!;
  }
);
