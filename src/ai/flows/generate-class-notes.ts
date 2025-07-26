'use server';

/**
 * @fileOverview Generates structured class notes directly from an audio recording
 * using Gemini's multimodal and structured output capabilities.
 *
 * - generateClassNotes - A function that takes audio data and generates structured JSON notes.
 * - GenerateClassNotesInput - The input type for the generateClassNotes function.
 * - GenerateClassNotesOutput - The return type for the generateClassNotes function (the structured notes).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { saveContent } from '@/services/firebase-service';

// Define the schema for the input, which is just the audio data URI
const GenerateClassNotesInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio recording of the class as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userId: z.string().describe('The user ID for saving the content.'),
});
export type GenerateClassNotesInput = z.infer<typeof GenerateClassNotesInputSchema>;

// Define the structured output we expect from the AI model
const NotesSchema = z.object({
  title: z
    .string()
    .describe(
      'The main title of the lecture or lesson, summarizing the core subject.'
    ),
  topics: z
    .array(
      z.object({
        heading: z
          .string()
          .describe('The heading for a specific topic or sub-section.'),
        points: z
          .array(z.string())
          .describe(
            'A list of bullet points detailing the key information for this topic.'
          ),
      })
    )
    .describe('An array of the main topics discussed in the lecture.'),
});
export type GenerateClassNotesOutput = z.infer<typeof NotesSchema>;


// The main function the frontend will call
export async function generateClassNotes(
  input: GenerateClassNotesInput
): Promise<GenerateClassNotesOutput> {
  return generateClassNotesFlow(input);
}

// The Genkit flow that orchestrates the AI call
const generateClassNotesFlow = ai.defineFlow(
  {
    name: 'generateClassNotesFlow',
    inputSchema: GenerateClassNotesInputSchema,
    outputSchema: NotesSchema,
  },
  async ({audioDataUri, userId}) => {
    // The prompt instructing the model how to behave and what to do
    const prompt = `You are a world-class academic note-taking assistant. Your task is to analyze the provided classroom lecture audio and generate structured, comprehensive notes. Please focus exclusively on the primary speaker, who is the teacher or lecturer. Disregard any background noise, student questions, or side conversations. The output must be in a clear, organized format. Summarize the key concepts and present them with a main title for the lecture, followed by major topics as headings, and detailed bullet points under each heading.`;

    // Call the Gemini model with multimodal input (audio + text) and request structured output
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {media: {url: audioDataUri}},
        {text: prompt},
      ],
      config: {
        responseMimeType: 'application/json',
      },
      output: {
        schema: NotesSchema,
      },
    });
    
    if (!output) {
      throw new Error("The API returned an empty response. The audio might have been unclear.");
    }
    
    // Save to firestore
    await saveContent(userId, 'classNotes', output.title, output);

    return output;
  }
);
