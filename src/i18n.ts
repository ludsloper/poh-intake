import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import static JSON resources (no HTTP backend needed)
import nl from './locales/nl/common.json'
import en from './locales/en/common.json'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      nl: { common: nl },
      en: { common: en },
    },
    defaultNS: 'common',
    ns: ['common'],
    supportedLngs: ['nl', 'en'],
    fallbackLng: 'nl',
    detection: {
      // Use URL param first, then stored preference, then browser
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag', 'cookie'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    // We don't use suspense to keep UX simple in Vite SPA
    react: { useSuspense: false },
  })

export default i18n
