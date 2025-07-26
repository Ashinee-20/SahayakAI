'use server';

/**
 * @fileOverview Generates class notes from audio transcript using ElevenLabs and Gemini.
 *
 * - generateClassNotes - A function that takes audio data, transcribes it, and generates structured class notes.
 * - GenerateClassNotesInput - The input type for the generateClassNotes function.
 * - GenerateClassNotesOutput - The return type for the generateClassNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClassNotesInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'Audio recording of the class as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type GenerateClassNotesInput = z.infer<typeof GenerateClassNotesInputSchema>;

const GenerateClassNotesOutputSchema = z.object({
  notes: z.string().describe('Structured class notes generated from the audio transcript.'),
});

export type GenerateClassNotesOutput = z.infer<typeof GenerateClassNotesOutputSchema>;

export async function generateClassNotes(input: GenerateClassNotesInput): Promise<GenerateClassNotesOutput> {
  return generateClassNotesFlow(input);
}

const generateClassNotesPrompt = ai.definePrompt({
  name: 'generateClassNotesPrompt',
  input: {schema: z.object({transcript: z.string()})},
  output: {schema: GenerateClassNotesOutputSchema},
  prompt: `You are an AI assistant designed to generate structured class notes from a given transcript. 

  Transcript: {{{transcript}}}

  Generate well-structured and concise class notes summarizing the key concepts discussed in the transcript.
  The notes should be in markdown format.
  `,
});

async function transcribeAudioWithElevenLabs(audioDataUri: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ElevenLabs API key not found.");
  }
  
  // Extract content type and base64 data from data URI
  const parts = audioDataUri.match(/^data:(audio\/.*?);base64,(.*)$/);
  if (!parts) {
      throw new Error("Invalid audio data URI format.");
  }
  const mimeType = parts[1];
  const base64Data = parts[2];

  // Convert base64 to a Buffer
  const audioBuffer = Buffer.from(base64Data, 'base64');
  
  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': mimeType
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('ElevenLabs API Error:', errorBody);
    throw new Error(`Failed to transcribe audio: ${response.statusText}`);
  }

  const result = await response.json();
  return result.text;
}


const generateClassNotesFlow = ai.defineFlow(
  {
    name: 'generateClassNotesFlow',
    inputSchema: GenerateClassNotesInputSchema,
    outputSchema: GenerateClassNotesOutputSchema,
  },
  async input => {
    // Step 1: Transcribe the audio using ElevenLabs
    const transcript = await transcribeAudioWithElevenLabs(input.audioDataUri);

    if (!transcript) {
        throw new Error("Transcription failed or returned empty.");
    }

    // Step 2: Generate notes from the transcript
    const {output} = await generateClassNotesPrompt({transcript});
    return output!;
  }
);
