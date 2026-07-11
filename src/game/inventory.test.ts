import { describe, expect, it } from "vitest";

import {
  filterInventoryItemsByCategory,
  getInventoryCategoryCounts,
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
    const equipment = filterInventoryItemsByCategory(mockInventoryItems, "equipment");

    expect(equipment.length).toBeGreaterThan(0);
    expect(equipment.every((item) => item.category === "equipment")).toBe(true);
  });

  it("returns empty items for a category with no matches or invalid category", () => {
    const invalidCategory = "missing" as InventoryCategory;

    expect(getInventoryItemsByCategory(invalidCategory)).toEqual([]);
    expect(filterInventoryItemsByCategory(mockInventoryItems, invalidCategory)).toEqual([]);
  });

  it("filters a provided inventory list through the compatibility helper", () => {
    expect(getInventoryItemsByCategory("rare" as InventoryCategory, [])).toEqual([]);
    expect(getInventoryItemsByCategory("all", [])).toEqual([]);
    expect(getInventoryItemsByCategory("equipment", mockInventoryItems)).toHaveLength(2);
  });

  it("counts items by category for the active inventory source", () => {
    const counts = getInventoryCategoryCounts(mockInventoryItems);

    expect(counts.all).toBe(mockInventoryItems.length);
    expect(counts.equipment).toBe(2);
    expect(counts.stamps).toBe(1);
    expect(counts.keepsakes).toBe(1);
    expect(counts.routeMarks).toBe(1);
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
