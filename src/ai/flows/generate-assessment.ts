'use server';

/**
 * @fileOverview Generates assessments and creates a Google Form.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GoogleFormsService, Question } from '@/services/google-forms';

// Schemas for different assessment configurations
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

// Input schema for the main flow
export const GenerateAssessmentInputSchema = z.object({
  grade: z.string().describe('The grade level.'),
  subject: z.string().describe('The subject.'),
  textbooks: z.array(z.string()).describe('List of textbooks.'),
  assessment_type: z.enum(['Quiz', 'Descriptive', 'Fill in the Blanks', 'Mixed']).describe('Type of assessment.'),
  topics_or_chapters: z.string().describe('Topics or chapters covered in the assessment.'),
  accessToken: z.string().describe('Google OAuth2 access token for Forms API.'),
  
  objective_config: ObjectiveConfigSchema.optional().describe('Configuration for objective questions.'),
  subjective_config: SubjectiveConfigSchema.optional().describe('Configuration for subjective questions.'),
  fill_in_the_blanks_config: FillInTheBlanksConfigSchema.optional().describe('Configuration for fill in the blanks questions.'),
  mixed_config: MixedConfigSchema.optional().describe('Configuration for mixed question types.'),
});
export type GenerateAssessmentInput = z.infer<typeof GenerateAssessmentInputSchema>;


// Define the structure of a single question for the AI model
const QuestionSchema = z.object({
  question: z.string().describe("The question text."),
  type: z.enum(["RADIO", "CHECKBOX"]).describe("The type of multiple choice question. RADIO for single-choice, CHECKBOX for multi-choice."),
  options: z.array(z.string()).describe("A list of possible answers for the question."),
});

// Define the output schema for the AI prompt
const AssessmentQuestionsSchema = z.object({
  questions: z.array(QuestionSchema).describe("An array of generated assessment questions."),
});

export const GenerateAssessmentOutputSchema = z.object({
  formUrl: z.string().describe("The URL of the created Google Form."),
  assessment: z.string().describe('The generated assessment questions as a JSON string.'),
});
export type GenerateAssessmentOutput = z.infer<typeof GenerateAssessmentOutputSchema>;

// Exported function that the frontend will call
export async function generateAssessment(input: GenerateAssessmentInput): Promise<GenerateAssessmentOutput> {
  return generateAssessmentFlow(input);
}

// AI Prompt to generate questions in a structured format
const assessmentPrompt = ai.definePrompt({
  name: 'assessmentPrompt',
  input: {schema: GenerateAssessmentInputSchema},
  output: {schema: AssessmentQuestionsSchema},
  prompt: `You are an expert teacher. Your task is to generate assessment questions based on the provided configuration.
Generate the questions in a structured JSON format. For question types, use 'RADIO' for single correct answers and 'CHECKBOX' for multiple correct answers.

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

Generate the assessment questions based on these configurations.
`,
});

// Main Genkit Flow
const generateAssessmentFlow = ai.defineFlow(
  {
    name: 'generateAssessmentFlow',
    inputSchema: GenerateAssessmentInputSchema,
    outputSchema: GenerateAssessmentOutputSchema,
  },
  async input => {
    // Step 1: Generate questions using the AI model
    const { output } = await assessmentPrompt(input);
    if (!output?.questions) {
      throw new Error("Failed to generate assessment questions.");
    }
    const generatedQuestions: Question[] = output.questions;
    
    // Step 2: Use the Google Forms Service
    const formsService = new GoogleFormsService(input.accessToken);
    
    const formTitle = `Assessment: ${input.subject} - ${input.topics_or_chapters}`;
    const formDescription = `An assessment for Grade ${input.grade} on the topic of ${input.topics_or_chapters}.`;

    // Step 3: Create the Google Form
    const formId = await formsService.createForm(formTitle, formDescription);

    // Step 4: Add the generated questions to the form
    await formsService.addQuizQuestions(formId, generatedQuestions);
    
    // Step 5: Get the form details (including the public URL)
    const form = await formsService.getForm(formId);

    // Step 6: Return the URL and the raw questions
    return {
      formUrl: form.responderUri,
      assessment: JSON.stringify(generatedQuestions, null, 2),
    };
  }
);
