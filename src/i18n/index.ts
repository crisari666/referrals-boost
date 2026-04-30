import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { APP_CONSTANTS } from "@/constants/app-constants";
import enTranslation from "@/i18n/locales/en";
import esTranslation from "@/i18n/locales/es";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: esTranslation },
      en: { translation: enTranslation },
    },
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: APP_CONSTANTS.LANGUAGE_STORAGE_KEY,
    },
  });

export default i18n;
