import { enUS } from "./locales/en-US";
import { ptBR } from "./locales/pt-BR";
import type { Locale, TranslationDictionary, TranslationKey } from "./types";

export type { Locale, TranslationDictionary, TranslationKey };

export const DEFAULT_LOCALE: Locale = "pt-BR";

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

export function useTranslation(locale: Locale = DEFAULT_LOCALE) {
  return {
    locale,
    t: (key: TranslationKey) => translate(key, locale),
  };
}
