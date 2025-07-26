'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateLessonPlan, GenerateLessonPlanInput } from '@/ai/flows/generate-lesson-plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download, Share2 } from 'lucide-react';

const formSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  subject: z.string().min(1, 'Subject is required'),
  textbooks: z.string().min(1, 'Textbook is required'),
  numClasses: z.coerce.number().int().min(1, 'At least one class is required'),
  topicsOrChapters: z.string().min(3, 'Topics or chapters are required'),
});

export default function LessonPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: '',
      subject: '',
      textbooks: '',
      numClasses: 1,
      topicsOrChapters: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLessonPlan(null);

    const input: GenerateLessonPlanInput = {
      ...values,
      textbooks: [values.textbooks],
    };

    try {
      const result = await generateLessonPlan(input);
      const parsedPlan = JSON.parse(result.lessonPlan);
      setLessonPlan(JSON.stringify(parsedPlan, null, 2));
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      // You can use a toast to show the error to the user
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">Generate Lesson Plan</h1>
        <p className="text-muted-foreground">Fill in the details to create a new lesson plan with AI.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lesson Plan Details</CardTitle>
          <CardDescription>Provide the necessary information for the lesson plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={`${i + 1}`}>Grade {i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Maths">Maths</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                           <SelectItem value="Geography">Geography</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="textbooks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Textbook</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a textbook" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NCERT Maths Grade 8">NCERT Maths Grade 8 (Placeholder)</SelectItem>
                           <SelectItem value="NCERT Science Grade 8">NCERT Science Grade 8 (Placeholder)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="numClasses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Classes</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="topicsOrChapters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topics/Chapter Numbers</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Chapters 1-3, or topics like Photosynthesis, Algebra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Lesson Plan
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {lessonPlan && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Lesson Plan</CardTitle>
                <CardDescription>Review the generated plan below.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{lessonPlan}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
