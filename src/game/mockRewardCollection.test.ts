import { describe, expect, it } from "vitest";

import { nuvemDelivery } from "./mockData";
import { collectMockRewardOnce, readMockRewardCollection, type StorageLike } from "./mockRewardCollection";
import { createMockRewardFromDelivery } from "./rewards";

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
