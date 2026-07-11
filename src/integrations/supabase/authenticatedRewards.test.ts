import { describe, expect, it } from "vitest";

import type {
  DeliveryRewardRow,
  RewardItemRow,
} from "./authenticatedRewards";
import {
  composeAuthenticatedRewardCollection,
  mapCollectRewardPayload,
  mapDeliveryRewardRowToReward,
  mapRewardItemRowToRewardItem,
} from "./authenticatedRewards";
import type { DeliveryRow } from "./authenticatedMascots";
import { mapDeliveryRowToDelivery } from "./authenticatedMascots";
import { mapInventoryItemRow, type InventoryItemRow } from "./inventoryMappers";

const rewardItemRow: RewardItemRow = {
  description_key: "rewards.items.goldenCompassPin.description",
  id: "00000000-0000-4000-8000-000000000603",
  mock_key: "reward-golden-compass-pin",
  name_key: "rewards.items.goldenCompassPin.name",
  rarity: "rare",
  thumbnail_asset_path: "/assets/items/thumbnails/golden-compass-pin.webp",
};

const deliveryRewardRow: DeliveryRewardRow = {
  collected_at: null,
  created_at: "2026-07-10T15:00:00.000Z",
  delivery_id: "00000000-0000-4000-8000-000000000501",
  id: "00000000-0000-4000-8000-000000000701",
  mock_key: "reward-delivery-nuvem-lisbon",
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
  mock_key: "inventory-reward-delivery-nuvem-lisbon",
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

describe("authenticated reward mappers", () => {
  it("maps reward item rows to app reward items", () => {
    expect(mapRewardItemRowToRewardItem(rewardItemRow)).toEqual({
      descriptionKey: "rewards.items.goldenCompassPin.description",
      id: "reward-golden-compass-pin",
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
      id: "reward-delivery-nuvem-lisbon",
      item: {
        id: "reward-golden-compass-pin",
      },
      xpGained: 40,
    });
  });

  it("maps collected inventory item rows", () => {
    expect(mapInventoryItemRow(inventoryItemRow)).toMatchObject({
      category: "keepsakes",
      id: "inventory-reward-delivery-nuvem-lisbon",
      sourceKey: "inventory.sources.routeReward",
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

  it("falls back to deterministic mock reward when no persisted reward exists", () => {
    const delivery = mapDeliveryRowToDelivery(deliveryRow, "mascot-nuvem");
    const state = composeAuthenticatedRewardCollection({
      delivery,
      inventoryCount: 3,
    });

    expect(state.isCollected).toBe(false);
    expect(state.reward?.id).toBe("reward-delivery-nuvem-lisbon");
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
      },
      "mascot-nuvem",
    );

    expect(result?.delivery.status).toBe("completed");
    expect(result?.inventoryItem.id).toBe("inventory-reward-delivery-nuvem-lisbon");
    expect(result?.reward.item.id).toBe("reward-golden-compass-pin");
  });

  it("ignores invalid collect RPC payloads", () => {
    expect(mapCollectRewardPayload({ reward: deliveryRewardRow }, "mascot-nuvem")).toBeUndefined();
  });
});
