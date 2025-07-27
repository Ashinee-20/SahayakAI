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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  subject: z.string().min(1, 'Subject is required'),
  textbooks: z.string().min(1, 'Textbook is required'),
  numClasses: z.coerce.number().int().min(1, 'At least one class is required'),
  topicsOrChapters: z.string().min(3, 'Topics or chapters are required'),
});

interface LessonPlan {
  plan_title: string;
  classes: {
    class_number: number;
    topic: string;
    objective: string;
    activities: string[];
    assessment: string;
    resources: string[];
  }[];
}

const LessonPlanDisplay = ({ plan }: { plan: LessonPlan }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-headline font-bold text-center">{plan.plan_title}</h2>
      <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
        {plan.classes.map((classInfo, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-lg font-semibold">
              {t('createLessonPlan.results.class')} {classInfo.class_number}: {classInfo.topic}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-4 border-l-2 border-primary ml-2">
                <div>
                  <h4 className="font-semibold text-base">{t('createLessonPlan.results.objective')}</h4>
                  <p className="text-muted-foreground">{classInfo.objective}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base">{t('createLessonPlan.results.activities')}</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    {classInfo.activities.map((activity, i) => <li key={i}>{activity}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-base">{t('createLessonPlan.results.assessment')}</h4>
                  <p className="text-muted-foreground">{classInfo.assessment}</p>
                </div>
                 <div>
                  <h4 className="font-semibold text-base">{t('createLessonPlan.results.resources')}</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    {classInfo.resources.map((resource, i) => <li key={i}>{resource}</li>)}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};


export default function LessonPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

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
    
    if (!user) {
        toast({ variant: "destructive", title: t('toast.error.authError'), description: t('toast.error.mustBeSignedIn') });
        setIsLoading(false);
        return;
    }

    const input: GenerateLessonPlanInput = {
      ...values,
      textbooks: [values.textbooks],
    };

    try {
      const result = await generateLessonPlan(input);
      const parsedPlan = JSON.parse(result.lessonPlan);
      setLessonPlan(parsedPlan);
      toast({ title: t('toast.success.lessonPlanGeneratedTitle'), description: t('toast.success.lessonPlanGeneratedDescription')});
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({ variant: 'destructive', title: t('toast.error.genericTitle'), description: t('toast.error.lessonPlanGenerationFailed') });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">{t('createLessonPlan.title')}</h1>
        <p className="text-muted-foreground">{t('createLessonPlan.subtitle')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('createLessonPlan.card.title')}</CardTitle>
          <CardDescription>{t('createLessonPlan.card.description')}</CardDescription>
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
                      <FormLabel>{t('form.grade.label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.grade.placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={`${i + 1}`}>{t('form.grade.value', {grade: i + 1})}</SelectItem>
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
                      <FormLabel>{t('form.subject.label')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.subject.placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Maths">{t('subjects.maths')}</SelectItem>
                          <SelectItem value="Science">{t('subjects.science')}</SelectItem>
                          <SelectItem value="English">{t('subjects.english')}</SelectItem>
                          <SelectItem value="History">{t('subjects.history')}</SelectItem>
                           <SelectItem value="Geography">{t('subjects.geography')}</SelectItem>
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
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.textbook.placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NCERT Maths Grade 8">{t('form.textbook.mathsPlaceholder')}</SelectItem>
                           <SelectItem value="NCERT Science Grade 8">{t('form.textbook.sciencePlaceholder')}</SelectItem>
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
                      <FormLabel>{t('form.numClasses.label')}</FormLabel>
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
                    <FormLabel>{t('form.topics.label')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('form.topics.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('buttons.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('createLessonPlan.buttons.generate')}
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
                <CardTitle>{t('createLessonPlan.results.title')}</CardTitle>
                <CardDescription>{t('createLessonPlan.results.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
             <LessonPlanDisplay plan={lessonPlan} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
