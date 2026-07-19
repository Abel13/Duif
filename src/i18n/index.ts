import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { enUS } from "./locales/en-US";
import { ptBR } from "./locales/pt-BR";
import type { Locale, TranslationDictionary, TranslationKey } from "./types";

export type { Locale, TranslationDictionary, TranslationKey };

export const DEFAULT_LOCALE: Locale = "pt-BR";
const localeStorageKey = "duif.locale";
const supportedLocales: readonly Locale[] = ["pt-BR", "en-US"];

const dictionaries: Record<Locale, TranslationDictionary> = {
  "pt-BR": ptBR,
  "en-US": enUS,
};

function readKey(dictionary: TranslationDictionary, key: TranslationKey) {
  const value = key.split(".").reduce<unknown>((currentValue, keyPart) => {
    if (
      typeof currentValue === "object" &&
      currentValue !== null &&
      keyPart in currentValue
    ) {
      return (currentValue as Record<string, unknown>)[keyPart];
    }

    return undefined;
  }, dictionary);

  return typeof value === "string" ? value : undefined;
}

export function translate(key: TranslationKey, locale: Locale = DEFAULT_LOCALE) {
  const translatedValue =
    readKey(dictionaries[locale], key) ?? readKey(dictionaries[DEFAULT_LOCALE], key);

  if (translatedValue) {
    return translatedValue;
  }

  return import.meta.env.DEV ? `[missing:${key}]` : key;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function resolveInitialLocale(storage?: Pick<Storage, "getItem">): Locale {
  const savedLocale = storage?.getItem(localeStorageKey);
  return supportedLocales.includes(savedLocale as Locale)
    ? (savedLocale as Locale)
    : DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    resolveInitialLocale(typeof window === "undefined" ? undefined : window.localStorage),
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale: setLocaleState }),
    [locale],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation(localeOverride?: Locale) {
  const context = useContext(I18nContext);
  const locale = localeOverride ?? context?.locale ?? DEFAULT_LOCALE;

  return {
    locale,
    setLocale: context?.setLocale ?? (() => undefined),
    t: (key: TranslationKey) => translate(key, locale),
  };
}
