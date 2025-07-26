'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateClassNotes } from '@/ai/flows/generate-class-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download, Share2, Mic, StopCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  transcript: z.string().min(10, 'Transcript is too short.'),
});

export default function ClassNotesPage() {
  const [isLoading, setIsLoading] =useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [notes, setNotes] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transcript: 'This is a mock transcript. In a real implementation, this would be populated by the audio-to-text service. Today we discussed the importance of photosynthesis. Photosynthesis is how plants convert light energy into chemical energy. Key concepts include chlorophyll, sunlight, water, and carbon dioxide. Remember the formula: 6CO2 + 6H2O + Light → C6H12O6 + 6O2.',
    },
  });

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        // This is where you would send the blob to ElevenLabs/your backend
        // For now, we'll just enable the form
        toast({ title: 'Recording stopped', description: 'Transcript is ready for generation.' });
      };
      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({ variant: 'destructive', title: 'Microphone access denied', description: 'Please allow microphone access to record audio.' });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setNotes(null);

    if (!audioBlob && !values.transcript) {
        toast({ variant: 'destructive', title: 'No audio or transcript', description: 'Please record audio or provide a transcript.' });
        setIsLoading(false);
        return;
    }

    try {
      // In a real implementation, you would convert the audioBlob to a data URI
      // const audioDataUri = await blobToDataUri(audioBlob);
      // const result = await generateClassNotes({ audioDataUri });
      
      // For now, we use the mock transcript
      const result = await generateClassNotes({ audioDataUri: 'mock' });

      setNotes(result.notes);
    } catch (error) {
      console.error('Error generating notes:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate notes.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">Generate Class Notes</h1>
        <p className="text-muted-foreground">Record your class audio to generate structured notes automatically.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audio Recorder</CardTitle>
          <CardDescription>
            {isRecording ? 'Click stop when your class is finished.' : 'Click start to begin recording your class.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="text-5xl font-mono font-bold text-primary">{formatTime(recordingTime)}</div>
          {!isRecording ? (
            <Button onClick={handleStartRecording} size="lg" className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105 transition-transform duration-200">
              <Mic className="mr-2 h-5 w-5" /> Start Recording
            </Button>
          ) : (
            <Button onClick={handleStopRecording} size="lg" variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:scale-105 transition-transform duration-200">
              <StopCircle className="mr-2 h-5 w-5" /> Stop Recording
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate from Transcript</CardTitle>
          <CardDescription>
            Once recording is complete, the transcript will appear here. You can edit it before generating notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                control={form.control}
                name="transcript"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Your class transcript will appear here..." {...field} rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Notes...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Notes</>}
              </Button>
            </form>
           </Form>
        </CardContent>
      </Card>

      {notes && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Class Notes</CardTitle>
                <CardDescription>Review the generated notes below.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none bg-muted p-4 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: notes.replace(/\n/g, '<br />') }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
