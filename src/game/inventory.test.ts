import { describe, expect, it } from "vitest";

import {
  filterInventoryItemsByCategory,
  getInventoryCategoryCounts,
  getInventoryItemsByCategory,
  getInventorySummary,
  groupInventoryItems,
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

  it("groups repeat collection rewards while keeping equipment as separate instances", () => {
    const repeatedStamp = {
      ...mockInventoryItems[2],
      id: "inventory-worn-route-stamp-newer",
      collectedAt: "2026-07-06T12:00:00.000Z",
      rewardItemId: "reward-worn-route-stamp",
    };
    const originalStamp = {
      ...mockInventoryItems[2],
      rewardItemId: "reward-worn-route-stamp",
    };
    const repeatedEquipment = {
      ...mockInventoryItems[0],
      id: "inventory-canvas-postal-bag-second",
      rewardItemId: "equipment-canvas-postal-bag",
    };

    const grouped = groupInventoryItems([
      originalStamp,
      repeatedStamp,
      mockInventoryItems[0],
      repeatedEquipment,
    ]);

    expect(grouped).toHaveLength(3);
    expect(grouped.find((item) => item.rewardItemId === "reward-worn-route-stamp")).toMatchObject({
      id: repeatedStamp.id,
      quantity: 2,
    });
    expect(grouped.filter((item) => item.category === "equipment")).toHaveLength(2);
  });

  it("keeps legacy records without a reward identity in separate collection boxes", () => {
    const [first] = mockInventoryItems;
    const grouped = groupInventoryItems([
      { ...first, id: "legacy-one", category: "stamps", equipped: false },
      { ...first, id: "legacy-two", category: "stamps", equipped: false },
    ]);

    expect(grouped).toHaveLength(2);
    expect(grouped.every((item) => item.quantity === 1)).toBe(true);
  });

  it("counts grouped boxes by category and summarizes distinct and acquired items", () => {
    const items = groupInventoryItems([
      ...mockInventoryItems.map((item) =>
        item.category === "stamps" ? { ...item, rewardItemId: "reward-worn-route-stamp" } : item,
      ),
      {
        ...mockInventoryItems[2],
        id: "inventory-worn-route-stamp-second",
        collectedAt: "2026-07-08T12:00:00.000Z",
        rewardItemId: "reward-worn-route-stamp",
      },
    ]);
    const counts = getInventoryCategoryCounts([
      ...mockInventoryItems.map((item) =>
        item.category === "stamps" ? { ...item, rewardItemId: "reward-worn-route-stamp" } : item,
      ),
      {
        ...mockInventoryItems[2],
        id: "inventory-worn-route-stamp-second",
        rewardItemId: "reward-worn-route-stamp",
      },
    ]);
    const summary = getInventorySummary(items);

    expect(counts.all).toBe(mockInventoryItems.length);
    expect(counts.stamps).toBe(1);
    expect(summary.distinctTotal).toBe(mockInventoryItems.length);
    expect(summary.acquiredTotal).toBe(mockInventoryItems.length + 1);
    expect(summary.equipped).toBe(2);
    expect(summary.rarityCounts.common).toBe(3);
    expect(summary.rarityCounts.uncommon).toBe(2);
    expect(summary.rarityCounts.rare).toBe(1);
  });
});
