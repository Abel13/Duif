import { describe, expect, it } from "vitest";
import { mapMascotFlightPreview, mapMascotFlightState } from "./flightProgression";

describe("flight progression mappings", () => {
  it("maps authoritative level and prestige state", () => {
    const result = mapMascotFlightState({ level: 20, xp: 42, nextLevelXp: 6500, maxOneWayKm: 20050, naturalSlots: 7, functionalCapReached: true, selectedBorderKey: "prestige-first-horizon", borders: [{ catalogKey: "prestige-first-horizon", minimumLevel: 20, nameKey: "prestige.firstHorizon.name", descriptionKey: "prestige.firstHorizon.description", assetKey: "prestige.border.firstHorizon", unlocked: true, selected: true }] });
    expect(result?.naturalSlots).toBe(7);
    expect(result?.borders[0]?.selected).toBe(true);
  });

  it("rejects an unknown rules version and maps familiarity", () => {
    const payload = { rulesVersion: 58, distanceKm: 120, eligible: true, requiredLevel: 4, maxOneWayKm: 180, naturalSlots: 3, routePairKey: "city:1|city:2", familiarity: { state: "known", completedCount: 4, speedMultiplier: 1.02, nextAt: 8 } };
    expect(mapMascotFlightPreview(payload)?.familiarity.state).toBe("known");
    expect(mapMascotFlightPreview({ ...payload, rulesVersion: 59 })).toBeUndefined();
  });
});
