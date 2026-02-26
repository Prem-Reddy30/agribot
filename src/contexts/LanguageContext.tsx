import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, languages } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  availableLanguages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('krishisahay-language') as Language;
    return savedLanguage && languages.some(lang => lang.code === savedLanguage) 
      ? savedLanguage 
      : 'en';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('krishisahay-language', newLanguage);
    
    // Update document language attribute for accessibility
    document.documentElement.lang = newLanguage;
    
    // Update document direction for RTL languages (if needed in future)
    document.documentElement.dir = 'ltr';
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  useEffect(() => {
    // Set initial language on document
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages: languages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
