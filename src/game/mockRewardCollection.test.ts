import { describe, expect, it } from "vitest";

import { nuvemDelivery } from "./mockData";
import { collectMockRewardOnce, readMockRewardCollection, type StorageLike } from "./mockRewardCollection";
import { createMockRewardFromDelivery } from "./rewards";
import { getRouteRewardDiscoveries } from "./mapTravel";

describe("mock reward collection", () => {
  it("collects a delivery only once across repeated reads", () => {
    const storage = createMemoryStorage();
    const reward = createMockRewardFromDelivery(nuvemDelivery)!;

    const first = collectMockRewardOnce({ delivery: nuvemDelivery, reward, storage });
    const second = collectMockRewardOnce({ delivery: nuvemDelivery, reward, storage });

    expect(first.inventory).toHaveLength(1);
    expect(second.inventory).toHaveLength(1);
    expect(readMockRewardCollection(storage).collectedDeliveryIds).toEqual([nuvemDelivery.id]);
  });

  it("collects the complete route cargo idempotently with category mapping", () => {
    const storage = createMemoryStorage();
    const reward = createMockRewardFromDelivery(nuvemDelivery)!;
    const routeDiscoveries = getRouteRewardDiscoveries(nuvemDelivery);

    const first = collectMockRewardOnce({
      delivery: nuvemDelivery,
      reward,
      routeDiscoveries,
      storage,
    });
    const second = collectMockRewardOnce({
      delivery: nuvemDelivery,
      reward,
      routeDiscoveries,
      storage,
    });

    expect(routeDiscoveries).toHaveLength(6);
    expect(first.inventory).toHaveLength(7);
    expect(second.inventory).toHaveLength(7);
    expect(first.inventory.filter((item) => item.category === "stamps")).toHaveLength(1);
    expect(first.inventory.filter((item) => item.category === "routeMarks")).toHaveLength(1);
    expect(new Set(first.inventory.map((item) => item.id)).size).toBe(7);
  });

  it("falls back safely for malformed session data", () => {
    const storage = createMemoryStorage("not-json");
    expect(readMockRewardCollection(storage)).toEqual({ collectedDeliveryIds: [], inventory: [] });
  });
});

function createMemoryStorage(initialValue?: string): StorageLike {
  let value = initialValue ?? null;
  return {
    getItem: () => value,
    setItem: (_key, nextValue) => {
      value = nextValue;
    },
  };
}
