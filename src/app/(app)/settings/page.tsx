'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: t('toast.success.profileUpdatedTitle'),
        description: t('toast.success.profileUpdatedDescription'),
    })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.title')}</CardTitle>
          <CardDescription>{t('settings.profile.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('settings.profile.name')}</Label>
                    <Input id="name" defaultValue={user?.displayName || ''} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">{t('settings.profile.email')}</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="school">{t('settings.profile.school')}</Label>
                    <Input id="school" placeholder={t('settings.profile.schoolPlaceholder')} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
                    <Input id="phone" type="tel" placeholder={t('settings.profile.phonePlaceholder')} />
                </div>
            </div>
             <div className="space-y-2">
                <Label>{t('settings.profile.subjectsAndGrades')}</Label>
                <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
                <div className="p-4 border rounded-md bg-muted/50 text-center">
                    {t('settings.profile.selectionPlaceholder')}
                </div>
            </div>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> {t('buttons.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>{t('settings.account.title')}</CardTitle>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> {t('logOut')}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">{t('settings.account.logOutDescription')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
