import type { TranslationKey } from "../../i18n";
import { isOfficialAssetKey } from "../../game/assets";
import {
  getPostalTrafficPetPosition,
  type PostalTrafficFriendshipState,
  type PostalTrafficPet,
  type PostalTrafficPetSnapshot,
  type PostalTrafficQueryAnchor,
} from "../../game/postalTraffic";
import { getSupabaseClient } from "./client";
import type { Database } from "./database.types";

type GeneratedTrafficRow = Database["public"]["Functions"]["get_nearby_postal_traffic"]["Returns"][number];
type TrafficRow = Omit<GeneratedTrafficRow, "friend_id" | "friend_name" | "prestige_asset_key"> & {
  friend_id: string | null;
  friend_name: string | null;
  prestige_asset_key: string | null;
};
const fallbackRegionKey = "postalTraffic.regions.paranaBrazil" as TranslationKey;
const fallbackTraitKey = "traits.steadyRoute.name" as TranslationKey;

function mapFriendshipState(value: string | null | undefined): PostalTrafficFriendshipState {
  if (value === "friend" || value === "outgoing" || value === "incoming") return value;
  return "none";
}

export async function fetchAuthenticatedPostalTraffic(
  anchor: PostalTrafficQueryAnchor,
  now = new Date(),
): Promise<PostalTrafficPetSnapshot[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_nearby_postal_traffic", {
    center_latitude: anchor.center.latitude,
    center_longitude: anchor.center.longitude,
    viewport_north: anchor.viewport.north,
    viewport_east: anchor.viewport.east,
    viewport_south: anchor.viewport.south,
    viewport_west: anchor.viewport.west,
  });
  if (error) throw error;
  return data.map((row) => mapTrafficRow(row, now));
}

export function mapTrafficRow(row: TrafficRow, now = new Date()): PostalTrafficPetSnapshot {
  if (!isOfficialAssetKey(row.portrait_asset_key)) throw new Error("Invalid postal traffic portrait asset key");
  const prestigeAssetKey = row.prestige_asset_key && isOfficialAssetKey(row.prestige_asset_key)
    ? row.prestige_asset_key
    : undefined;
  const route = {
    origin: { latitude: row.origin_latitude, longitude: row.origin_longitude },
    destination: { latitude: row.destination_latitude, longitude: row.destination_longitude },
    originRegionKey: fallbackRegionKey,
    originRegionLabel: row.origin_region,
    destinationRegionKey: fallbackRegionKey,
    destinationRegionLabel: row.destination_region,
    outboundStartAt: row.outbound_start_at,
    outboundArrivalAt: row.outbound_arrival_at,
    returnStartAt: row.return_start_at ?? undefined,
    returnArrivalAt: row.return_arrival_at ?? undefined,
  };
  const friendshipState = mapFriendshipState(row.friendship_state);
  const basePet = {
    friendshipState,
    id: row.traffic_id,
    mascotLevel: Math.max(1, Math.trunc(row.mascot_level || 1)),
    mascotName: row.mascot_name,
    portraitAssetKey: row.portrait_asset_key,
    prestigeAssetKey,
    route,
    speciesKey: row.species_key as TranslationKey,
    traitNameKey: (row.trait_name_key || fallbackTraitKey) as TranslationKey,
  };
  const pet: PostalTrafficPet = row.visibility === "friend" && row.friend_id && row.friend_name
    ? { ...basePet, visibility: "friend", friendId: row.friend_id, friendName: row.friend_name, friendshipState: "friend" }
    : { ...basePet, visibility: "public", friendshipState: friendshipState === "friend" ? "none" : friendshipState };
  const position = getPostalTrafficPetPosition(pet, now);
  const base = {
    coordinates: position.coordinates,
    destinationRegionKey: route.destinationRegionKey,
    destinationRegionLabel: route.destinationRegionLabel,
    distanceFromMascotKm: row.distance_km,
    friendshipState: pet.friendshipState,
    id: pet.id,
    label: pet.mascotName,
    leg: position.leg,
    mascotLevel: pet.mascotLevel,
    mascotName: pet.mascotName,
    originRegionKey: route.originRegionKey,
    originRegionLabel: route.originRegionLabel,
    portraitAssetKey: pet.portraitAssetKey,
    prestigeAssetKey: pet.prestigeAssetKey,
    progress: Math.round(position.progress * 100),
    route,
    speciesKey: pet.speciesKey,
    traitNameKey: pet.traitNameKey,
    visualPhase: "entering" as const,
  };
  return pet.visibility === "friend"
    ? { ...base, visibility: "friend", friendId: pet.friendId, friendName: pet.friendName }
    : { ...base, visibility: "public" };
}
