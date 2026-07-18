import type { Delivery, DeliveryReward, InventoryItem } from "./types";

const storageKey = "duif.mock-reward-collection.v1";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type MockRewardCollectionSnapshot = {
  collectedDeliveryIds: string[];
  inventory: InventoryItem[];
};

const emptySnapshot: MockRewardCollectionSnapshot = {
  collectedDeliveryIds: [],
  inventory: [],
};

export function readMockRewardCollection(
  storage: StorageLike | undefined = getSessionStorage(),
): MockRewardCollectionSnapshot {
  if (!storage) return { ...emptySnapshot, inventory: [] };

  try {
    const parsed = JSON.parse(storage.getItem(storageKey) ?? "null") as unknown;
    if (!isSnapshot(parsed)) return { ...emptySnapshot, inventory: [] };
    return parsed;
  } catch {
    return { ...emptySnapshot, inventory: [] };
  }
}

export function collectMockRewardOnce({
  delivery,
  now = new Date(),
  reward,
  storage = getSessionStorage(),
}: {
  delivery: Delivery;
  now?: Date;
  reward: DeliveryReward;
  storage?: StorageLike;
}): MockRewardCollectionSnapshot {
  const current = readMockRewardCollection(storage);
  if (current.collectedDeliveryIds.includes(delivery.id)) return current;

  const inventoryItem: InventoryItem = {
    ...reward.item,
    id: `mock-inventory-${reward.id}`,
    category: "keepsakes",
    collectedAt: now.toISOString(),
    equipped: false,
    sourceKey: "inventory.sources.routeReward",
  };
  const next = {
    collectedDeliveryIds: [...current.collectedDeliveryIds, delivery.id],
    inventory: [...current.inventory, inventoryItem],
  };

  try {
    storage?.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Keep the current view usable when browser storage is unavailable.
  }
  return next;
}

function getSessionStorage(): StorageLike | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}

function isSnapshot(value: unknown): value is MockRewardCollectionSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<MockRewardCollectionSnapshot>;
  return Array.isArray(snapshot.collectedDeliveryIds) && Array.isArray(snapshot.inventory);
}
