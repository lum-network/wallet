import i18n from 'i18next';
import LangDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import fr from './fr.json';

export const resources = {
    en: {
        translation: en,
    },
    fr: {
        translation: fr,
    },
} as const;

i18n.use(LangDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    resources,
    nonExplicitSupportedLngs: true,
});

export default i18n;
