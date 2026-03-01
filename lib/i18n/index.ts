// lib/i18n/index.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enUS from "./locales/en-US.json";
import es from "./locales/es.json";
import ptBR from "./locales/pt-BR.json";

const LANGUAGE_KEY = "@app_language";
const LANGUAGE_MODE_KEY = "@app_language_mode";

export type AppLanguage =
  | "pt-BR"
  | "pt-PT"
  | "en-US"
  | "es"
  | "fr-FR"
  | "de-DE";
type LanguageMode = "auto" | "manual";

const resources = {
  "pt-BR": { translation: ptBR },
  "en-US": { translation: enUS },
  es: { translation: es },
};

function isAppLanguage(value: string): value is AppLanguage {
  return value === "pt-BR" || value === "en-US" || value === "es";
}

async function getLanguageMode(): Promise<LanguageMode> {
  const mode = await AsyncStorage.getItem(LANGUAGE_MODE_KEY);
  if (mode === "auto" || mode === "manual") return mode;

  const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (storedLanguage && isAppLanguage(storedLanguage)) return "manual";

  return "auto";
}

async function getStoredLanguage(): Promise<AppLanguage> {
  const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (stored && isAppLanguage(stored)) return stored;

  const locales = Localization.getLocales();
  const deviceTag = locales[0]?.languageTag ?? "pt-BR";

  if (deviceTag.startsWith("pt")) return "pt-BR";
  if (deviceTag.startsWith("es")) return "es";
  if (deviceTag.startsWith("en")) return "en-US";

  return "pt-BR";
}

export async function initI18n() {
  if (i18n.isInitialized) return;

  const lng = await getStoredLanguage();

  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng,
    fallbackLng: "pt-BR",
    interpolation: { escapeValue: false },

    react: { useSuspense: false },
    initImmediate: false,

    returnNull: false,
  });
}

export async function changeLanguage(lng: AppLanguage) {
  await AsyncStorage.setItem(LANGUAGE_MODE_KEY, "manual");
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  await i18n.changeLanguage(lng);
}

function mapCountryCodeToLanguage(countryCode: string): AppLanguage | null {
  const code = countryCode.toUpperCase();

  if (code === "BR") return "pt-BR";
  if (code === "PT") return "pt-BR";
  if (
    code === "ES" ||
    code === "MX" ||
    code === "AR" ||
    code === "CO" ||
    code === "CL" ||
    code === "PE" ||
    code === "UY" ||
    code === "PY" ||
    code === "BO" ||
    code === "EC" ||
    code === "VE" ||
    code === "CR" ||
    code === "PA" ||
    code === "DO" ||
    code === "GT" ||
    code === "HN" ||
    code === "NI" ||
    code === "SV" ||
    code === "CU"
  ) {
    return "es";
  }

  if (
    code === "US" ||
    code === "GB" ||
    code === "IE" ||
    code === "CA" ||
    code === "AU" ||
    code === "NZ"
  ) {
    return "en-US";
  }

  return null;
}

export async function autoChangeLanguageFromCountryCode(
  countryCode?: string | null,
): Promise<AppLanguage | null> {
  if (!countryCode) return null;

  const mode = await getLanguageMode();
  if (mode === "manual") return null;

  const nextLanguage = mapCountryCodeToLanguage(countryCode);
  if (!nextLanguage) return null;

  if (i18n.language === nextLanguage) return nextLanguage;

  await AsyncStorage.setItem(LANGUAGE_MODE_KEY, "auto");
  await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
  await i18n.changeLanguage(nextLanguage);

  return nextLanguage;
}

export default i18n;
