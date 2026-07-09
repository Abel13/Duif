import { describe, expect, it } from "vitest";

import { nuvemDelivery } from "./mockData";
import { createMockRewardFromDelivery } from "./rewards";

describe("createMockRewardFromDelivery", () => {
  it("returns a deterministic reward for the same delivery seed", () => {
    const firstReward = createMockRewardFromDelivery(nuvemDelivery);
    const secondReward = createMockRewardFromDelivery(nuvemDelivery);

    expect(firstReward).toEqual(secondReward);
  });

  it("returns valid xp and item data", () => {
    const reward = createMockRewardFromDelivery(nuvemDelivery);

    expect(reward?.xpGained).toBeGreaterThan(0);
    expect(reward?.item.id).toMatch(/^reward-/);
    expect(["common", "uncommon", "rare"]).toContain(reward?.item.rarity);
  });

  it("returns undefined without a delivery", () => {
    expect(createMockRewardFromDelivery()).toBeUndefined();
  });
});
