
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Locale, TranslationKey } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    // Get saved locale from localStorage or use browser language or default to 'en'
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && ['en', 'pt', 'es'].includes(savedLocale)) {
      return savedLocale;
    }
    
    const browserLang = navigator.language.split('-')[0];
    if (['en', 'pt', 'es'].includes(browserLang)) {
      return browserLang as Locale;
    }
    
    return 'en';
  });

  useEffect(() => {
    // Save locale to localStorage when it changes
    localStorage.setItem('locale', locale);
    
    // Update html lang attribute
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
