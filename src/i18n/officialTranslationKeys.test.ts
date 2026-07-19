import { describe, expect, it } from "vitest";

import { getTranslationManifest, hasTranslationInEveryLocale } from ".";
import { OFFICIAL_TRANSLATION_KEYS } from "./officialTranslationKeys";
import catalogMigration from "../../supabase/migrations/20260719160000_internationalized_catalog_contracts.sql?raw";
import assetMigration from "../../supabase/migrations/20260719180000_official_packaged_asset_registry.sql?raw";

describe("official translation manifest", () => {
  it("contains every official key in both application locales", () => {
    expect(OFFICIAL_TRANSLATION_KEYS.filter((key) => !hasTranslationInEveryLocale(key)))
      .toEqual([]);
  });

  it("keeps the locale dictionaries structurally aligned", () => {
    expect(getTranslationManifest("en-US")).toEqual(getTranslationManifest("pt-BR"));
  });

  it("matches the translation-key registry installed by the database migration", () => {
    const registryStatements = [catalogMigration, assetMigration].flatMap((migration) =>
      [...migration.matchAll(/insert into public\.official_translation_keys[\s\S]*?on conflict \(translation_key\) do nothing;/g)]
        .map((match) => match[0]),
    ).join("\n");
    const databaseKeys = [...registryStatements.matchAll(/\('([^']+)'\)/g)]
      .map((match) => match[1])
      .sort();

    expect(databaseKeys).toEqual([...OFFICIAL_TRANSLATION_KEYS].sort());
  });
});
