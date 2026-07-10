import {
  createMockRewardFromDelivery,
  type Delivery,
  type DeliveryReward,
  type InventoryItem,
  type RewardItem,
} from "../../game";
import type { TranslationKey } from "../../i18n";
import { mapDeliveryRowToDelivery, type DeliveryRow } from "./authenticatedMascots";
import { readString, readTranslationKey } from "./catalogMappers";
import { getSupabaseClient } from "./client";
import type { Database, Json } from "./database.types";

export type RewardItemRow = Database["public"]["Tables"]["reward_items"]["Row"];
export type DeliveryRewardRow = Database["public"]["Tables"]["delivery_rewards"]["Row"];
export type InventoryItemRow = Database["public"]["Tables"]["inventory_items"]["Row"];
export type PlayerMascotRouteRow = Pick<
  Database["public"]["Tables"]["player_mascots"]["Row"],
  "id" | "mock_key"
>;

export type AuthenticatedRewardCollection = {
  delivery: Delivery;
  inventoryCount: number;
  isCollected: boolean;
  reward?: DeliveryReward;
};

export type CollectedRewardResult = {
  delivery: Delivery;
  inventoryItem: InventoryItem;
  reward: DeliveryReward;
};

type CollectionRpcPayload = {
  delivery: DeliveryRow;
  inventoryItem: InventoryItemRow;
  reward: DeliveryRewardRow;
  rewardItem: RewardItemRow;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasCollectionPayload(value: unknown): value is CollectionRpcPayload {
  if (!isObject(value)) {
    return false;
  }

  return (
    isObject(value.delivery) &&
    isObject(value.inventoryItem) &&
    isObject(value.reward) &&
    isObject(value.rewardItem)
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function mapRewardItemRowToRewardItem(row: RewardItemRow): RewardItem {
  return {
    descriptionKey: readTranslationKey(row.description_key, "rewards.items.wornRouteStamp.description"),
    id: readString(row.mock_key, row.id),
    nameKey: readTranslationKey(row.name_key, "rewards.items.wornRouteStamp.name"),
    rarity: row.rarity,
    thumbnailAssetPath: row.thumbnail_asset_path ?? undefined,
  };
}

export function mapDeliveryRewardRowToReward({
  itemRow,
  rewardRow,
}: {
  itemRow: RewardItemRow;
  rewardRow: DeliveryRewardRow;
}): DeliveryReward {
  return {
    deliveryId: readString(rewardRow.mock_key, rewardRow.delivery_id),
    id: readString(rewardRow.mock_key, rewardRow.id),
    item: mapRewardItemRowToRewardItem(itemRow),
    xpGained: rewardRow.xp_gained,
  };
}

export function mapInventoryItemRow(row: InventoryItemRow): InventoryItem {
  return {
    category: row.category,
    collectedAt: row.collected_at,
    descriptionKey: readTranslationKey(row.description_key, "rewards.items.wornRouteStamp.description"),
    equipped: row.equipped,
    id: readString(row.mock_key, row.id),
    nameKey: readTranslationKey(row.name_key, "rewards.items.wornRouteStamp.name"),
    rarity: row.rarity,
    sourceKey: row.source_key ? (row.source_key as TranslationKey) : undefined,
    thumbnailAssetPath: row.thumbnail_asset_path ?? undefined,
  };
}

export function composeAuthenticatedRewardCollection({
  delivery,
  inventoryCount,
  rewardItemRow,
  rewardRow,
}: {
  delivery: Delivery;
  inventoryCount: number;
  rewardItemRow?: RewardItemRow;
  rewardRow?: DeliveryRewardRow;
}): AuthenticatedRewardCollection {
  const persistedReward =
    rewardRow && rewardItemRow
      ? mapDeliveryRewardRowToReward({ itemRow: rewardItemRow, rewardRow })
      : undefined;

  return {
    delivery,
    inventoryCount,
    isCollected: Boolean(rewardRow?.collected_at),
    reward: persistedReward ?? createMockRewardFromDelivery(delivery),
  };
}

export function mapCollectRewardPayload(
  payload: Json,
  mascotPublicId: string,
): CollectedRewardResult | undefined {
  if (!hasCollectionPayload(payload)) {
    return undefined;
  }

  const delivery = mapDeliveryRowToDelivery(payload.delivery, mascotPublicId);

  return {
    delivery,
    inventoryItem: mapInventoryItemRow(payload.inventoryItem),
    reward: mapDeliveryRewardRowToReward({
      itemRow: payload.rewardItem,
      rewardRow: payload.reward,
    }),
  };
}

async function fetchDeliveryByPublicId(deliveryId: string) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const query = supabase.from("deliveries").select("*").limit(1);
  const { data } = isUuid(deliveryId)
    ? await query.or(`id.eq.${deliveryId},mock_key.eq.${deliveryId}`).maybeSingle()
    : await query.eq("mock_key", deliveryId).maybeSingle();

  return data ?? undefined;
}

async function fetchMascotPublicId(mascotId: string) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data } = await supabase
    .from("player_mascots")
    .select("id, mock_key")
    .eq("id", mascotId)
    .maybeSingle();

  return data?.mock_key ?? data?.id;
}

export async function fetchAuthenticatedRewardCollection(
  deliveryId: string,
  profileId: string,
): Promise<AuthenticatedRewardCollection | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const deliveryRow = await fetchDeliveryByPublicId(deliveryId);

  if (!deliveryRow) {
    return undefined;
  }

  const mascotPublicId = (await fetchMascotPublicId(deliveryRow.mascot_id)) ?? "mascot-nuvem";
  const delivery = mapDeliveryRowToDelivery(deliveryRow, mascotPublicId);

  const [{ data: rewardRow }, { count: inventoryCount }] = await Promise.all([
    supabase
      .from("delivery_rewards")
      .select("*")
      .eq("delivery_id", deliveryRow.id)
      .maybeSingle(),
    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .eq("owner_profile_id", profileId),
  ]);

  const rewardItemRow = rewardRow
    ? await supabase
        .from("reward_items")
        .select("*")
        .eq("id", rewardRow.reward_item_id)
        .maybeSingle()
        .then(({ data }) => data ?? undefined)
    : undefined;

  return composeAuthenticatedRewardCollection({
    delivery,
    inventoryCount: inventoryCount ?? 0,
    rewardItemRow,
    rewardRow: rewardRow ?? undefined,
  });
}

export async function collectAuthenticatedReward({
  deliveryId,
  mascotId,
}: {
  deliveryId: string;
  mascotId: string;
}): Promise<CollectedRewardResult | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase.rpc("collect_delivery_reward", {
    delivery_public_id: deliveryId,
  });

  if (error || !data) {
    throw error ?? new Error("Reward was not collected.");
  }

  return mapCollectRewardPayload(data, mascotId);
}
