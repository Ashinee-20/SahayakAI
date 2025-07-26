'use server';

/**
 * @fileOverview Generates assessments and creates a Google Form.
 */

import {ai} from '@/ai/genkit';
import { GoogleFormsService, FormQuestion } from '@/services/google-forms';
import { 
  GenerateAssessmentInputSchema,
  GenerateAssessmentOutputSchema,
  AssessmentQuestionsSchema,
  GenerateAssessmentInput,
  GenerateAssessmentOutput
} from '@/ai/schemas/assessment';
import { saveContent } from '@/services/firebase-service';


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
Generate the questions in a structured JSON format. For question types, use 'RADIO' for single correct answers, 'CHECKBOX' for multiple correct answers, 'TEXT' for short answer, and 'PARAGRAPH' for long answer.

Grade: {{{grade}}}
Subject: {{{subject}}}
Textbooks: {{#each textbooks}}{{{this}}}, {{/each}}
Assessment Type: {{{assessment_type}}}
Topics/Chapters: {{{topics_or_chapters}}}

{{#if objective_config}}
Objective Questions Configuration:
Number of Questions: {{{objective_config.num_questions}}}
Difficulty Level: {{{objective_config.difficulty_level}}}
Type: {{{objective_config.type}}} (Should be RADIO or CHECKBOX)
Number of Options: {{{objective_config.num_options}}}
{{/if}}

{{#if subjective_config}}
Subjective Questions Configuration:
Number of Questions: {{{subjective_config.num_questions}}}
Difficulty Level: {{{subjective_config.difficulty_level}}}
Type: {{{subjective_config.type}}} (Should be TEXT for Short Answer and PARAGRAPH for Long Answer)
{{/if}}

{{#if fill_in_the_blanks_config}}
Fill in the Blanks Configuration (use TEXT type):
Number of Questions: {{{fill_in_the_blanks_config.num_options}}}
Difficulty Level: {{{fill_in_the_blanks_config.difficulty_level}}}
{{/if}}

{{#if mixed_config}}
Mixed Configuration:
Number of Objective Questions: {{{mixed_config.num_objective_questions}}}
Number of Subjective Questions: {{{mixed_config.num_subjective_questions}}}
Number of Fill in the Blanks: {{{mixed_config.num_fill_in_the_blanks}}}
Difficulty Level: {{{mixed_config.difficulty_level}}}
{{/if}}

Generate the assessment questions based on these configurations. Ensure the 'type' in the output matches the requested question types.
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
    const generatedQuestions: FormQuestion[] = output.questions;
    
    // Step 2: Use the Google Forms Service
    const formsService = new GoogleFormsService(input.accessToken);
    
    const formTitle = `Assessment: ${input.subject} - ${input.topics_or_chapters}`;
    const formDescription = `An assessment for Grade ${input.grade} on the topic of ${input.topics_or_chapters}.`;

    // Step 3: Create the Google Form
    const formId = await formsService.createForm(formTitle, formDescription);

    // Step 4: Add the generated questions to the form
    await formsService.addQuestions(formId, generatedQuestions);
    
    // Step 5: Get the form details (including the public URL)
    const form = await formsService.getForm(formId);

    // Step 6: Save to Firestore
    await saveContent(
        input.userId,
        'assessment',
        formTitle,
        {
            formUrl: form.responderUri,
            questions: generatedQuestions,
        }
    );

    // Step 7: Return the URL and the raw questions
    return {
      formUrl: form.responderUri,
      assessment: JSON.stringify(generatedQuestions, null, 2),
    };
  }
);
