import type { InventoryCategory, InventoryItem, RewardRarity } from "./types";
import { assetKeys } from "./assets";

export type GroupedInventoryItem = InventoryItem & {
  groupKey: string;
  quantity: number;
};

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
    thumbnailAssetKey: assetKeys.equipment.canvasPostalBag,
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
    thumbnailAssetKey: assetKeys.equipment.blueRouteScarf,
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
    thumbnailAssetKey: assetKeys.rewards.wornRouteStamp,
  },
  {
    id: "inventory-blue-airmail-label",
    nameKey: "rewards.items.blueAirmailLabel.name",
    descriptionKey: "rewards.items.blueAirmailLabel.description",
    rarity: "rare",
    category: "stamps",
    collectedAt: "2026-07-04T12:00:00.000Z",
    equipped: false,
    sourceKey: "inventory.sources.routeReward",
    thumbnailAssetKey: assetKeys.rewards.blueAirmailLabel,
  },
  {
    id: "inventory-golden-compass-pin",
    nameKey: "rewards.items.goldenCompassPin.name",
    descriptionKey: "rewards.items.goldenCompassPin.description",
    rarity: "rare",
    category: "stamps",
    collectedAt: "2026-07-05T12:00:00.000Z",
    equipped: false,
    sourceKey: "inventory.sources.longRouteFind",
    thumbnailAssetKey: assetKeys.rewards.goldenCompassPin,
  },
];

export function filterInventoryItemsByCategory<T extends InventoryItem>(
  items: readonly T[],
  category: InventoryCategory,
): T[] {
  if (category === "all") {
    return [...items];
  }

  if (!inventoryCategories.includes(category)) {
    return [];
  }

  return items.filter((item) => item.category === category);
}

function getCollectedAtTime(item: InventoryItem) {
  const timestamp = Date.parse(item.collectedAt);

  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

/**
 * Keeps every inventory record intact while presenting repeat collection rewards as one box.
 * Equipment is deliberately instance-based and is never combined.
 */
export function groupInventoryItems(items: readonly InventoryItem[]): GroupedInventoryItem[] {
  const groups = new Map<string, GroupedInventoryItem>();

  for (const item of items) {
    const groupKey =
      item.category === "equipment" || !item.rewardItemId
        ? `inventory:${item.id}`
        : `reward:${item.rewardItemId}`;
    const existing = groups.get(groupKey);

    if (!existing) {
      groups.set(groupKey, { ...item, groupKey, quantity: 1 });
      continue;
    }

    existing.quantity += 1;

    if (getCollectedAtTime(item) > getCollectedAtTime(existing)) {
      groups.set(groupKey, { ...item, groupKey, quantity: existing.quantity });
    }
  }

  return [...groups.values()].sort(
    (left, right) => getCollectedAtTime(right) - getCollectedAtTime(left),
  );
}

export function getInventoryItemsByCategory(
  category: InventoryCategory,
  items: InventoryItem[] = mockInventoryItems,
) {
  return filterInventoryItemsByCategory(items, category);
}

export function getInventoryCategoryCounts(items: InventoryItem[]) {
  const groupedItems = groupInventoryItems(items);

  return inventoryCategories.reduce(
    (counts, category) => ({
      ...counts,
      [category]: filterInventoryItemsByCategory(groupedItems, category).length,
    }),
    {} as Record<InventoryCategory, number>,
  );
}

export function getInventorySummary(items: readonly GroupedInventoryItem[]) {
  return items.reduce(
    (summary, item) => {
      summary.acquiredTotal += item.quantity;
      summary.distinctTotal += 1;

      if (item.equipped) {
        summary.equipped += item.quantity;
      }

      summary.rarityCounts[item.rarity] += item.quantity;

      return summary;
    },
    {
      acquiredTotal: 0,
      distinctTotal: 0,
      equipped: 0,
      rarityCounts: {
        common: 0,
        uncommon: 0,
        rare: 0,
      } satisfies Record<RewardRarity, number>,
    },
  );
}
