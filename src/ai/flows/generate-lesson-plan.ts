'use server';

/**
 * @fileOverview AI agent for generating lesson plans.
 *
 * - generateLessonPlan - A function that generates lesson plans based on user input.
 * - GenerateLessonPlanInput - The input type for the generateLessonPlan function.
 * - GenerateLessonPlanOutput - The return type for the generateLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  grade: z.string().describe('The grade level for the lesson plan.'),
  subject: z.string().describe('The subject of the lesson plan.'),
  textbooks: z.array(z.string()).describe('A list of textbooks to use for the lesson plan.'),
  numClasses: z.number().int().min(1).describe('The number of classes the lesson plan should cover.'),
  topicsOrChapters: z.string().describe('The topics or chapter numbers to be covered in the lesson plan.'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  lessonPlan: z.string().describe('The generated lesson plan in JSON format.'),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const generateLessonPlanPrompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `You are an AI assistant designed to help teachers create lesson plans.

  Based on the following information, generate a detailed lesson plan in JSON format. The lesson plan should cover all specified topics or chapters across the given number of classes. Consider the grade level and subject when creating the plan.

  Grade: {{{grade}}}
  Subject: {{{subject}}}
  Textbooks: {{#each textbooks}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Number of Classes: {{{numClasses}}}
  Topics/Chapters: {{{topicsOrChapters}}}

  Ensure the lesson plan is comprehensive, including objectives, activities, assessments, and resources for each class. Format the output as a JSON object.
  `,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await generateLessonPlanPrompt(input);
    return output!;
  }
);
