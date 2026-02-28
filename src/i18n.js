import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import pt from "./locales/pt/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { pt: { translation: pt }, en: { translation: en } },
    fallbackLng: "en",
    supportedLngs: ["pt", "en"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    detection: {
      order: ["querystring", "navigator", "localStorage"],
      lookupQuerystring: "lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
