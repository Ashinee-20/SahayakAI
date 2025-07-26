'use client';

import { useLanguage } from '@/context/language-context';

export const useTranslation = () => {
  const { translations } = useLanguage();

  const t = (key: string): string => {
    // Basic key navigation, e.g., "home.title"
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to the key itself if not found
        return key;
      }
    }
    return result || key;
  };

  return { t };
};
