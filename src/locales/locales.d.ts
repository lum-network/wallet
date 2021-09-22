// import the original type declarations
import 'react-i18next';
// import all namespaces (for the default language, only)
import en from './en.json';

declare module 'react-i18next' {
    // and extend them!
    interface Resources {
        en: typeof en;
    }
}
