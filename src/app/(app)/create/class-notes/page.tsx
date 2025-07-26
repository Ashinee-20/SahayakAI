'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateClassNotes, GenerateClassNotesOutput } from '@/ai/flows/generate-class-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, StopCircle, Share2, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/use-auth';

// The Recorder UI component
const Recorder: React.FC<{
  isRecording: boolean;
  isProcessing: boolean;
  onToggleRecording: () => void;
  permissionError: string | null;
}> = ({ isRecording, isProcessing, onToggleRecording, permissionError }) => {
  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <Button
        onClick={onToggleRecording}
        disabled={isProcessing}
        size="lg"
        className={`
          flex items-center justify-center space-x-4 text-lg py-6 px-8 rounded-full text-white
          transition-all duration-300 ease-in-out transform hover:scale-105
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          ${isRecording
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-400'
            : 'bg-gradient-to-r from-primary to-accent hover:scale-105'
          }
        `}
      >
        {isRecording ? (
          <>
            <StopCircle className="w-8 h-8" />
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <Mic className="w-8 h-8" />
            <span>Start Recording</span>
          </>
        )}
      </Button>
      {permissionError && <p className="text-red-500 mt-2 text-sm">{permissionError}</p>}
    </div>
  );
};


// The main page component
export default function ClassNotesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState<GenerateClassNotesOutput | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    toast({ title: 'Recording stopped', description: 'You can now generate notes from the audio.' });
  };

  const startRecording = useCallback(async () => {
    setPermissionError(null);
    setNotes(null);
    setAudioBlob(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.addEventListener("dataavailable", event => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorderRef.current.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          handleRecordingComplete(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        });

        mediaRecorderRef.current.start();
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setPermissionError("Microphone access was denied. Please enable it in your browser settings and refresh the page.");
        setIsRecording(false);
      }
    } else {
      setPermissionError("Audio recording is not supported by your browser.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const blobToDataUri = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
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
    if (!audioBlob) {
      toast({ variant: 'destructive', title: 'No audio recorded', description: 'Please record your class audio first.' });
      return;
    }
     if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be signed in to generate content." });
        return;
    }
    
    setIsProcessing(true);
    setNotes(null);

    try {
      const audioDataUri = await blobToDataUri(audioBlob);
      const result = await generateClassNotes({ audioDataUri, userId: user.uid });
      setNotes(result);
      toast({ title: "Notes generated successfully!", description: "Your structured notes have been saved to My Space."});
    } catch (error) {
      console.error("Error generating notes:", error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to generate notes.',
        description: error instanceof Error ? error.message : "An unknown error occurred."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">Generate Class Notes</h1>
        <p className="text-muted-foreground">Record your class audio to get it summarized into structured notes automatically.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Audio Recorder</CardTitle>
          <CardDescription>
            {isRecording ? 'Click stop when your class is finished.' : 'Click start to begin recording your class.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Recorder
            isRecording={isRecording}
            isProcessing={isProcessing}
            onToggleRecording={handleToggleRecording}
            permissionError={permissionError}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
         <Button onClick={handleGenerateNotes} disabled={isProcessing || !audioBlob} size="lg">
            {isProcessing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing Audio...</> : <>2. Generate Notes from Audio</>}
          </Button>
      </div>

      {isProcessing && (
        <div className="text-center text-muted-foreground">
            <p>Processing your audio... this may take a moment.</p>
        </div>
      )}

      {notes && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>3. Generated Class Notes</CardTitle>
                <CardDescription>Review the generated notes below.</CardDescription>
            </div>
             <div className="flex gap-2">
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <h2 className="text-2xl font-headline font-bold">{notes.title}</h2>
                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                  {notes.topics.map((topic, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg font-semibold">{topic.heading}</AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc pl-6 space-y-2">
                                {topic.points.map((point, pIndex) => (
                                    <li key={pIndex}>{point}</li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
