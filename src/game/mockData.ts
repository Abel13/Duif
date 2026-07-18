import { assetPaths } from "./assets";
import type { Delivery, Mascot, Player } from "./types";

const playerHomeBase = {
  latitude: -23.3045,
  longitude: -51.1696,
  labelKey: "locations.londrina",
} as const;

export const currentPlayer: Player = {
  id: "player-current",
  name: "Abel",
  homeBase: playerHomeBase,
  mascotIds: ["mascot-nuvem", "mascot-trovao", "mascot-pipoca"],
};

export const nuvemDelivery: Delivery = {
  id: "delivery-nuvem-maringa",
  senderId: currentPlayer.id,
  receiverId: "friend-lisbon",
  mascotId: "mascot-nuvem",
  origin: playerHomeBase,
  destination: {
    latitude: -23.4205,
    longitude: -51.9333,
    labelKey: "locations.maringa",
  },
  distanceKm: 79,
  animalSpeedKmh: 62,
  outboundStartAt: "2026-07-18T12:00:00.000Z",
  outboundArrivalAt: "2026-07-18T18:00:00.000Z",
  returnStartAt: "2026-07-18T18:30:00.000Z",
  returnArrivalAt: "2026-07-19T00:30:00.000Z",
  status: "returning",
  rewardSeed: "nuvem-maringa-welcome-letter",
};

export const starterMascots: Mascot[] = [
  {
    id: "mascot-nuvem",
    name: "Nuvem",
    speciesKey: "species.carrierPigeon",
    level: 3,
    xp: 180,
    nextLevelXp: 260,
    attributes: {
      speed: 7,
      stamina: 8,
      orientation: 9,
      luck: 6,
    },
    trait: {
      id: "trait-steady-route",
      nameKey: "traits.steadyRoute.name",
      descriptionKey: "traits.steadyRoute.description",
      effect: "deliveryReward",
    },
    equipment: [
      {
        id: "equipment-nuvem-canvas-bag",
        nameKey: "equipment.canvasPostalBag.name",
        type: "bag",
        rarity: "common",
        equipped: true,
        descriptionKey: "equipment.canvasPostalBag.description",
        iconAssetPath: assetPaths.equipment.icon("canvas-postal-bag.webp"),
      },
      {
        id: "equipment-nuvem-blue-scarf",
        nameKey: "equipment.blueRouteScarf.name",
        type: "scarf",
        rarity: "uncommon",
        equipped: true,
        descriptionKey: "equipment.blueRouteScarf.description",
        iconAssetPath: assetPaths.equipment.icon("blue-route-scarf.webp"),
      },
    ],
    skills: [
      {
        id: "skill-nuvem-long-route",
        nameKey: "skills.longRoute.name",
        descriptionKey: "skills.longRoute.description",
        level: 2,
      },
      {
        id: "skill-nuvem-soft-landing",
        nameKey: "skills.softLanding.name",
        descriptionKey: "skills.softLanding.description",
        level: 1,
      },
    ],
    appearance: {
      primaryColor: "#f7f1e3",
      accentColor: "#6f91a8",
      portraitPlaceholderKey: "appearance.nuvemPortrait",
      portraitAssetPath: assetPaths.mascots.portrait("nuvem.webp"),
    },
    currentDelivery: nuvemDelivery,
  },
  {
    id: "mascot-trovao",
    name: "Trovão",
    speciesKey: "species.messengerFalcon",
    level: 4,
    xp: 220,
    nextLevelXp: 320,
    attributes: {
      speed: 10,
      stamina: 5,
      orientation: 8,
      luck: 5,
    },
    trait: {
      id: "trait-direct-flight",
      nameKey: "traits.directFlight.name",
      descriptionKey: "traits.directFlight.description",
      effect: "fastReturn",
    },
    equipment: [
      {
        id: "equipment-trovao-flight-goggles",
        nameKey: "equipment.flightGoggles.name",
        type: "goggles",
        rarity: "rare",
        equipped: true,
        descriptionKey: "equipment.flightGoggles.description",
        iconAssetPath: assetPaths.equipment.icon("flight-goggles.webp"),
      },
      {
        id: "equipment-trovao-red-badge",
        nameKey: "equipment.urgentBadge.name",
        type: "badge",
        rarity: "uncommon",
        equipped: true,
        descriptionKey: "equipment.urgentBadge.description",
        iconAssetPath: assetPaths.equipment.icon("urgent-badge.webp"),
      },
      {
        id: "equipment-trovao-travel-cap",
        nameKey: "equipment.travelCap.name",
        type: "cap",
        rarity: "common",
        equipped: false,
        descriptionKey: "equipment.travelCap.description",
        iconAssetPath: assetPaths.equipment.icon("travel-cap.webp"),
      },
    ],
    skills: [
      {
        id: "skill-trovao-quick-dispatch",
        nameKey: "skills.quickDispatch.name",
        descriptionKey: "skills.quickDispatch.description",
        level: 3,
      },
      {
        id: "skill-trovao-crosswind",
        nameKey: "skills.crosswindInstinct.name",
        descriptionKey: "skills.crosswindInstinct.description",
        level: 2,
      },
    ],
    appearance: {
      primaryColor: "#8b5e3c",
      accentColor: "#a44a3f",
      portraitPlaceholderKey: "appearance.trovaoPortrait",
      portraitAssetPath: assetPaths.mascots.portrait("trovao.webp"),
    },
  },
  {
    id: "mascot-pipoca",
    name: "Pipoca",
    speciesKey: "species.mailDuck",
    level: 2,
    xp: 95,
    nextLevelXp: 180,
    attributes: {
      speed: 5,
      stamina: 7,
      orientation: 6,
      luck: 10,
    },
    trait: {
      id: "trait-curious-finder",
      nameKey: "traits.curiousFinder.name",
      descriptionKey: "traits.curiousFinder.description",
      effect: "rareFind",
    },
    equipment: [
      {
        id: "equipment-pipoca-feather-charm",
        nameKey: "equipment.featherCharm.name",
        type: "charm",
        rarity: "rare",
        equipped: true,
        descriptionKey: "equipment.featherCharm.description",
        iconAssetPath: assetPaths.equipment.icon("feather-charm.webp"),
      },
      {
        id: "equipment-pipoca-small-satchel",
        nameKey: "equipment.smallSatchel.name",
        type: "bag",
        rarity: "common",
        equipped: true,
        descriptionKey: "equipment.smallSatchel.description",
        iconAssetPath: assetPaths.equipment.icon("small-satchel.webp"),
      },
    ],
    skills: [
      {
        id: "skill-pipoca-shiny-thing",
        nameKey: "skills.shinyThing.name",
        descriptionKey: "skills.shinyThing.description",
        level: 2,
      },
      {
        id: "skill-pipoca-detour",
        nameKey: "skills.happyDetour.name",
        descriptionKey: "skills.happyDetour.description",
        level: 1,
      },
    ],
    appearance: {
      primaryColor: "#fff8e8",
      accentColor: "#c49a4a",
      portraitPlaceholderKey: "appearance.pipocaPortrait",
      portraitAssetPath: assetPaths.mascots.portrait("pipoca.webp"),
    },
  },
];

export function getMascotById(mascotId: string) {
  return starterMascots.find((mascot) => mascot.id === mascotId);
}

export function getDeliveryById(deliveryId: string) {
  return starterMascots
    .map((mascot) => mascot.currentDelivery)
    .find((delivery) => delivery?.id === deliveryId);
}
