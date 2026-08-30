import { describe, expect, it } from "vitest";

import { hasTranslationInEveryLocale } from ".";
import catalogExpansion from "../../supabase/migrations/20260830104000_expand_official_jobs_and_rebalance_mascot_xp.sql?raw";

describe("official postal job catalog translations", () => {
  it("resolves every title and description added to the official catalog in both locales", () => {
    const translationKeys = [...new Set([...catalogExpansion.matchAll(/'(postalJobs\.templates\.[^']+\.(?:title|description))'/g)]
      .map((match) => match[1]))];

    expect(translationKeys).toHaveLength(136);
    expect(translationKeys.filter((key) => !hasTranslationInEveryLocale(key))).toEqual([]);
  });
});
