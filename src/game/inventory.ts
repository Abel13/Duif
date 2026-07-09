import type { InventoryCategory, InventoryItem, RewardRarity } from "./types";

export const inventoryCategories: InventoryCategory[] = [
  "all",
  "equipment",
  "stamps",
  "keepsakes",
  "routeMarks",
];

export const mockInventoryItems: InventoryItem[] = [
  {
    id: "inventory-canvas-postal-bag",
    nameKey: "equipment.canvasPostalBag.name",
    descriptionKey: "equipment.canvasPostalBag.description",
    rarity: "common",
    category: "equipment",
    collectedAt: "2026-07-01T10:00:00.000Z",
    equipped: true,
    sourceKey: "inventory.sources.starterKit",
  },
  {
    id: "inventory-blue-route-scarf",
    nameKey: "equipment.blueRouteScarf.name",
    descriptionKey: "equipment.blueRouteScarf.description",
    rarity: "uncommon",
    category: "equipment",
    collectedAt: "2026-07-01T10:10:00.000Z",
    equipped: true,
    sourceKey: "inventory.sources.starterKit",
  },
  {
    id: "inventory-worn-route-stamp",
    nameKey: "rewards.items.wornRouteStamp.name",
    descriptionKey: "rewards.items.wornRouteStamp.description",
    rarity: "common",
    category: "stamps",
    collectedAt: "2026-07-03T12:00:00.000Z",
    equipped: false,
    sourceKey: "inventory.sources.routeReward",
  },
  {
    id: "inventory-blue-airmail-label",
    nameKey: "rewards.items.blueAirmailLabel.name",
    descriptionKey: "rewards.items.blueAirmailLabel.description",
    rarity: "uncommon",
    category: "routeMarks",
    collectedAt: "2026-07-04T12:00:00.000Z",
    equipped: false,
    sourceKey: "inventory.sources.routeReward",
  },
  {
    id: "inventory-golden-compass-pin",
    nameKey: "rewards.items.goldenCompassPin.name",
    descriptionKey: "rewards.items.goldenCompassPin.description",
    rarity: "rare",
    category: "keepsakes",
    collectedAt: "2026-07-05T12:00:00.000Z",
    equipped: false,
    sourceKey: "inventory.sources.longRouteFind",
  },
];

export function getInventoryItemsByCategory(category: InventoryCategory) {
  if (category === "all") {
    return mockInventoryItems;
  }

  if (!inventoryCategories.includes(category)) {
    return [];
  }

  return mockInventoryItems.filter((item) => item.category === category);
}

export function getInventorySummary(items: InventoryItem[]) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;

      if (item.equipped) {
        summary.equipped += 1;
      }

      summary.rarityCounts[item.rarity] += 1;

      return summary;
    },
    {
      total: 0,
      equipped: 0,
      rarityCounts: {
        common: 0,
        uncommon: 0,
        rare: 0,
      } satisfies Record<RewardRarity, number>,
    },
  );
}
