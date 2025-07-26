'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateVisualAidGuide, GenerateVisualAidGuideInput } from '@/ai/flows/generate-visual-aid-guide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download, Share2 } from 'lucide-react';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic is required'),
});

export default function VisualAidPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGuide(null);

    try {
      const result = await generateVisualAidGuide(values);
      setGuide(result.guide);
    } catch (error) {
      console.error('Error generating visual aid guide:', error);
      // You can add a toast notification here to inform the user of the error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">Generate Visual Aid Guide</h1>
        <p className="text-muted-foreground">Describe a topic, and get a detailed guide on how to illustrate it for students.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Illustration Topic</CardTitle>
          <CardDescription>Provide the topic you want to create a visual aid for.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., The Water Cycle, The Human Heart, Photosynthesis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Guide...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Guide
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {guide && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Illustration Guide</CardTitle>
                <CardDescription>Use this guide to draw the visual aid.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
             <div className="prose dark:prose-invert max-w-none bg-muted p-4 rounded-lg whitespace-pre-wrap">
                <p>{guide}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
