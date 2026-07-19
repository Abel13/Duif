import { describe, expect, it } from "vitest";

import {
  getMapFocusZoom,
  getNormalizedRouteBounds,
  getRouteFitPadding,
  MIN_REWARD_VISIBILITY_ZOOM,
  shouldShowMapRewards,
} from "./travelMapCamera";

describe("travel map camera helpers", () => {
  it("normalizes the Londrina to Maringá route as southwest and northeast", () => {
    expect(
      getNormalizedRouteBounds(
        { latitude: -23.3045, longitude: -51.1696 },
        { latitude: -23.4205, longitude: -51.9333 },
      ),
    ).toEqual([
      [-51.9333, -23.4205],
      [-51.1696, -23.3045],
    ]);
  });

  it("uses a small responsive route margin", () => {
    expect(getRouteFitPadding(390, 844)).toBe(18);
    expect(getRouteFitPadding(1024, 768)).toBe(31);
    expect(getRouteFitPadding(2400, 1400)).toBe(36);
  });

  it("falls back safely for invalid viewport sizes", () => {
    expect(getRouteFitPadding(Number.NaN, 0)).toBe(18);
  });

  it("hides rewards only while the camera is farther than the threshold", () => {
    expect(shouldShowMapRewards(MIN_REWARD_VISIBILITY_ZOOM - 0.01)).toBe(false);
    expect(shouldShowMapRewards(MIN_REWARD_VISIBILITY_ZOOM)).toBe(true);
    expect(shouldShowMapRewards(MIN_REWARD_VISIBILITY_ZOOM + 1)).toBe(true);
  });

  it("uses a consistent close zoom when focusing the mascot", () => {
    expect(getMapFocusZoom(2, "mascot")).toBe(13);
    expect(getMapFocusZoom(12, "mascot")).toBe(13);
    expect(getMapFocusZoom(5, "reward")).toBe(6.5);
    expect(getMapFocusZoom(4, "traffic")).toBe(12);
    expect(getMapFocusZoom(14, "traffic")).toBe(12);
  });
});
