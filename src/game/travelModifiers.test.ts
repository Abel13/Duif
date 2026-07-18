import { describe, expect, it } from "vitest";

import { starterMascots } from "./mockData";
import type { Mascot } from "./types";
import {
  deriveMascotTravelModifiers,
  getDeliveryTravelModifiers,
  NEUTRAL_TRAVEL_MODIFIERS,
} from "./travelModifiers";

describe("deriveMascotTravelModifiers", () => {
  const getMascot = (id: string) => starterMascots.find((mascot) => mascot.id === id)!;

  it("keeps Nuvem consistent on long routes", () => {
    const modifiers = deriveMascotTravelModifiers(getMascot("mascot-nuvem"), { distanceKm: 500 });

    expect(modifiers.isLongRoute).toBe(true);
    expect(modifiers.returnSpeedMultiplier).toBe(1);
    expect(modifiers.longRouteConsistency).toBe(1);
  });

  it("makes Trovão prepare and return faster on short routes", () => {
    const modifiers = deriveMascotTravelModifiers(getMascot("mascot-trovao"), { distanceKm: 499.99 });

    expect(modifiers.isLongRoute).toBe(false);
    expect(modifiers.preparationMinutes).toBe(25.5);
    expect(modifiers.returnSpeedMultiplier).toBe(1.1);
    expect(modifiers.discoveryRadiusMultiplier).toBe(1.12);
  });

  it("gives Pipoca a 15 percentage-point trait bonus and bounded detour cost", () => {
    const pipoca = getMascot("mascot-pipoca");
    const withoutTrait = {
      ...pipoca,
      trait: { ...pipoca.trait, effect: "friendshipBonus" as const },
    };
    const modifiers = deriveMascotTravelModifiers(pipoca, { distanceKm: 100 });
    const neutralTraitModifiers = deriveMascotTravelModifiers(withoutTrait, { distanceKm: 100 });

    expect(modifiers.discoveryRadiusMultiplier - neutralTraitModifiers.discoveryRadiusMultiplier).toBeCloseTo(0.15);
    expect(modifiers.outboundSpeedMultiplier).toBe(0.98);
    expect(modifiers.rarityWeightMultiplier).toBe(1.26);
  });

  it("sanitizes invalid attributes, skill levels, and route distances", () => {
    const invalidMascot = {
      ...getMascot("mascot-pipoca"),
      attributes: { speed: 5, stamina: 5, orientation: Number.NaN, luck: -10 },
      skills: getMascot("mascot-pipoca").skills.map((skill) => ({ ...skill, level: 100 })),
    } satisfies Mascot;
    const modifiers = deriveMascotTravelModifiers(invalidMascot, { distanceKm: Number.NaN });

    expect(modifiers.isLongRoute).toBe(false);
    expect(modifiers.discoveryRadiusMultiplier).toBeLessThanOrEqual(1.3);
    expect(modifiers.rarityWeightMultiplier).toBeLessThanOrEqual(1.3);
    expect(modifiers.outboundSpeedMultiplier).toBeGreaterThanOrEqual(0.85);
  });

  it("returns a neutral fallback for deliveries created before snapshots", () => {
    expect(getDeliveryTravelModifiers(undefined)).toBe(NEUTRAL_TRAVEL_MODIFIERS);
  });

  it("produces a detached snapshot that does not change with the mascot", () => {
    const mascot = structuredClone(getMascot("mascot-trovao"));
    const snapshot = deriveMascotTravelModifiers(mascot, { distanceKm: 100 });

    mascot.attributes.orientation = 0;
    mascot.skills[0]!.level = 0;

    expect(snapshot.preparationMinutes).toBe(25.5);
    expect(snapshot.discoveryRadiusMultiplier).toBe(1.12);
  });
});
