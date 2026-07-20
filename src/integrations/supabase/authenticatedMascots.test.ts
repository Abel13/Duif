import { describe, expect, it } from "vitest";

import type { DeliveryRow, PlayerMascotRow } from "./authenticatedMascots";
import {
  composeAuthenticatedMascots,
  mapDeliveryRowToDelivery,
  mapPlayerMascotRowToMascot,
  selectCurrentDelivery,
  selectDeliveryHistory,
} from "./authenticatedMascots";

const nuvemMascotRow: PlayerMascotRow = {
  appearance: {
    accentColor: "#6f91a8",
    portraitAssetKey: "mascot.portrait.nuvem",
    portraitPlaceholderKey: "appearance.nuvemPortrait",
    primaryColor: "#f7f1e3",
  },
  attributes: {
    luck: 6,
    orientation: 9,
    speed: 7,
    stamina: 8,
  },
  created_at: "2026-07-09T20:00:00.000Z",
  equipment: [
    {
      descriptionKey: "equipment.canvasPostalBag.description",
      equipped: true,
      iconAssetKey: "equipment.icon.canvasPostalBag",
      id: "equipment-nuvem-canvas-bag",
      nameKey: "equipment.canvasPostalBag.name",
      rarity: "common",
      type: "bag",
    },
  ],
  is_starter: true,
  id: "00000000-0000-4000-8000-000000000201",
  level: 3,
  name: "Nuvem",
  next_level_xp: 260,
  owner_profile_id: "00000000-0000-4000-8000-000000000001",
  skills: [
    {
      descriptionKey: "skills.longRoute.description",
      id: "skill-nuvem-long-route",
      level: 2,
      nameKey: "skills.longRoute.name",
    },
  ],
  template_id: "00000000-0000-4000-8000-000000000201",
  trait: {
    descriptionKey: "traits.steadyRoute.description",
    effect: "deliveryReward",
    id: "trait-steady-route",
    nameKey: "traits.steadyRoute.name",
  },
  updated_at: "2026-07-09T20:00:00.000Z",
  xp: 180,
};

const nuvemDeliveryRow: DeliveryRow = {
  is_tutorial: false,
  animal_speed_kmh: 62,
  correspondence_option_id: "00000000-0000-4000-8000-000000000401",
  created_at: "2026-07-09T20:00:00.000Z",
  destination_label_key: "locations.lisbon",
  destination_latitude: 38.7223,
  destination_longitude: -9.1393,
  distance_km: 7946,
  id: "00000000-0000-4000-8000-000000000501",
  mascot_id: "00000000-0000-4000-8000-000000000201",
  origin_label_key: "locations.saoPaulo",
  origin_latitude: -23.5505,
  origin_longitude: -46.6333,
  outbound_arrival_at: "2026-07-08T18:00:00.000Z",
  outbound_start_at: "2026-07-08T12:00:00.000Z",
  receiver_profile_id: "00000000-0000-4000-8000-000000000101",
  return_arrival_at: "2026-07-09T00:30:00.000Z",
  route_discovery_version: null,
  return_start_at: "2026-07-08T18:30:00.000Z",
  reward_seed: "nuvem-lisbon-welcome-letter",
  sender_profile_id: "00000000-0000-4000-8000-000000000001",
  status: "returning",
  travel_modifiers: null,
  updated_at: "2026-07-09T20:00:00.000Z",
};

describe("authenticated mascot mappers", () => {
  it("maps a player mascot row to the current Mascot model", () => {
    const mascot = mapPlayerMascotRowToMascot({
      row: nuvemMascotRow,
      speciesKey: "species.carrierPigeon",
    });

    expect(mascot).toMatchObject({
      id: nuvemMascotRow.id,
      name: "Nuvem",
      speciesKey: "species.carrierPigeon",
      level: 3,
      xp: 180,
      nextLevelXp: 260,
    });
    expect(mascot.currentDelivery).toBeUndefined();
    expect(mascot.equipment[0]?.id).toBe("equipment-nuvem-canvas-bag");
  });

  it("maps a delivery row to the current Delivery model", () => {
    const delivery = mapDeliveryRowToDelivery(nuvemDeliveryRow, "mascot-nuvem");

    expect(delivery).toMatchObject({
      id: nuvemDeliveryRow.id,
      mascotId: "mascot-nuvem",
      status: "returning",
      rewardSeed: "nuvem-lisbon-welcome-letter",
      origin: {
        labelKey: "locations.saoPaulo",
      },
      destination: {
        labelKey: "locations.lisbon",
      },
    });
  });

  it("maps the tutorial-only first journey boost without changing normal modifiers", () => {
    const delivery = mapDeliveryRowToDelivery({
      ...nuvemDeliveryRow,
      is_tutorial: true,
      travel_modifiers: {
        version: 1, preparationMinutes: 0.5, outboundSpeedMultiplier: 1,
        returnSpeedMultiplier: 1, discoveryRadiusMultiplier: 1,
        rarityWeightMultiplier: 1, longRouteConsistency: 1, isLongRoute: false,
        tutorialBoost: { kind: "firstJourney", version: 1, preparationSeconds: 30, outboundSeconds: 120, destinationSeconds: 30, returnSeconds: 120 },
      },
    }, "mascot-nuvem");

    expect(delivery.tutorialTravelBoost).toEqual({ kind: "firstJourney", version: 1, preparationSeconds: 30, outboundSeconds: 120, destinationSeconds: 30, returnSeconds: 120 });
    expect(delivery.travelModifiers?.outboundSpeedMultiplier).toBe(1);
  });

  it("selects the latest non-completed delivery as current delivery", () => {
    const completedDelivery = {
      ...nuvemDeliveryRow,
      created_at: "2026-07-10T20:00:00.000Z",
      id: "00000000-0000-4000-8000-000000000502",
      status: "completed" as const,
    };
    const activeDelivery = {
      ...nuvemDeliveryRow,
      created_at: "2026-07-09T20:00:00.000Z",
      id: "00000000-0000-4000-8000-000000000503",
      status: "returning" as const,
    };

    expect(selectCurrentDelivery([completedDelivery, activeDelivery])?.id).toBe(
      "00000000-0000-4000-8000-000000000503",
    );
  });

  it("keeps completed deliveries out of the current slot for history", () => {
    expect(selectCurrentDelivery([
      { ...nuvemDeliveryRow, status: "completed" },
    ])).toBeUndefined();
    expect(selectDeliveryHistory([
      { ...nuvemDeliveryRow, status: "completed" },
    ])).toHaveLength(1);
    expect(selectDeliveryHistory([
      { ...nuvemDeliveryRow, is_tutorial: true, status: "completed" },
    ])).toHaveLength(0);
  });

  it("composes authenticated mascots with their current delivery", () => {
    const mascots = composeAuthenticatedMascots({
      deliveryRows: [nuvemDeliveryRow],
      mascotRows: [nuvemMascotRow],
      speciesRows: [
        {
          id: "00000000-0000-4000-8000-000000000201",
          species_key: "species.carrierPigeon",
        },
      ],
    });

    expect(mascots).toHaveLength(1);
    expect(mascots[0]?.currentDelivery?.id).toBe(nuvemDeliveryRow.id);
  });

  it("returns an empty list when authenticated mascot rows are empty", () => {
    expect(
      composeAuthenticatedMascots({
        deliveryRows: [nuvemDeliveryRow],
        mascotRows: [],
        speciesRows: [],
      }),
    ).toEqual([]);
  });
});
