'use client';

import { useLanguage } from '@/context/language-context';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const handleToggle = (checked: boolean) => {
    setLanguage(checked ? 'hi' : 'en');
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="language-toggle">EN</Label>
      <Switch
        id="language-toggle"
        checked={language === 'hi'}
        onCheckedChange={handleToggle}
        aria-label="Toggle language"
      />
      <Label htmlFor="language-toggle">HI</Label>
    </div>
  );
}
