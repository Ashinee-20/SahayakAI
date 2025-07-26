
'use client';

import { useState, useRef, useEffect } from 'react';
import { generateClassNotes } from '@/ai/flows/generate-class-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Download, Share2, Mic, StopCircle, Clipboard, ClipboardCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function ClassNotesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [notes, setNotes] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
      setAudioBlob(null);
      setNotes(null);
      setTranscript(null);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      const mediaRecorder = new MediaRecorder(stream); // Let the browser choose the mimeType
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType }); // Use the actual mimeType
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        toast({ title: 'Recording stopped', description: 'You can now generate notes from the audio.' });
      };

      mediaRecorder.start();

    } catch (err) {
      console.error('Error accessing microphone:', err);
      let errorMessage = 'An unknown error occurred.';
      if (err instanceof Error) {
          errorMessage = err.message;
      }
      toast({ variant: 'destructive', title: 'Microphone access denied', description: errorMessage });
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
  
  const blobToDataUri = (blob: Blob) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert blob to data URI"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  }

  const handleGenerateNotes = async () => {
    setIsLoading(true);
    setNotes(null);
    setTranscript(null);

    if (!audioBlob) {
        toast({ variant: 'destructive', title: 'No Audio Recorded', description: 'Please record your class audio first.' });
        setIsLoading(false);
        return;
    }

    try {
      const audioDataUri = await blobToDataUri(audioBlob);
      const result = await generateClassNotes({ audioDataUri });

      setNotes(result.notes);
      
    } catch (error) {
      console.error('Error generating notes:', error);
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({ 
        variant: 'destructive', 
        title: 'Failed to generate notes.',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (notes) {
      navigator.clipboard.writeText(notes);
      setIsCopied(true);
      toast({ title: "Copied to clipboard!"});
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">Generate Class Notes</h1>
        <p className="text-muted-foreground">Record your class audio to get it transcribed and summarized into structured notes automatically.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Audio Recorder</CardTitle>
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
      
      <div className="flex justify-center">
         <Button onClick={handleGenerateNotes} disabled={isLoading || !audioBlob} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200 text-lg py-6 px-8">
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Notes...</> : <><Sparkles className="mr-2 h-5 w-5" />2. Generate Notes</>}
          </Button>
      </div>

      {notes && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>3. Generated Class Notes</CardTitle>
                <CardDescription>Review the generated notes below.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {isCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none bg-muted p-4 rounded-lg whitespace-pre-wrap">
               <div dangerouslySetInnerHTML={{ __html: notes.replace(/\n/g, '<br />') }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
