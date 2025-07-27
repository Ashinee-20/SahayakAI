'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateAssessment } from '@/ai/flows/generate-assessment';
import { GenerateAssessmentInput } from '@/ai/schemas/assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download, Share2, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';

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

type FormData = z.infer<typeof formSchema>;

export default function AssessmentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const auth = getAuth(app);
  const { t } = useTranslation();

  const form = useForm<FormData>({
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

  // Effect to handle the redirect result from Google
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setIsLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            // Retrieve pending form data from sessionStorage
            const pendingData = sessionStorage.getItem('pendingAssessmentData');
            if (pendingData) {
              sessionStorage.removeItem('pendingAssessmentData'); // Clean up
              const values: FormData = JSON.parse(pendingData);
              // Now run the generation logic with the token
              await runAssessmentGeneration(values, credential.accessToken);
            }
          } else {
             toast({ variant: "destructive", title: t('toast.error.authError'), description: t('toast.error.googleCredentials') });
          }
        }
      } catch (error) {
        console.error('Error getting redirect result:', error);
        toast({ variant: "destructive", title: t('toast.error.authFailed'), description: t('toast.error.signInProcess') });
      } finally {
        setIsLoading(false);
      }
    };
    handleRedirect();
  }, [auth]);


  async function runAssessmentGeneration(values: FormData, accessToken: string) {
    if (!user) return; // Should not happen if we have an access token

    setIsLoading(true);
    setAssessmentResult(null);
    setFormUrl(null);
    
    try {
      const input: GenerateAssessmentInput = {
        grade: values.grade,
        subject: values.subject,
        textbooks: [values.textbooks],
        assessment_type: values.assessment_type,
        topics_or_chapters: values.topics_or_chapters,
        accessToken: accessToken,
      };

      if (values.assessment_type === 'Quiz' || values.assessment_type === 'Mixed') {
        input.objective_config = {
          num_questions: values.quiz_num_questions || (values.assessment_type === 'Mixed' ? 5 : 10),
          difficulty_level: values.quiz_difficulty || 'Medium',
          type: values.quiz_type || 'Single Correct',
          num_options: values.quiz_num_options || 4,
        };
      } 
      if (values.assessment_type === 'Descriptive' || values.assessment_type === 'Mixed') {
          input.subjective_config = {
              num_questions: values.desc_num_questions || (values.assessment_type === 'Mixed' ? 5 : 5),
              difficulty_level: values.desc_difficulty || 'Medium',
              type: values.desc_type || 'Short Answer'
          }
      }
    
      const assessmentData = await generateAssessment(input);
      setAssessmentResult(assessmentData.assessment);
      setFormUrl(assessmentData.formUrl);

      toast({
        title: t('toast.success.assessmentCreatedTitle'),
        description: t('toast.success.assessmentCreatedDescription'),
        action: (
            <Button asChild variant="outline">
                <Link href={assessmentData.formUrl} target="_blank" rel="noopener noreferrer">
                    {t('createAssessment.buttons.openForm')} <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        )
      });

    } catch (error) {
      console.error('Error generating assessment:', error);
      toast({
        variant: "destructive",
        title: t('toast.error.genericTitle'),
        description: (error as Error).message || t('toast.error.assessmentRequest'),
      })
    } finally {
      setIsLoading(false);
    }
  }


  async function onSubmit(values: FormData) {
    if (!user) {
        toast({ variant: "destructive", title: t('toast.error.authError'), description: t('toast.error.mustBeSignedIn') });
        return;
    }
    
    // Save form data to sessionStorage to retrieve after redirect
    sessionStorage.setItem('pendingAssessmentData', JSON.stringify(values));

    // Start the redirect flow to get permissions
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/forms.body');
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');
    await signInWithRedirect(auth, provider);
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">{t('createAssessment.title')}</h1>
        <p className="text-muted-foreground">{t('createAssessment.subtitle')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('createAssessment.card.title')}</CardTitle>
          <CardDescription>{t('createAssessment.card.description')}</CardDescription>
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
                      <FormLabel>{t('form.grade.label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('form.grade.placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{Array.from({ length: 12 }, (_, i) => (<SelectItem key={i + 1} value={`${i + 1}`}>{t('form.grade.value', {grade: i+1})}</SelectItem>))}</SelectContent>
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
                      <FormLabel>{t('form.subject.label')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('form.subject.placeholder')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Maths">{t('subjects.maths')}</SelectItem>
                          <SelectItem value="Science">{t('subjects.science')}</SelectItem>
                          <SelectItem value="English">{t('subjects.english')}</SelectItem>
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
                      <FormLabel>{t('form.textbook.label')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('form.textbook.placeholder')} /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="NCERT">{t('form.textbook.value')}</SelectItem></SelectContent>
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
                      <FormLabel>{t('form.assessmentType.label')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('form.assessmentType.placeholder')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Quiz">{t('form.assessmentType.quiz')}</SelectItem>
                          <SelectItem value="Descriptive">{t('form.assessmentType.descriptive')}</SelectItem>
                          <SelectItem value="Mixed">{t('form.assessmentType.mixed')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Fields */}
              {(assessmentType === 'Quiz' || assessmentType === 'Mixed') && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                  <h3 className="font-semibold">{t('createAssessment.quizSettings.title')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <FormField control={form.control} name="quiz_num_questions" render={({ field }) => (<FormItem><FormLabel>{t('form.numQuestions')}</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl></FormItem>)} />
                     <FormField control={form.control} name="quiz_num_options" render={({ field }) => (<FormItem><FormLabel>{t('form.numOptions')}</FormLabel><FormControl><Input type="number" placeholder="4" {...field} /></FormControl></FormItem>)} />
                     <FormField control={form.control} name="quiz_difficulty" render={({ field }) => (<FormItem><FormLabel>{t('form.difficulty.label')}</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder={t('form.difficulty.placeholder')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Easy">{t('form.difficulty.easy')}</SelectItem><SelectItem value="Medium">{t('form.difficulty.medium')}</SelectItem><SelectItem value="Hard">{t('form.difficulty.hard')}</SelectItem></SelectContent></Select></FormItem>)} />
                     <FormField control={form.control} name="quiz_type" render={({ field }) => (<FormItem><FormLabel>{t('form.type')}</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder={t('form.difficulty.placeholder')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single Correct">{t('form.quizType.single')}</SelectItem><SelectItem value="Multi Correct">{t('form.quizType.multi')}</SelectItem><SelectItem value="Both">{t('form.quizType.both')}</SelectItem></SelectContent></Select></FormItem>)} />
                  </div>
                </div>
              )}
               {(assessmentType === 'Descriptive' || assessmentType === 'Mixed') && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                  <h3 className="font-semibold">{t('createAssessment.descriptiveSettings.title')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FormField control={form.control} name="desc_num_questions" render={({ field }) => (<FormItem><FormLabel>{t('form.numQuestions')}</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl></FormItem>)} />
                     <FormField control={form.control} name="desc_difficulty" render={({ field }) => (<FormItem><FormLabel>{t('form.difficulty.label')}</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder={t('form.difficulty.placeholder')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Easy">{t('form.difficulty.easy')}</SelectItem><SelectItem value="Medium">{t('form.difficulty.medium')}</SelectItem><SelectItem value="Hard">{t('form.difficulty.hard')}</SelectItem></SelectContent></Select></FormItem>)} />
                     <FormField control={form.control} name="desc_type" render={({ field }) => (<FormItem><FormLabel>{t('form.type')}</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder={t('form.difficulty.placeholder')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Short Answer">{t('form.descType.short')}</SelectItem><SelectItem value="Long Answer">{t('form.descType.long')}</SelectItem><SelectItem value="Both">{t('form.descType.both')}</SelectItem></SelectContent></Select></FormItem>)} />
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="topics_or_chapters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.topics.label')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('form.topics.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('buttons.processing')}</> : <><Sparkles className="mr-2 h-4 w-4" />{t('createAssessment.buttons.generate')}</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {formUrl && (
         <Card>
            <CardHeader>
                <CardTitle>{t('createAssessment.results.formCreatedTitle')}</CardTitle>
                <CardDescription>{t('createAssessment.results.formCreatedDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild>
                    <Link href={formUrl} target="_blank" rel="noopener noreferrer">
                       {t('createAssessment.buttons.openForm')} <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
         </Card>
      )}

      {assessmentResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>{t('createAssessment.results.questionsTitle')}</CardTitle>
                <CardDescription>{t('createAssessment.results.questionsDescription')}</CardDescription>
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
