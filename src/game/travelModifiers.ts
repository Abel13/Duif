import type { Mascot, MascotTravelModifiers } from "./types";

export const LONG_ROUTE_THRESHOLD_KM = 500;
export const BASE_PREPARATION_MINUTES = 5;
export const MINIMUM_PREPARATION_MINUTES = 3;
export const NEUTRAL_TRAVEL_MODIFIERS: MascotTravelModifiers = {
  version: 1,
  preparationMinutes: 0,
  outboundSpeedMultiplier: 1,
  returnSpeedMultiplier: 1,
  discoveryRadiusMultiplier: 1,
  rarityWeightMultiplier: 1,
  longRouteConsistency: 1,
  isLongRoute: false,
};

type TravelRoute = { distanceKm: number };

export function deriveMascotTravelModifiers(
  mascot: Mascot,
  route: TravelRoute,
): MascotTravelModifiers {
  const orientation = sanitizeAttribute(mascot.attributes?.orientation);
  const luck = sanitizeAttribute(mascot.attributes?.luck);
  const quickDispatchLevel = getSkillLevel(mascot, "skill-trovao-quick-dispatch");
  const crosswindLevel = getSkillLevel(mascot, "skill-trovao-crosswind");
  const shinyThingLevel = getSkillLevel(mascot, "skill-pipoca-shiny-thing");
  const happyDetourLevel = getSkillLevel(mascot, "skill-pipoca-detour");
  const longRouteLevel = getSkillLevel(mascot, "skill-nuvem-long-route");
  const isLongRoute = sanitizeDistance(route.distanceKm) >= LONG_ROUTE_THRESHOLD_KM;

  const preparationReduction = Math.min(0.2, quickDispatchLevel * 0.05);
  const detourSpeedPenalty = Math.min(0.15, happyDetourLevel * 0.02);
  const outboundSpeedMultiplier = clamp(1 - detourSpeedPenalty, 0.85, 1.15);

  const safeRouteMitigation = mascot.trait.effect === "deliveryReward" ? 0.5 : 0;
  const longRouteSkillMitigation = Math.min(0.5, longRouteLevel * 0.25);
  const totalLongRouteMitigation = Math.min(1, safeRouteMitigation + longRouteSkillMitigation);
  const remainingLongRoutePenalty = isLongRoute ? 0.1 * (1 - totalLongRouteMitigation) : 0;
  const directFlightMultiplier = mascot.trait.effect === "fastReturn" ? 1.1 : 1;
  const returnSpeedMultiplier = clamp(
    (outboundSpeedMultiplier * directFlightMultiplier) / (1 + remainingLongRoutePenalty),
    0.75,
    1.25,
  );

  const curiousFinderBonus = mascot.trait.effect === "rareFind" ? 0.15 : 0;
  const discoveryRadiusMultiplier = clamp(
    1 + orientation * 0.01 + crosswindLevel * 0.02 + happyDetourLevel * 0.03 + curiousFinderBonus,
    1,
    1.3,
  );
  const rarityWeightMultiplier = clamp(1 + luck * 0.02 + shinyThingLevel * 0.03, 1, 1.3);

  return {
    version: 2,
    preparationMinutes: round(
      Math.max(MINIMUM_PREPARATION_MINUTES, BASE_PREPARATION_MINUTES * (1 - preparationReduction)),
      2,
    ),
    outboundSpeedMultiplier: round(outboundSpeedMultiplier, 4),
    returnSpeedMultiplier: round(returnSpeedMultiplier, 4),
    discoveryRadiusMultiplier: round(discoveryRadiusMultiplier, 4),
    rarityWeightMultiplier: round(rarityWeightMultiplier, 4),
    longRouteConsistency: round(1 - remainingLongRoutePenalty, 4),
    isLongRoute,
  };
}

export function getDeliveryTravelModifiers(
  modifiers: MascotTravelModifiers | undefined,
): MascotTravelModifiers {
  return modifiers?.version === 1 || modifiers?.version === 2
    ? modifiers
    : NEUTRAL_TRAVEL_MODIFIERS;
}

function getSkillLevel(mascot: Mascot, skillId: string) {
  return clamp(
    mascot.skills.find((skill) => skill.id === skillId)?.level ?? 0,
    0,
    10,
  );
}

function sanitizeAttribute(value: number | undefined) {
  return clamp(Number.isFinite(value) ? value ?? 0 : 0, 0, 10);
}

function sanitizeDistance(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
