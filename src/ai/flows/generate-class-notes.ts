'use server';

/**
 * @fileOverview Generates class notes from audio transcript using Gemini API.
 *
 * - generateClassNotes - A function that takes audio data and generates structured class notes.
 * - GenerateClassNotesInput - The input type for the generateClassNotes function.
 * - GenerateClassNotesOutput - The return type for the generateClassNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

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

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const audioToText = ai.defineFlow(
  {
    name: 'audioSimple',
    inputSchema: z.string(),
    outputSchema: z.any(),
  },
  async (query) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: query,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

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

const generateClassNotesFlow = ai.defineFlow(
  {
    name: 'generateClassNotesFlow',
    inputSchema: GenerateClassNotesInputSchema,
    outputSchema: GenerateClassNotesOutputSchema,
  },
  async input => {
    // Extract audio data from the data URI
    const audioData = input.audioDataUri.split(',')[1];

    // Mock ElevenLabs API transcription (replace with actual API call in real implementation)
    const transcript = `This is a mock transcript. Today we discussed the importance of photosynthesis. Photosynthesis is how plants convert light energy into chemical energy. Key concepts include chlorophyll, sunlight, water, and carbon dioxide. Remember the formula: 6CO2 + 6H2O + Light → C6H12O6 + 6O2.`;

    const {output} = await generateClassNotesPrompt({transcript});
    return output!;
  }
);
