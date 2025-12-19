
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLocalization();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 text-sm font-medium text-med-sky transition-colors hover:text-med-blue"
    >
      {language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
};

export default LanguageSwitcher;
