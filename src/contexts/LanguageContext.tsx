
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Available languages
export type Language = 'english' | 'hindi' | 'punjabi';

// Translation key structure
type Translations = {
  [key: string]: {
    english: string;
    hindi: string;
    punjabi: string;
  };
};

// Translation data
const translations: Translations = {
  // Navigation
  'nav.home': {
    english: 'Home',
    hindi: 'होम',
    punjabi: 'ਹੋਮ',
  },
  'nav.products': {
    english: 'Products',
    hindi: 'उत्पाद',
    punjabi: 'ਉਤਪਾਦ',
  },
  'nav.about': {
    english: 'About',
    hindi: 'हमारे बारे में',
    punjabi: 'ਸਾਡੇ ਬਾਰੇ',
  },
  'nav.contact': {
    english: 'Contact',
    hindi: 'संपर्क',
    punjabi: 'ਸੰਪਰਕ',
  },
  'nav.login': {
    english: 'Login',
    hindi: 'लॉगिन',
    punjabi: 'ਲਾਗਇਨ',
  },
  'nav.register': {
    english: 'Register',
    hindi: 'रजिस्टर',
    punjabi: 'ਰਜਿਸਟਰ',
  },
  // Hero Section
  'hero.title': {
    english: 'Empowering Farmers, Enriching Communities',
    hindi: 'किसानों को सशक्त बनाना, समुदायों को समृद्ध बनाना',
    punjabi: 'ਕਿਸਾਨਾਂ ਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣਾ, ਸਮੁਦਾਇਆਂ ਨੂੰ ਸਮਰਿਧ ਬਣਾਉਣਾ',
  },
  'hero.subtitle': {
    english: 'Connecting farmers, vendors, and consumers in a sustainable ecosystem',
    hindi: 'किसानों, विक्रेताओं और उपभोक्ताओं को एक टिकाऊ पारिस्थितिकी तंत्र में जोड़ना',
    punjabi: 'ਕਿਸਾਨਾਂ, ਵਿਕਰੇਤਾਵਾਂ ਅਤੇ ਉਪਭੋਗਤਾਵਾਂ ਨੂੰ ਇੱਕ ਟਿਕਾਊ ਪਾਰਿਸਥਿਤੀ ਤੰਤਰ ਵਿੱਚ ਜੋੜਨਾ',
  },
  // User Roles
  'roles.title': {
    english: 'Join Our Agricultural Ecosystem',
    hindi: 'हमारे कृषि पारिस्थितिकी तंत्र में शामिल हों',
    punjabi: 'ਸਾਡੇ ਖੇਤੀਬਾੜੀ ਪਾਰਿਸਥਿਤੀ ਤੰਤਰ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
  },
  'roles.farmer': {
    english: 'Farmer',
    hindi: 'किसान',
    punjabi: 'ਕਿਸਾਨ',
  },
  'roles.vendor': {
    english: 'Vendor',
    hindi: 'विक्रेता',
    punjabi: 'ਵਿਕਰੇਤਾ',
  },
  'roles.consumer': {
    english: 'Consumer',
    hindi: 'उपभोक्ता',
    punjabi: 'ਉਪਭੋਗਤਾ',
  },
  // Common
  'language': {
    english: 'Language',
    hindi: 'भाषा',
    punjabi: 'ਭਾਸ਼ਾ',
  },
  'english': {
    english: 'English',
    hindi: 'अंग्रेज़ी',
    punjabi: 'ਅੰਗਰੇਜ਼ੀ',
  },
  'hindi': {
    english: 'Hindi',
    hindi: 'हिंदी',
    punjabi: 'ਹਿੰਦੀ',
  },
  'punjabi': {
    english: 'Punjabi',
    hindi: 'पंजाबी',
    punjabi: 'ਪੰਜਾਬੀ',
  },
  'select.language': {
    english: 'Select Language',
    hindi: 'भाषा चुनें',
    punjabi: 'ਭਾਸ਼ਾ ਚੁਣੋ',
  },
};

// Context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType>({
  language: 'english',
  setLanguage: () => {},
  t: () => '',
});

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('english');

  // Load saved language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['english', 'hindi', 'punjabi'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Update HTML lang attribute
    document.documentElement.lang = language === 'english' ? 'en' : language === 'hindi' ? 'hi' : 'pa';
    
    // Update direction attribute if needed (all these languages are LTR so not changing)
    document.documentElement.dir = 'ltr';
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    // Check if the key exists
    if (translations[key]) {
      return translations[key][language];
    }
    
    // Fallback to the key if translation is not found
    console.warn(`Translation not found for key: ${key}`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => useContext(LanguageContext);
