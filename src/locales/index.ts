import i18n from 'i18next';
import LangDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './en.json';

export const resources = {
    en: {
        translation: en,
    },
} as const;

i18n.use(LangDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    resources,
    nonExplicitSupportedLngs: true,
});

export default i18n;
