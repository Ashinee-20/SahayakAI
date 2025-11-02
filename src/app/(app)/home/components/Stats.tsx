'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Sparkles } from 'lucide-react';

const stats = [
  { titleKey: 'lessonPlansCreated', value: '12', icon: BookOpen },
  { titleKey: 'assessmentsGenerated', value: '8', icon: FileText },
  { titleKey: 'storiesCrafted', value: '5', icon: Sparkles },
];

export const Stats = ({ t }: { t: (key: string) => string }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.titleKey}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t(stat.titleKey)}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{t('sinceLastWeek').replace('{count}', '2')}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
