'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateAssessment, GenerateAssessmentInput } from '@/ai/flows/generate-assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download, Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  subject: z.string().min(1, 'Subject is required'),
  textbooks: z.string().min(1, 'Textbook is required'),
  assessment_type: z.enum(['Quiz', 'Descriptive', 'Fill in the Blanks', 'Mixed']),
  topics_or_chapters: z.string().min(3, 'Topics or chapters are required'),
  
  // Quiz
  quiz_num_questions: z.coerce.number().optional(),
  quiz_difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  quiz_type: z.enum(['Single Correct', 'Multi Correct', 'Both']).optional(),
  quiz_num_options: z.coerce.number().optional(),

  // Descriptive
  desc_num_questions: z.coerce.number().optional(),
  desc_difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  desc_type: z.enum(['Short Answer', 'Long Answer', 'Both']).optional(),
});

export default function AssessmentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: '',
      subject: '',
      textbooks: '',
      assessment_type: 'Quiz',
      topics_or_chapters: '',
    },
  });

  const assessmentType = form.watch('assessment_type');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAssessmentResult(null);

    const input: GenerateAssessmentInput = {
      grade: values.grade,
      subject: values.subject,
      textbooks: [values.textbooks],
      assessment_type: values.assessment_type,
      topics_or_chapters: values.topics_or_chapters,
    };

    if (values.assessment_type === 'Quiz' && values.quiz_num_questions && values.quiz_difficulty && values.quiz_type && values.quiz_num_options) {
      input.objective_config = {
        num_questions: values.quiz_num_questions,
        difficulty_level: values.quiz_difficulty,
        type: values.quiz_type,
        num_options: values.quiz_num_options,
      };
    } else if (values.assessment_type === 'Descriptive' && values.desc_num_questions && values.desc_difficulty && values.desc_type) {
        input.subjective_config = {
            num_questions: values.desc_num_questions,
            difficulty_level: values.desc_difficulty,
            type: values.desc_type
        }
    }
    // TODO: Add configs for other types

    try {
      const result = await generateAssessment(input);
      setAssessmentResult(result.assessment);

      toast({
        title: "Assessment Generated!",
        description: "Your assessment questions are ready below.",
      });

    } catch (error) {
      console.error('Error generating assessment:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">Generate Assessment</h1>
        <p className="text-muted-foreground">Fill in the details to create a new assessment with AI.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>Provide the necessary information for the assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a grade" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{Array.from({ length: 12 }, (_, i) => (<SelectItem key={i + 1} value={`${i + 1}`}>Grade {i + 1}</SelectItem>))}</SelectContent>
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
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Maths">Maths</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
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
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a textbook" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="NCERT">NCERT (Placeholder)</SelectItem></SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="assessment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Quiz">Quiz</SelectItem>
                          <SelectItem value="Descriptive">Descriptive</SelectItem>
                          <SelectItem value="Fill in the Blanks">Fill in the Blanks</SelectItem>
                           <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Fields */}
              {assessmentType === 'Quiz' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 border rounded-lg bg-muted/50">
                   <FormField control={form.control} name="quiz_num_questions" render={({ field }) => (<FormItem><FormLabel># Questions</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl></FormItem>)} />
                   <FormField control={form.control} name="quiz_num_options" render={({ field }) => (<FormItem><FormLabel># Options</FormLabel><FormControl><Input type="number" placeholder="4" {...field} /></FormControl></FormItem>)} />
                   <FormField control={form.control} name="quiz_difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulty</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select></FormItem>)} />
                   <FormField control={form.control} name="quiz_type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single Correct">Single Correct</SelectItem><SelectItem value="Multi Correct">Multi Correct</SelectItem><SelectItem value="Both">Both</SelectItem></SelectContent></Select></FormItem>)} />
                </div>
              )}
               {assessmentType === 'Descriptive' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-muted/50">
                   <FormField control={form.control} name="desc_num_questions" render={({ field }) => (<FormItem><FormLabel># Questions</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl></FormItem>)} />
                   <FormField control={form.control} name="desc_difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulty</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select></FormItem>)} />
                   <FormField control={form.control} name="desc_type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Short Answer">Short Answer</SelectItem><SelectItem value="Long Answer">Long Answer</SelectItem><SelectItem value="Both">Both</SelectItem></SelectContent></Select></FormItem>)} />
                </div>
              )}

              <FormField
                control={form.control}
                name="topics_or_chapters"
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
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Assessment</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {assessmentResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Assessment</CardTitle>
                <CardDescription>Review the generated questions below.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{assessmentResult}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
