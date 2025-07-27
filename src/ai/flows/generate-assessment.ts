'use server';

/**
 * @fileOverview Generates assessments and creates a Google Form.
 */

import {ai} from '@/ai/genkit';
import { FormQuestion } from '@/services/google-forms';
import { 
  GenerateAssessmentInputSchema,
  GenerateAssessmentOutputSchema,
  AssessmentQuestionsSchema,
  GenerateAssessmentInput,
  GenerateAssessmentOutput
} from '@/ai/schemas/assessment';


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
  async (input) => {
    try {
      // Step 1: Generate questions using the AI model
      const { output } = await assessmentPrompt(input);
      if (!output?.questions) {
        throw new Error("Failed to generate assessment questions.");
      }
      const generatedQuestions: FormQuestion[] = output.questions;
      
      const formTitle = `Assessment: ${input.subject} - ${input.topics_or_chapters}`;

      // Step 2: Create the Google Form
      const createFormResponse = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${input.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ info: { title: formTitle, documentTitle: formTitle } }),
      });

      if (!createFormResponse.ok) {
        const errorBody = await createFormResponse.text();
        console.error('Google Forms API error (createForm):', createFormResponse.status, errorBody);
        throw new Error(`Google Forms API error creating form: ${createFormResponse.statusText}. Ensure the Forms API is enabled.`);
      }
      const form = await createFormResponse.json();
      const formId = form.formId;

      // Step 3: Add the generated questions to the form
      if (generatedQuestions.length > 0) {
        const requests = generatedQuestions.map((question, index) => {
            const questionRequest: any = { createItem: { item: { title: question.title, questionItem: { question: { required: question.required ?? false } } }, location: { index: index } } };
            if (question.type === 'RADIO' || question.type === 'CHECKBOX') {
                questionRequest.createItem.item.questionItem.question.choiceQuestion = { type: question.type, options: (question.options || []).map((option: string) => ({ value: option })), shuffle: false };
            } else {
                questionRequest.createItem.item.questionItem.question.textQuestion = { paragraph: question.type === 'PARAGRAPH' };
            }
            return questionRequest;
        });

        const batchUpdateResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${input.accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests, includeFormInResponse: false }),
        });

        if (!batchUpdateResponse.ok) {
            const errorBody = await batchUpdateResponse.text();
            console.error('Google Forms API error (addQuestions):', batchUpdateResponse.status, errorBody);
            throw new Error(`Google Forms API error adding questions: ${batchUpdateResponse.statusText}.`);
        }
      }
      
      // Step 4: Get the form details (including the public URL)
      const getFormResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
        headers: { 'Authorization': `Bearer ${input.accessToken}` },
      });

      if (!getFormResponse.ok) {
        throw new Error(`Google Forms API error getting form details: ${getFormResponse.statusText}.`);
      }
      const finalForm = await getFormResponse.json();

      // Step 5: Return the URL and the raw questions
      return {
        formUrl: finalForm.responderUri,
        assessment: JSON.stringify(generatedQuestions, null, 2),
      };
    } catch (error: any) {
        console.error("Error in generateAssessmentFlow:", error);
        throw new Error(error.message || "An unexpected error occurred during assessment generation.");
    }
  }
);
