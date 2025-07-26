import {z} from 'genkit';

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
  title: z.string().describe("The question text."),
  type: z.enum(["RADIO", "CHECKBOX", "TEXT", "PARAGRAPH"]).describe("The type of question. RADIO for single-choice, CHECKBOX for multi-choice, TEXT for short answer, PARAGRAPH for long answer."),
  options: z.array(z.string()).optional().describe("A list of possible answers for choice questions."),
});

// Define the output schema for the AI prompt
export const AssessmentQuestionsSchema = z.object({
  questions: z.array(QuestionSchema).describe("An array of generated assessment questions."),
});

export const GenerateAssessmentOutputSchema = z.object({
  formUrl: z.string().describe("The URL of the created Google Form."),
  assessment: z.string().describe('The generated assessment questions as a JSON string.'),
});
export type GenerateAssessmentOutput = z.infer<typeof GenerateAssessmentOutputSchema>;
