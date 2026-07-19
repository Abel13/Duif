import { describe, expect, it } from "vitest";

import { getTranslationManifest, hasTranslationInEveryLocale } from ".";
import { OFFICIAL_TRANSLATION_KEYS } from "./officialTranslationKeys";
import catalogMigration from "../../supabase/migrations/20260719160000_internationalized_catalog_contracts.sql?raw";

describe("official translation manifest", () => {
  it("contains every official key in both application locales", () => {
    expect(OFFICIAL_TRANSLATION_KEYS.filter((key) => !hasTranslationInEveryLocale(key)))
      .toEqual([]);
  });

  it("keeps the locale dictionaries structurally aligned", () => {
    expect(getTranslationManifest("en-US")).toEqual(getTranslationManifest("pt-BR"));
  });

  it("matches the translation-key registry installed by the database migration", () => {
    const registryStatement = catalogMigration.match(
      /insert into public\.official_translation_keys[\s\S]*?on conflict \(translation_key\) do nothing;/,
    )?.[0];
    const databaseKeys = [...(registryStatement?.matchAll(/\('([^']+)'\)/g) ?? [])]
      .map((match) => match[1])
      .sort();

    expect(databaseKeys).toEqual([...OFFICIAL_TRANSLATION_KEYS].sort());
  });
});
