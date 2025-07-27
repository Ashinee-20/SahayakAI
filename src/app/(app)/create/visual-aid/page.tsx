'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateVisualAidGuide, GenerateVisualAidGuideOutput } from '@/ai/flows/generate-visual-aid-guide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download, Share2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic is required'),
});

export default function VisualAidPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateVisualAidGuideOutput | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    if (!user) {
        toast({ variant: "destructive", title: t('toast.error.authError'), description: t('toast.error.mustBeSignedIn') });
        setIsLoading(false);
        return;
    }

    try {
      const result = await generateVisualAidGuide({ ...values });
      setResult(result);
      toast({ title: t('toast.success.visualAidGeneratedTitle'), description: t('toast.success.visualAidGeneratedDescription')});
    } catch (error) {
      console.error('Error generating visual aid guide:', error);
      toast({ variant: 'destructive', title: t('toast.error.genericTitle'), description: t('toast.error.visualAidGenerationFailed') });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">{t('createVisualAid.title')}</h1>
        <p className="text-muted-foreground">{t('createVisualAid.subtitle')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('createVisualAid.card.title')}</CardTitle>
          <CardDescription>{t('createVisualAid.card.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.topic.label')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('form.topic.placeholderVisualAid')} {...field} />
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
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {t('createVisualAid.buttons.generate')}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result?.imageDataUri && (
        <Card>
            <CardHeader>
                <CardTitle>{t('createVisualAid.results.imageTitle')}</CardTitle>
                <CardDescription>{t('createVisualAid.results.imageDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <Image src={result.imageDataUri} alt="Generated visual aid" fill className="object-cover" />
                </div>
            </CardContent>
        </Card>
      )}

      {result?.guide && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>{t('createVisualAid.results.guideTitle')}</CardTitle>
                <CardDescription>{t('createVisualAid.results.guideDescription')}</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
             <div className="prose dark:prose-invert max-w-none bg-muted p-4 rounded-lg whitespace-pre-wrap">
                <p>{result.guide}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
