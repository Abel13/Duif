import { describe, expect, it } from "vitest";

import { isOfficialAssetKey } from "./assets";
import { filterShopItemsByCategory, shopCatalog, shopCategories } from "./shop";

describe("shop catalog", () => {
  it("contains unique, priced items with valid runtime assets", () => {
    expect(new Set(shopCatalog.map((item) => item.id)).size).toBe(shopCatalog.length);
    expect(shopCatalog.every((item) => item.price > 0)).toBe(true);
    expect(shopCatalog.every((item) => isOfficialAssetKey(item.thumbnailAssetKey))).toBe(true);
  });

  it("keeps demonstration content separate from functional cosmetics", () => {
    expect(new Set(shopCatalog.map((item) => item.category))).toEqual(
      new Set(["stickers", "postcards", "decorations"]),
    );
    expect(new Set(shopCatalog.map((item) => item.currency))).toEqual(
      new Set(["seeds", "crystals"]),
    );
  });

  it("filters items while preserving all and defensive empty behavior", () => {
    expect(filterShopItemsByCategory(shopCatalog, "all")).toBe(shopCatalog);
    expect(filterShopItemsByCategory(shopCatalog, "stickers")).toHaveLength(2);
    expect(
      filterShopItemsByCategory(shopCatalog, "unknown" as (typeof shopCategories)[number]),
    ).toEqual([]);
  });
});
