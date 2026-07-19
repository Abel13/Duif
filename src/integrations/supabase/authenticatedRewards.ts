import {
  type Delivery,
  type DeliveryReward,
  type InventoryItem,
  type RewardItem,
  type RouteRewardDiscovery,
} from "../../game";
import { mapDeliveryRowToDelivery, type DeliveryRow } from "./authenticatedMascots";
import { readString, readTranslationKey } from "./catalogMappers";
import { getSupabaseClient } from "./client";
import type { Database, Json } from "./database.types";
import { mapInventoryItemRow, type InventoryItemRow } from "./inventoryMappers";

export type RewardItemRow = Database["public"]["Tables"]["reward_items"]["Row"];
export type DeliveryRewardRow = Database["public"]["Tables"]["delivery_rewards"]["Row"];
export type DeliveryRouteDiscoveryRow = Database["public"]["Tables"]["delivery_route_discoveries"]["Row"];
export type RouteRewardPointRow = Database["public"]["Tables"]["route_reward_points"]["Row"];
export type PlayerMascotRouteRow = Pick<
  Database["public"]["Tables"]["player_mascots"]["Row"],
  "id" | "mock_key"
>;

export type AuthenticatedRewardCollection = {
  delivery: Delivery;
  inventoryCount: number;
  isCollected: boolean;
  reward?: DeliveryReward;
  routeDiscoveries: RouteRewardDiscovery[];
};

export type CollectedRewardResult = {
  delivery: Delivery;
  inventoryItem: InventoryItem;
  reward: DeliveryReward;
  routeInventoryItems: InventoryItem[];
};

type CollectionRpcPayload = {
  delivery: DeliveryRow;
  inventoryItem: InventoryItemRow;
  reward: DeliveryRewardRow;
  rewardItem: RewardItemRow;
  routeInventoryItems?: InventoryItemRow[];
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

export function mapPersistedRouteDiscovery({
  discoveryRow,
  itemRow,
  pointRow,
}: {
  discoveryRow: DeliveryRouteDiscoveryRow;
  itemRow: RewardItemRow;
  pointRow: RouteRewardPointRow;
}): RouteRewardDiscovery {
  return {
    coordinates: { latitude: pointRow.latitude, longitude: pointRow.longitude },
    descriptionKey: readTranslationKey(pointRow.description_key, "map.rewards.londrinaPostcard.description"),
    discovered: false,
    distanceFromRouteKm: discoveryRow.distance_from_route_km,
    id: readString(pointRow.mock_key, discoveryRow.id),
    kind: readRouteRewardKind(pointRow.kind),
    rarity: itemRow.rarity,
    regionKind: readRouteRegionKind(pointRow.region_kind),
    regionLabel: pointRow.region_label,
    routeProgress: discoveryRow.route_progress,
    thumbnailAssetPath: itemRow.thumbnail_asset_path ?? undefined,
    titleKey: readTranslationKey(pointRow.title_key, "map.rewards.londrinaPostcard.name"),
  };
}

export function composeAuthenticatedRewardCollection({
  delivery,
  inventoryCount,
  rewardItemRow,
  rewardRow,
  routeDiscoveries = [],
}: {
  delivery: Delivery;
  inventoryCount: number;
  rewardItemRow?: RewardItemRow;
  rewardRow?: DeliveryRewardRow;
  routeDiscoveries?: RouteRewardDiscovery[];
}): AuthenticatedRewardCollection {
  const persistedReward =
    rewardRow && rewardItemRow
      ? mapDeliveryRewardRowToReward({ itemRow: rewardItemRow, rewardRow })
      : undefined;

  return {
    delivery,
    inventoryCount,
    isCollected: Boolean(rewardRow?.collected_at),
    reward: persistedReward,
    routeDiscoveries,
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
    routeInventoryItems: Array.isArray(payload.routeInventoryItems)
      ? payload.routeInventoryItems.map(mapInventoryItemRow)
      : [],
  };
}

function readRouteRewardKind(value: string): RouteRewardDiscovery["kind"] {
  return value === "badge" || value === "postcard" || value === "stamp" ||
    value === "souvenir" || value === "material" || value === "eventItem"
    ? value
    : "souvenir";
}

function readRouteRegionKind(value: string): RouteRewardDiscovery["regionKind"] {
  return value === "city" || value === "state" || value === "country" || value === "event"
    ? value
    : "country";
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

async function fetchPersistedRouteDiscoveries(
  deliveryId: string,
): Promise<RouteRewardDiscovery[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: discoveryRows } = await supabase
    .from("delivery_route_discoveries")
    .select("*")
    .eq("delivery_id", deliveryId)
    .order("route_progress");

  if (!discoveryRows || discoveryRows.length === 0) return [];

  const [{ data: pointRows }, { data: itemRows }] = await Promise.all([
    supabase
      .from("route_reward_points")
      .select("*")
      .in("id", discoveryRows.map((row) => row.route_reward_point_id)),
    supabase
      .from("reward_items")
      .select("*")
      .in("id", discoveryRows.map((row) => row.reward_item_id)),
  ]);

  const pointsById = new Map((pointRows ?? []).map((row) => [row.id, row]));
  const itemsById = new Map((itemRows ?? []).map((row) => [row.id, row]));

  return discoveryRows.flatMap((discoveryRow) => {
    const pointRow = pointsById.get(discoveryRow.route_reward_point_id);
    const itemRow = itemsById.get(discoveryRow.reward_item_id);
    return pointRow && itemRow
      ? [mapPersistedRouteDiscovery({ discoveryRow, itemRow, pointRow })]
      : [];
  });
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

  const [{ data: rewardRow }, { count: inventoryCount }, routeDiscoveries] = await Promise.all([
    supabase
      .from("delivery_rewards")
      .select("*")
      .eq("delivery_id", deliveryRow.id)
      .maybeSingle(),
    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .eq("owner_profile_id", profileId),
    delivery.routeDiscoveryVersion
      ? fetchPersistedRouteDiscoveries(deliveryRow.id)
      : Promise.resolve([]),
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
    routeDiscoveries,
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
