import { describe, expect, it } from "vitest";

import type {
  DeliveryRouteDiscoveryRow,
  DeliveryRewardRow,
  RewardItemRow,
  RouteRewardPointRow,
} from "./authenticatedRewards";
import {
  composeAuthenticatedRewardCollection,
  mapCollectRewardPayload,
  mapDeliveryRewardRowToReward,
  mapPersistedRouteDiscovery,
  mapRewardItemRowToRewardItem,
} from "./authenticatedRewards";
import type { DeliveryRow } from "./authenticatedMascots";
import { mapDeliveryRowToDelivery } from "./authenticatedMascots";
import { mapInventoryItemRow, type InventoryItemRow } from "./inventoryMappers";

const rewardItemRow: RewardItemRow = {
  catalog_key: "reward-golden-compass-pin",
  description_key: "rewards.items.goldenCompassPin.description",
  id: "00000000-0000-4000-8000-000000000603",
  name_key: "rewards.items.goldenCompassPin.name",
  rarity: "rare",
  status: "active",
  thumbnail_asset_path: "/assets/items/thumbnails/golden-compass-pin.webp",
};

const deliveryRewardRow: DeliveryRewardRow = {
  collected_at: null,
  created_at: "2026-07-10T15:00:00.000Z",
  delivery_id: "00000000-0000-4000-8000-000000000501",
  id: "00000000-0000-4000-8000-000000000701",
  reward_item_id: "00000000-0000-4000-8000-000000000603",
  xp_gained: 40,
};

const inventoryItemRow: InventoryItemRow = {
  category: "keepsakes",
  collected_at: "2026-07-10T15:05:00.000Z",
  created_at: "2026-07-10T15:05:00.000Z",
  description_key: "rewards.items.goldenCompassPin.description",
  equipped: false,
  id: "00000000-0000-4000-8000-000000000901",
  delivery_reward_id: deliveryRewardRow.id,
  name_key: "rewards.items.goldenCompassPin.name",
  owner_profile_id: "00000000-0000-4000-8000-000000000001",
  rarity: "rare",
  reward_item_id: "00000000-0000-4000-8000-000000000603",
  source_key: "inventory.sources.routeReward",
  thumbnail_asset_path: "/assets/items/thumbnails/golden-compass-pin.webp",
};

const deliveryRow: DeliveryRow = {
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

const routePointRow: RouteRewardPointRow = {
  catalog_key: "route-reward-londrina-postcard",
  created_at: "2026-07-18T20:00:00.000Z",
  description_key: "map.rewards.londrinaPostcard.description",
  eligibility_radius_km: 18,
  id: "00000000-0000-4000-8000-000000001001",
  inventory_category: "keepsakes",
  kind: "postcard",
  latitude: -23.3045,
  longitude: -51.1696,
  region_kind: "city",
  region_label_key: "locations.londrina",
  reward_item_id: "00000000-0000-4000-8000-000000000611",
  sort_order: 10,
  status: "active",
  title_key: "map.rewards.londrinaPostcard.name",
};

const routeDiscoveryRow: DeliveryRouteDiscoveryRow = {
  collected_at: null,
  created_at: "2026-07-18T20:00:00.000Z",
  delivery_id: deliveryRow.id,
  distance_from_route_km: 0,
  id: "00000000-0000-4000-8000-000000002001",
  inventory_item_id: null,
  reward_item_id: routePointRow.reward_item_id,
  route_progress: 0,
  route_reward_point_id: routePointRow.id,
};

describe("authenticated reward mappers", () => {
  it("maps reward item rows to app reward items", () => {
    expect(mapRewardItemRowToRewardItem(rewardItemRow)).toEqual({
      descriptionKey: "rewards.items.goldenCompassPin.description",
      id: rewardItemRow.id,
      nameKey: "rewards.items.goldenCompassPin.name",
      rarity: "rare",
      thumbnailAssetPath: "/assets/items/thumbnails/golden-compass-pin.webp",
    });
  });

  it("maps delivery reward rows with their item", () => {
    expect(
      mapDeliveryRewardRowToReward({
        itemRow: rewardItemRow,
        rewardRow: deliveryRewardRow,
      }),
    ).toMatchObject({
      id: deliveryRewardRow.id,
      item: {
        id: rewardItemRow.id,
      },
      xpGained: 40,
    });
  });

  it("maps collected inventory item rows", () => {
    expect(mapInventoryItemRow(inventoryItemRow)).toMatchObject({
      category: "keepsakes",
      id: inventoryItemRow.id,
      sourceKey: "inventory.sources.routeReward",
    });
  });

  it("maps persisted discoveries without deciding their temporal visibility", () => {
    expect(mapPersistedRouteDiscovery({
      discoveryRow: routeDiscoveryRow,
      itemRow: {
        ...rewardItemRow,
        id: routePointRow.reward_item_id,
        catalog_key: "reward-londrina-postcard",
        rarity: "common",
      },
      pointRow: routePointRow,
    })).toMatchObject({
      discovered: false,
      id: routeDiscoveryRow.id,
      kind: "postcard",
      regionLabel: "locations.londrina",
      routeProgress: 0,
    });
  });

  it("composes collected authenticated reward state", () => {
    const delivery = mapDeliveryRowToDelivery(deliveryRow, "mascot-nuvem");
    const state = composeAuthenticatedRewardCollection({
      delivery,
      inventoryCount: 4,
      rewardItemRow,
      rewardRow: {
        ...deliveryRewardRow,
        collected_at: "2026-07-10T15:05:00.000Z",
      },
    });

    expect(state).toMatchObject({
      inventoryCount: 4,
      isCollected: true,
      reward: {
        xpGained: 40,
      },
    });
  });

  it("does not invent a reward when no persisted reward exists", () => {
    const delivery = mapDeliveryRowToDelivery(deliveryRow, "mascot-nuvem");
    const state = composeAuthenticatedRewardCollection({
      delivery,
      inventoryCount: 3,
    });

    expect(state.isCollected).toBe(false);
    expect(state.reward).toBeUndefined();
  });

  it("maps valid collect RPC payloads", () => {
    const result = mapCollectRewardPayload(
      {
        delivery: {
          ...deliveryRow,
          status: "completed",
        },
        inventoryItem: inventoryItemRow,
        reward: {
          ...deliveryRewardRow,
          collected_at: "2026-07-10T15:05:00.000Z",
        },
        rewardItem: rewardItemRow,
        routeInventoryItems: [
          {
            ...inventoryItemRow,
            id: "00000000-0000-4000-8000-000000000902",
            delivery_reward_id: null,
          },
        ],
      },
      "mascot-nuvem",
    );

    expect(result?.delivery.status).toBe("completed");
    expect(result?.inventoryItem.id).toBe(inventoryItemRow.id);
    expect(result?.reward.item.id).toBe(rewardItemRow.id);
    expect(result?.routeInventoryItems).toHaveLength(1);
  });

  it("ignores invalid collect RPC payloads", () => {
    expect(mapCollectRewardPayload({ reward: deliveryRewardRow }, "mascot-nuvem")).toBeUndefined();
  });
});
