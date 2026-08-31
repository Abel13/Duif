import { describe, expect, it } from "vitest";

import { assetKeys } from "./assets";
import { resolveTravelConditionArtwork } from "./travelConditionArtwork";

describe("travel-condition artwork", () => {
  it("always selects the seasonal artwork", () => {
    expect(resolveTravelConditionArtwork("spring")).toEqual({
      seasonAssetKey: assetKeys.textures.mapAtmosphere.seasons.spring,
    });
  });

  it("groups only weather that has decorative artwork", () => {
    expect(resolveTravelConditionArtwork("summer", "fogDrizzle").weatherKind).toBe("drizzle");
    expect(resolveTravelConditionArtwork("summer", "rain").weatherKind).toBe("rain");
    expect(resolveTravelConditionArtwork("winter", "snow").weatherKind).toBe("snowIce");
    expect(resolveTravelConditionArtwork("winter", "heavyFreezingRain").weatherKind).toBe("snowIce");
    expect(resolveTravelConditionArtwork("autumn", "thunderstorm").weatherKind).toBe("storm");
    (["clear", "partlyCloudy", "cloudy"] as const).forEach((category) => {
      expect(resolveTravelConditionArtwork("spring", category).weatherAssetKey).toBeUndefined();
    });
  });
});
