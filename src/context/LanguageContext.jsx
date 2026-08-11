import { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import mr from '../i18n/mr.json';

const translations = { en, hi, mr };

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  // Nested key accessor: t('nav.dashboard')
  const t = useCallback((key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      if (val === undefined) return key;
      val = val[k];
    }
    return val ?? key;
  }, [lang]);

  // Format numbers per locale
  const formatNumber = useCallback((num) => {
    const locale = lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN';
    return new Intl.NumberFormat(locale).format(num);
  }, [lang]);

  // Format currency (INR)
  const formatCurrency = useCallback((amount) => {
    const locale = lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  }, [lang]);

  // Format date
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    const locale = lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN';
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, formatNumber, formatCurrency, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
