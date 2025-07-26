'use server';

/**
 * @fileOverview Generates assessments based on the specified parameters.
 *
 * - generateAssessment - A function that generates assessments.
 * - GenerateAssessmentInput - The input type for the generateAssessment function.
 * - GenerateAssessmentOutput - The return type for the generateAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ObjectiveConfigSchema = z.object({
  num_questions: z.number().describe('Number of objective questions.'),
  difficulty_level: z.enum(['Easy', 'Medium', 'Hard']).describe('Difficulty level of questions.'),
  type: z.enum(['Single Correct', 'Multi Correct', 'Both']).describe('Type of objective questions.'),
  num_options: z.number().describe('Number of options for objective questions.'),
});

const SubjectiveConfigSchema = z.object({
  num_questions: z.number().describe('Number of subjective questions.'),
  difficulty_level: z.enum(['Easy', 'Medium', 'Hard']).describe('Difficulty level of questions.'),
  type: z.enum(['Short Answer', 'Long Answer', 'Both']).describe('Type of subjective questions.'),
});

const FillInTheBlanksConfigSchema = z.object({
  num_options: z.number().describe('Number of options for fill in the blanks.'),
  difficulty_level: z.enum(['Easy', 'Medium', 'Hard']).describe('Difficulty level of questions.'),
});

const MixedConfigSchema = z.object({
  num_objective_questions: z.number().describe('Number of objective questions.'),
  num_subjective_questions: z.number().describe('Number of subjective questions.'),
  num_fill_in_the_blanks: z.number().describe('Number of fill in the blanks questions.'),
  difficulty_level: z.enum(['Easy', 'Medium', 'Hard']).describe('Difficulty level of questions.'),
});

const GenerateAssessmentInputSchema = z.object({
  grade: z.string().describe('The grade level.'),
  subject: z.string().describe('The subject.'),
  textbooks: z.array(z.string()).describe('List of textbooks.'),
  assessment_type: z.enum(['Quiz', 'Descriptive', 'Fill in the Blanks', 'Mixed']).describe('Type of assessment.'),
  topics_or_chapters: z.string().describe('Topics or chapters covered in the assessment.'),
  objective_config: ObjectiveConfigSchema.optional().describe('Configuration for objective questions.'),
  subjective_config: SubjectiveConfigSchema.optional().describe('Configuration for subjective questions.'),
  fill_in_the_blanks_config: FillInTheBlanksConfigSchema.optional().describe('Configuration for fill in the blanks questions.'),
  mixed_config: MixedConfigSchema.optional().describe('Configuration for mixed question types.'),
});

export type GenerateAssessmentInput = z.infer<typeof GenerateAssessmentInputSchema>;

const GenerateAssessmentOutputSchema = z.object({
  assessment: z.string().describe('The generated assessment questions.'),
});

export type GenerateAssessmentOutput = z.infer<typeof GenerateAssessmentOutputSchema>;

export async function generateAssessment(input: GenerateAssessmentInput): Promise<GenerateAssessmentOutput> {
  return generateAssessmentFlow(input);
}

const assessmentPrompt = ai.definePrompt({
  name: 'assessmentPrompt',
  input: {schema: GenerateAssessmentInputSchema},
  output: {schema: GenerateAssessmentOutputSchema},
  prompt: `You are an expert teacher. Your task is to generate assessments based on the provided configuration.

Grade: {{{grade}}}
Subject: {{{subject}}}
Textbooks: {{#each textbooks}}{{{this}}}, {{/each}}
Assessment Type: {{{assessment_type}}}
Topics/Chapters: {{{topics_or_chapters}}}

{{#if objective_config}}
Objective Questions Configuration:
Number of Questions: {{{objective_config.num_questions}}}
Difficulty Level: {{{objective_config.difficulty_level}}}
Type: {{{objective_config.type}}}
Number of Options: {{{objective_config.num_options}}}
{{/if}}

{{#if subjective_config}}
Subjective Questions Configuration:
Number of Questions: {{{subjective_config.num_questions}}}
Difficulty Level: {{{subjective_config.difficulty_level}}}
Type: {{{subjective_config.type}}}
{{/if}}

{{#if fill_in_the_blanks_config}}
Fill in the Blanks Configuration:
Number of Options: {{{fill_in_the_blanks_config.num_options}}}
Difficulty Level: {{{fill_in_the_blanks_config.difficulty_level}}}
{{/if}}

{{#if mixed_config}}
Mixed Configuration:
Number of Objective Questions: {{{mixed_config.num_objective_questions}}}
Number of Subjective Questions: {{{mixed_config.num_subjective_questions}}}
Number of Fill in the Blanks: {{{mixed_config.num_fill_in_the_blanks}}}
Difficulty Level: {{{mixed_config.difficulty_level}}}
{{/if}}

Generate the assessment questions based on the configurations.
`, 
});

const generateAssessmentFlow = ai.defineFlow(
  {
    name: 'generateAssessmentFlow',
    inputSchema: GenerateAssessmentInputSchema,
    outputSchema: GenerateAssessmentOutputSchema,
  },
  async input => {
    const {output} = await assessmentPrompt(input);
    return output!;
  }
);
