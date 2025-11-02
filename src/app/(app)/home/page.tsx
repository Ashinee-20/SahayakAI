'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Stats } from './components/Stats';
import { RecentActivities } from './components/RecentActivities';
import { UpcomingClasses } from './components/UpcomingClasses';

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const userName = user?.displayName?.split(' ')[0] || 'Guest';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">{t('welcomeBack').replace('{userName}', userName)}</h1>
        <p className="text-muted-foreground">{t('dashboardGlance')}</p>
      </div>

      <Stats t={t} />

      <div className="grid gap-8 md:grid-cols-2">
        <UpcomingClasses t={t} />
        <RecentActivities t={t} />
      </div>
    </div>
  );
}
