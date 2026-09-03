import { describe, expect, it } from "vitest";

import { assetKeys } from "./assets";
import {
  FRIENDSHIP_LEVEL_THRESHOLDS,
  friendshipLevelFromCycles,
  getFriendshipProgress,
} from "./friendshipLevels";

describe("friendshipLevelFromCycles", () => {
  it("matches the authoritative cycle thresholds", () => {
    expect(friendshipLevelFromCycles(0)).toBe(1);
    expect(friendshipLevelFromCycles(2)).toBe(1);
    expect(friendshipLevelFromCycles(3)).toBe(2);
    expect(friendshipLevelFromCycles(7)).toBe(2);
    expect(friendshipLevelFromCycles(8)).toBe(3);
    expect(friendshipLevelFromCycles(19)).toBe(3);
    expect(friendshipLevelFromCycles(20)).toBe(4);
    expect(friendshipLevelFromCycles(49)).toBe(4);
    expect(friendshipLevelFromCycles(50)).toBe(5);
    expect(friendshipLevelFromCycles(99)).toBe(5);
  });

  it("floors negative and fractional cycle counts", () => {
    expect(friendshipLevelFromCycles(-4)).toBe(1);
    expect(friendshipLevelFromCycles(3.9)).toBe(2);
  });
});

describe("getFriendshipProgress", () => {
  it("exposes the documented threshold ladder", () => {
    expect([...FRIENDSHIP_LEVEL_THRESHOLDS]).toEqual([0, 3, 8, 20, 50]);
  });

  it("tracks progress inside level 1 toward frequent correspondents", () => {
    const progress = getFriendshipProgress(2);
    expect(progress.level).toBe(1);
    expect(progress.levelId).toBe("newCorrespondents");
    expect(progress.nameKey).toBe("friends.levels.newCorrespondents");
    expect(progress.sealAssetKey).toBe(assetKeys.friendship.seals.newCorrespondents);
    expect(progress.cyclesInLevel).toBe(2);
    expect(progress.cyclesToNext).toBe(1);
    expect(progress.levelSpan).toBe(3);
    expect(progress.progressRatio).toBeCloseTo(2 / 3);
    expect(progress.isMax).toBe(false);
  });

  it("resets the bar when a new level begins", () => {
    const progress = getFriendshipProgress(3);
    expect(progress.level).toBe(2);
    expect(progress.cyclesInLevel).toBe(0);
    expect(progress.cyclesToNext).toBe(5);
    expect(progress.progressRatio).toBe(0);
  });

  it("fills the track at lasting bond", () => {
    const progress = getFriendshipProgress(50);
    expect(progress.level).toBe(5);
    expect(progress.levelId).toBe("lastingBond");
    expect(progress.sealAssetKey).toBe(assetKeys.friendship.seals.lastingBond);
    expect(progress.nextThreshold).toBeNull();
    expect(progress.cyclesToNext).toBeNull();
    expect(progress.progressRatio).toBe(1);
    expect(progress.isMax).toBe(true);
  });
});
