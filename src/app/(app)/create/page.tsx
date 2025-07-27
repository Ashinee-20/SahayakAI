'use client';

import CreateToolCard from '@/components/create-tool-card';
import {
  BookOpenCheck,
  ClipboardCheck,
  AudioLines,
  ImageIcon,
  PenSquare,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function CreatePage() {
  const { t } = useTranslation();

  const tools = [
    {
      href: '/create/lesson-plan',
      title: t('create.tools.lessonPlan.title'),
      description: t('create.tools.lessonPlan.description'),
      icon: BookOpenCheck,
    },
    {
      href: '/create/assessment',
      title: t('create.tools.assessments.title'),
      description: t('create.tools.assessments.description'),
      icon: ClipboardCheck,
    },
    {
      href: '/create/class-notes',
      title: t('create.tools.classNotes.title'),
      description: t('create.tools.classNotes.description'),
      icon: AudioLines,
    },
    {
      href: '/create/story',
      title: t('create.tools.story.title'),
      description: t('create.tools.story.description'),
      icon: PenSquare,
    },
    {
      href: '/create/visual-aid',
      title: t('create.tools.visualAid.title'),
      description: t('create.tools.visualAid.description'),
      icon: ImageIcon,
      disabled: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">{t('create.title')}</h1>
        <p className="text-muted-foreground">
          {t('create.subtitle')}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <CreateToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
}
