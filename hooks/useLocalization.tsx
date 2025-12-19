import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Language, LocalizedString, SiteConfig } from '../types';
import { api } from '../services/api';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (localizedString: LocalizedString) => string;
  dir: 'rtl' | 'ltr';
  config: SiteConfig | null;
  updateConfig: (newConfig: SiteConfig) => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('medpulse_language');
    return (savedLang === 'en' || savedLang === 'ar') ? savedLang : 'ar';
  });
  
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [dir, setDir] = useState<'rtl' | 'ltr'>(language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    // Load config on mount
    const loadConfig = async () => {
        const owner = localStorage.getItem('git_owner') || '';
        const repo = localStorage.getItem('git_repo') || '';
        const data = await api.getSiteConfig(owner, repo);
        if (data) {
            setConfig(data);
            applyFonts(data);
        }
    };
    loadConfig();
  }, []);

  const applyFonts = (data: SiteConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--font-en-body', data.fonts.en.body);
    root.style.setProperty('--font-en-headings', data.fonts.en.headings);
    root.style.setProperty('--font-ar-body', data.fonts.ar.body);
    root.style.setProperty('--font-ar-headings', data.fonts.ar.headings);
  };

  useEffect(() => {
    const newDir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = newDir;
    setDir(newDir);
    localStorage.setItem('medpulse_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const updateConfig = (newConfig: SiteConfig) => {
    setConfig(newConfig);
    applyFonts(newConfig);
  };
  
  const t = useCallback((localizedString: LocalizedString): string => {
    return localizedString[language] || localizedString['en'] || '';
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, dir, config, updateConfig }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};