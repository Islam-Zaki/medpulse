
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

// Map SiteConfig keys to Database Titles
const DATABASE_PAGE_MAP: Record<string, string> = {
    home: 'home',
    about: 'about us',
    founder: 'founder',
    contact: 'contact us',
    conferences: 'conferences',
    articles: 'articles',
    experts: 'experts'
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('medpulse_language');
    return (savedLang === 'en' || savedLang === 'ar') ? savedLang : 'ar';
  });
  
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [dir, setDir] = useState<'rtl' | 'ltr'>(language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    const loadConfig = async () => {
        // 1. Initial State: Load defaults from local JSON
        let fullConfig: SiteConfig;
        try {
            const localRes = await fetch('/siteconfig.json');
            fullConfig = await localRes.json();
        } catch (e) {
            console.error("Failed to load local siteconfig.json", e);
            return;
        }

        // 2. Override with Local Storage (Drafts)
        const savedConfig = localStorage.getItem('medpulse_site_config');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                fullConfig = { ...fullConfig, ...parsed };
            } catch (e) { console.error("Failed to parse local storage config", e); }
        }

        // 3. Fetch from Database and Sync
        try {
            const pageKeys = Object.keys(DATABASE_PAGE_MAP);
            await Promise.all(pageKeys.map(async (key) => {
                try {
                    const dbTitle = DATABASE_PAGE_MAP[key];
                    const res = await api.getStaticPage(dbTitle);
                    if (res && res.attributes) {
                        let attrs = res.attributes;
                        // Some DBs return JSON as a string
                        if (typeof attrs === 'string') {
                            try { attrs = JSON.parse(attrs); } catch(pe) { console.warn("Failed to parse stringified attributes", pe); }
                        }
                        // Merge attributes into the page config to preserve structure
                        if (typeof attrs === 'object' && attrs !== null) {
                            (fullConfig as any)[key] = { 
                                ...((fullConfig as any)[key] || {}), 
                                ...attrs 
                            };
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch ${key} from DB, using fallback.`);
                }
            }));

            setConfig(fullConfig);
            applyFonts(fullConfig);
        } catch (e) {
            console.error("Critical: Failed to load any configuration", e);
        }
    };
    loadConfig();
  }, []);

  const applyFonts = (data: SiteConfig) => {
    if (!data.fonts) return;
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
    localStorage.setItem('medpulse_site_config', JSON.stringify(newConfig));
  };
  
  const t = useCallback((localizedString: LocalizedString): string => {
    if (!localizedString) return '';
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
