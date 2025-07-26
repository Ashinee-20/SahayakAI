
'use server';

/**
 * @fileOverview Generates a textual guide for creating a visual aid, and then generates an image from that guide.
 *
 * - generateVisualAidGuide - A function that provides a detailed description of how to draw an illustration and an image based on it.
 * - GenerateVisualAidGuideInput - The input type for the function.
 * - GenerateVisualAidGuideOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualAidGuideInputSchema = z.object({
  topic: z.string().describe('The topic or chapter for which to make an illustration.'),
});

export type GenerateVisualAidGuideInput = z.infer<typeof GenerateVisualAidGuideInputSchema>;

const GenerateVisualAidGuideOutputSchema = z.object({
  guide: z.string().describe('A detailed guide on how the diagram should look. If it doesn\'t make sense to create an illustration, this will be "None".'),
  imageDataUri: z.string().optional().describe("The generated illustration as a data URI."),
});

export type GenerateVisualAidGuideOutput = z.infer<typeof GenerateVisualAidGuideOutputSchema>;

export async function generateVisualAidGuide(input: GenerateVisualAidGuideInput): Promise<GenerateVisualAidGuideOutput> {
  return generateVisualAidGuideFlow(input);
}

const generateVisualAidGuidePrompt = ai.definePrompt({
  name: 'generateVisualAidGuidePrompt',
  input: {schema: GenerateVisualAidGuideInputSchema},
  output: {schema: z.object({
    guide: z.string().describe('A detailed guide on how the diagram should look. If it doesn\'t make sense to create an illustration, this will be "None".'),
  })},
  prompt: `You are a guide for an artist who makes visual aids and illustrations for school students to understand topics. 
Your task is to provide an elaborate guide on how the diagram should look, including style, any text to be included, its position, etc. 
The guide should be so clear and detailed that a sketch artist or even a young student could understand and draw it.

You will be given an input topic. If it doesn't make sense to create an illustration for the topic, return "None" for the guide. Otherwise, return the detailed text guide.

Topic: {{{topic}}}
`,
});

const generateVisualAidGuideFlow = ai.defineFlow(
  {
    name: 'generateVisualAidGuideFlow',
    inputSchema: GenerateVisualAidGuideInputSchema,
    outputSchema: GenerateVisualAidGuideOutputSchema,
  },
  async input => {
    // Step 1: Generate the textual guide.
    const guideResponse = await generateVisualAidGuidePrompt(input);
    const guide = guideResponse.output?.guide;
    
    if (!guide) {
        throw new Error("Failed to generate a guide.");
    }

    if (guide.trim().toLowerCase() === 'none') {
        return { guide: "It doesn't seem appropriate to create a visual aid for this topic. Please try another topic." };
    }

    // Step 2: Generate an image from the guide.
    const imageResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: guide,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    const imageData = imageResponse.media;
    
    return {
      guide,
      imageDataUri: imageData?.url,
    };
  }
);
