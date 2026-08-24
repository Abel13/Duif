import type { OfficialAssetKey } from "./assets";
import type { TranslationKey } from "../i18n";

export type FunctionalEquipmentKind = "backpack" | "utility";
export type EquipmentHazardKey = "wet" | "visibility" | "night" | "wind" | "cold" | "winterCold" | "heat" | "summerHeat" | "strongSun";
export type EquipmentEffect = { hazardKey: EquipmentHazardKey | string; mitigationPoints: number; sortOrder: number };

export type FunctionalEquipmentCatalogItem = {
  id: string;
  catalogKey: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  kind: FunctionalEquipmentKind;
  effects: EquipmentEffect[];
  seedPrice: number;
  maxUses?: number;
  repairSeedPrice?: number;
  slotBonus: number;
  speedMultiplier: number;
  assetKey?: OfficialAssetKey;
};

export type EquipmentInstance = {
  id: string;
  catalogId: string;
  usesRemaining?: number;
  equippedMascotId?: string;
  acquiredAt: string;
};

export type MascotLoadout = {
  mascotId: string;
  backpackInstanceId?: string;
  utilityInstanceId?: string;
  revision: number;
};

export type EquipmentData = {
  catalog: FunctionalEquipmentCatalogItem[];
  instances: EquipmentInstance[];
  loadouts: MascotLoadout[];
  seedBalance: number;
};

export function groupEquipmentInstances(instances: EquipmentInstance[]) {
  return instances.reduce((groups, instance) => {
    const group = groups.get(instance.catalogId) ?? [];
    group.push(instance);
    groups.set(instance.catalogId, group);
    return groups;
  }, new Map<string, EquipmentInstance[]>());
}

export function getMascotLoadout(data: EquipmentData, mascotId: string): MascotLoadout {
  return data.loadouts.find((loadout) => loadout.mascotId === mascotId) ?? { mascotId, revision: 1 };
}

export function calculateLoadoutComparison(
  catalog: FunctionalEquipmentCatalogItem[],
  backpackInstance: EquipmentInstance | undefined,
  utilityInstance: EquipmentInstance | undefined,
  weather?: { category?: string; isDay?: boolean; windSpeedKmh?: number; temperatureC?: number; season?: string },
) {
  const backpack = catalog.find((item) => item.id === backpackInstance?.catalogId && item.kind === "backpack");
  const utility = catalog.find((item) => item.id === utilityInstance?.catalogId && item.kind === "utility");
  const hazards = resolveSpeedHazards(weather);
  const mitigations = (utility?.effects ?? []).flatMap((effect) => {
    const penalty = hazards[effect.hazardKey] ?? 0;
    return penalty > 0 ? [{ hazardKey: effect.hazardKey, mitigationPoints: Math.min(penalty, effect.mitigationPoints) }] : [];
  });
  const mitigationPoints = Math.min(.04, mitigations.reduce((total, effect) => total + effect.mitigationPoints, 0));
  return {
    activeMitigations: mitigations,
    mitigationPoints,
    slotCapacity: 3 + (backpack?.slotBonus ?? 0),
    speedMultiplier: backpack?.speedMultiplier ?? 1,
  };
}

export function resolveSpeedHazards(weather?: { category?: string; isDay?: boolean; windSpeedKmh?: number; temperatureC?: number; season?: string }): Record<string, number> {
  if (!weather) return {};
  const hazards: Record<string, number> = {};
  const category = weather.category;
  if (category === "fogDrizzle") { hazards.wet = .01; hazards.visibility = .01; }
  else if (category === "rain") hazards.wet = .04;
  else if (category === "heavyFreezingRain") hazards.wet = .06;
  else if (category === "thunderstorm") hazards.wet = .08;
  if ((weather.windSpeedKmh ?? 0) >= 50) hazards.wind = .04;
  else if ((weather.windSpeedKmh ?? 0) >= 30) hazards.wind = .02;
  if (weather.isDay === false) hazards.night = .02;
  const temperature = weather.temperatureC;
  if (temperature !== undefined) {
    if (temperature < 3) hazards.cold = .04;
    else if (temperature < 10) hazards.cold = .02;
    if (temperature >= 34) hazards.heat = .04;
    else if (temperature >= 27) hazards.heat = .02;
    if (weather.season === "winter" && temperature < 10) hazards.winterCold = .01;
    if (weather.season === "summer" && temperature >= 27) hazards.summerHeat = .01;
    if (weather.isDay !== false && temperature >= 27 && ["clear", "partlyCloudy"].includes(category ?? "")) hazards.strongSun = .01;
  }
  return hazards;
}
