import { describe, expect, it } from "vitest";

import type { DeliveryRow, PlayerMascotRow } from "./authenticatedMascots";
import {
  composeAuthenticatedMascots,
  mapDeliveryRowToDelivery,
  mapPlayerMascotRowToMascot,
  selectCurrentDelivery,
} from "./authenticatedMascots";

const nuvemMascotRow: PlayerMascotRow = {
  appearance: {
    accentColor: "#6f91a8",
    portraitAssetPath: "/assets/mascots/portraits/nuvem.webp",
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
      iconAssetPath: "/assets/equipment/icons/canvas-postal-bag.webp",
      id: "equipment-nuvem-canvas-bag",
      nameKey: "equipment.canvasPostalBag.name",
      rarity: "common",
      type: "bag",
    },
  ],
  id: "00000000-0000-4000-8000-000000000201",
  level: 3,
  mock_key: "mascot-nuvem",
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
  animal_speed_kmh: 62,
  correspondence_option_id: "00000000-0000-4000-8000-000000000401",
  created_at: "2026-07-09T20:00:00.000Z",
  destination_label_key: "locations.lisbon",
  destination_latitude: 38.7223,
  destination_longitude: -9.1393,
  distance_km: 7946,
  id: "00000000-0000-4000-8000-000000000501",
  mascot_id: "00000000-0000-4000-8000-000000000201",
  mock_key: "delivery-nuvem-lisbon",
  origin_label_key: "locations.saoPaulo",
  origin_latitude: -23.5505,
  origin_longitude: -46.6333,
  outbound_arrival_at: "2026-07-08T18:00:00.000Z",
  outbound_start_at: "2026-07-08T12:00:00.000Z",
  receiver_profile_id: "00000000-0000-4000-8000-000000000101",
  return_arrival_at: "2026-07-09T00:30:00.000Z",
  return_start_at: "2026-07-08T18:30:00.000Z",
  reward_seed: "nuvem-lisbon-welcome-letter",
  sender_profile_id: "00000000-0000-4000-8000-000000000001",
  status: "returning",
  updated_at: "2026-07-09T20:00:00.000Z",
};

describe("authenticated mascot mappers", () => {
  it("maps a player mascot row to the current Mascot model", () => {
    const mascot = mapPlayerMascotRowToMascot({
      row: nuvemMascotRow,
      speciesKey: "species.carrierPigeon",
    });

    expect(mascot).toMatchObject({
      id: "mascot-nuvem",
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
      id: "delivery-nuvem-lisbon",
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

  it("selects the latest non-completed delivery as current delivery", () => {
    const completedDelivery = {
      ...nuvemDeliveryRow,
      created_at: "2026-07-10T20:00:00.000Z",
      mock_key: "delivery-completed",
      status: "completed" as const,
    };
    const activeDelivery = {
      ...nuvemDeliveryRow,
      created_at: "2026-07-09T20:00:00.000Z",
      mock_key: "delivery-active",
      status: "returning" as const,
    };

    expect(selectCurrentDelivery([completedDelivery, activeDelivery])?.mock_key).toBe(
      "delivery-active",
    );
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
    expect(mascots[0]?.currentDelivery?.id).toBe("delivery-nuvem-lisbon");
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
