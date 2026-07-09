import { describe, expect, it } from "vitest";

import {
  getInventoryItemsByCategory,
  getInventorySummary,
  mockInventoryItems,
} from "./inventory";
import type { InventoryCategory } from "./types";

describe("inventory helpers", () => {
  it("returns all items for the all category", () => {
    expect(getInventoryItemsByCategory("all")).toEqual(mockInventoryItems);
  });

  it("filters items by category", () => {
    const equipment = getInventoryItemsByCategory("equipment");

    expect(equipment.length).toBeGreaterThan(0);
    expect(equipment.every((item) => item.category === "equipment")).toBe(true);
  });

  it("returns empty items for a category with no matches or invalid category", () => {
    const invalidCategory = "missing" as InventoryCategory;

    expect(getInventoryItemsByCategory(invalidCategory)).toEqual([]);
  });

  it("summarizes total, equipped items, and rarity counts", () => {
    const summary = getInventorySummary(mockInventoryItems);

    expect(summary.total).toBe(mockInventoryItems.length);
    expect(summary.equipped).toBe(2);
    expect(summary.rarityCounts.common).toBe(2);
    expect(summary.rarityCounts.uncommon).toBe(2);
    expect(summary.rarityCounts.rare).toBe(1);
  });
});
