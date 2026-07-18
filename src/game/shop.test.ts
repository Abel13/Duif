import { describe, expect, it } from "vitest";

import { hasAssetPath } from "./assets";
import { filterShopItemsByCategory, mockShopCatalog, shopCategories } from "./shop";

describe("shop catalog", () => {
  it("contains unique, priced items with valid runtime assets", () => {
    expect(new Set(mockShopCatalog.map((item) => item.id)).size).toBe(mockShopCatalog.length);
    expect(mockShopCatalog.every((item) => item.price > 0)).toBe(true);
    expect(mockShopCatalog.every((item) => hasAssetPath(item.thumbnailAssetPath))).toBe(true);
  });

  it("covers every visible category and both functional currencies", () => {
    expect(new Set(mockShopCatalog.map((item) => item.category))).toEqual(
      new Set(["cosmetics", "stickers", "postcards", "decorations"]),
    );
    expect(new Set(mockShopCatalog.map((item) => item.currency))).toEqual(
      new Set(["free", "premium"]),
    );
  });

  it("filters items while preserving all and defensive empty behavior", () => {
    expect(filterShopItemsByCategory(mockShopCatalog, "all")).toBe(mockShopCatalog);
    expect(filterShopItemsByCategory(mockShopCatalog, "stickers")).toHaveLength(2);
    expect(
      filterShopItemsByCategory(mockShopCatalog, "unknown" as (typeof shopCategories)[number]),
    ).toEqual([]);
  });
});
