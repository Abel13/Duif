import type { RouteRewardDiscovery } from "./mapTravel";
import type { Delivery, DeliveryReward, InventoryItem, Mascot } from "./types";

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

export function archiveCollectedMockDeliveries(
  mascots: Mascot[],
  snapshot: MockRewardCollectionSnapshot = readMockRewardCollection(),
): Mascot[] {
  const completedIds = new Set(snapshot.collectedDeliveryIds);
  return mascots.map((mascot) =>
    mascot.currentDelivery && completedIds.has(mascot.currentDelivery.id)
      ? { ...mascot, currentDelivery: undefined }
      : mascot,
  );
}

export function getMockDeliveryHistory(
  deliveries: Delivery[],
  snapshot: MockRewardCollectionSnapshot = readMockRewardCollection(),
): Delivery[] {
  const completedIds = new Set(snapshot.collectedDeliveryIds);
  return deliveries
    .filter((delivery) => completedIds.has(delivery.id))
    .map((delivery) => ({ ...delivery, status: "completed" }));
}

export function collectMockRewardOnce({
  delivery,
  now = new Date(),
  reward,
  routeDiscoveries = [],
  storage = getSessionStorage(),
}: {
  delivery: Delivery;
  now?: Date;
  reward: DeliveryReward;
  routeDiscoveries?: RouteRewardDiscovery[];
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
  const routeInventoryItems: InventoryItem[] = routeDiscoveries.map((discovery) => ({
    category: getRouteInventoryCategory(discovery.kind),
    collectedAt: now.toISOString(),
    descriptionKey: discovery.descriptionKey,
    equipped: false,
    id: `mock-inventory-route-${delivery.id}-${discovery.id}`,
    nameKey: discovery.titleKey,
    rarity: discovery.rarity,
    sourceKey: "inventory.sources.routeReward",
    thumbnailAssetPath: discovery.thumbnailAssetPath,
  }));
  const next = {
    collectedDeliveryIds: [...current.collectedDeliveryIds, delivery.id],
    inventory: [...current.inventory, inventoryItem, ...routeInventoryItems],
  };

  try {
    storage?.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Keep the current view usable when browser storage is unavailable.
  }
  return next;
}

function getRouteInventoryCategory(
  kind: RouteRewardDiscovery["kind"],
): InventoryItem["category"] {
  if (kind === "stamp") return "stamps";
  if (kind === "badge") return "routeMarks";
  return "keepsakes";
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
