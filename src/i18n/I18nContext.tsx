import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';
import { SupportedLanguage } from '../types';

export interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (keyPath: string, fallback?: string, params?: Record<string, string | number>) => string;
}

const translations: Record<SupportedLanguage, any> = {
  es: esTranslations,
  en: enTranslations,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    // 1. Check saved in localStorage
    if (typeof localStorage !== 'undefined') {
      const saved =
        (localStorage.getItem('foodlink_language') as SupportedLanguage) ||
        (localStorage.getItem('foodlink_lang') as SupportedLanguage);
      if (saved && (saved === 'es' || saved === 'en')) {
        return saved;
      }
    }
    // 2. Auto-detect browser language
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
    }
    return 'es';
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('foodlink_language', lang);
      localStorage.setItem('foodlink_lang', lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'es' ? 'en' : 'es');
  }, [language, setLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (keyPath: string, fallback?: string, params?: Record<string, string | number>): string => {
      if (!keyPath) return fallback || '';

      const keys = keyPath.split('.');
      let current: any = translations[language] || translations.es;

      let found = true;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          found = false;
          break;
        }
      }

      // If not found in current language, try Spanish
      if (!found || typeof current !== 'string') {
        let fallbackVal: any = translations.es;
        let esFound = true;
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fk in fallbackVal) {
            fallbackVal = fallbackVal[fk];
          } else {
            esFound = false;
            break;
          }
        }
        if (esFound && typeof fallbackVal === 'string') {
          current = fallbackVal;
        } else {
          current = fallback || keyPath;
        }
      }

      let result = typeof current === 'string' ? current : fallback || keyPath;

      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, val]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }

      return result;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
