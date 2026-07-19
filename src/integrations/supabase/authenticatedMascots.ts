import { getMascotById, starterMascots } from "../../game/mockData";
import type { Delivery, Mascot, MascotTravelModifiers } from "../../game/types";
import type { TranslationKey } from "../../i18n";
import { getSupabaseClient } from "./client";
import {
  STARTER_MASCOT_IDS,
  mapAppearance,
  mapAttributes,
  mapEquipment,
  mapSkills,
  mapTrait,
  readNumber,
  readString,
  readTranslationKey,
  type MascotTemplateRow,
} from "./catalogMappers";
import type { Database } from "./database.types";

export type PlayerMascotRow = Database["public"]["Tables"]["player_mascots"]["Row"];
export type DeliveryRow = Database["public"]["Tables"]["deliveries"]["Row"];
export type MascotSpeciesRow = Pick<MascotTemplateRow, "id" | "species_key">;

function getStarterMascotOrder(mascotId: string) {
  return (STARTER_MASCOT_IDS as readonly string[]).indexOf(mascotId);
}

function getMascotPublicId(row: PlayerMascotRow) {
  return row.mock_key ?? row.id;
}

export function mapDeliveryRowToDelivery(row: DeliveryRow, mascotPublicId: string): Delivery {
  return {
    animalSpeedKmh: readNumber(row.animal_speed_kmh, 1),
    destination: {
      labelKey: row.destination_label_key as TranslationKey,
      latitude: readNumber(row.destination_latitude, 0),
      longitude: readNumber(row.destination_longitude, 0),
    },
    distanceKm: readNumber(row.distance_km, 0),
    id: readString(row.mock_key, row.id),
    mascotId: mascotPublicId,
    origin: {
      labelKey: row.origin_label_key as TranslationKey,
      latitude: readNumber(row.origin_latitude, 0),
      longitude: readNumber(row.origin_longitude, 0),
    },
    outboundArrivalAt: row.outbound_arrival_at,
    outboundStartAt: row.outbound_start_at,
    receiverId: row.receiver_profile_id,
    returnArrivalAt: row.return_arrival_at ?? undefined,
    returnStartAt: row.return_start_at ?? undefined,
    rewardSeed: row.reward_seed,
    routeDiscoveryVersion: row.route_discovery_version ?? undefined,
    senderId: row.sender_profile_id,
    status: row.status,
    travelModifiers: mapTravelModifiers(row.travel_modifiers),
  };
}

function mapTravelModifiers(value: DeliveryRow["travel_modifiers"]): MascotTravelModifiers | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Record<string, unknown>;
  const numericKeys = [
    "preparationMinutes",
    "outboundSpeedMultiplier",
    "returnSpeedMultiplier",
    "discoveryRadiusMultiplier",
    "rarityWeightMultiplier",
    "longRouteConsistency",
  ] as const;

  if (
    candidate.version !== 1 ||
    typeof candidate.isLongRoute !== "boolean" ||
    numericKeys.some((key) => typeof candidate[key] !== "number" || !Number.isFinite(candidate[key]))
  ) {
    return undefined;
  }

  return candidate as MascotTravelModifiers;
}

export function selectCurrentDelivery(deliveries: DeliveryRow[]) {
  const activeDeliveries = deliveries.filter((delivery) => delivery.status !== "completed");
  return [...activeDeliveries].sort(
    (firstDelivery, secondDelivery) =>
      new Date(secondDelivery.created_at).getTime() - new Date(firstDelivery.created_at).getTime(),
  )[0];
}

export function selectDeliveryHistory(deliveries: DeliveryRow[]) {
  return deliveries
    .filter((delivery) => delivery.status === "completed")
    .sort(
      (firstDelivery, secondDelivery) =>
        new Date(secondDelivery.updated_at).getTime() - new Date(firstDelivery.updated_at).getTime(),
    );
}

export function mapPlayerMascotRowToMascot({
  currentDelivery,
  row,
  speciesKey,
}: {
  currentDelivery?: Delivery;
  row: PlayerMascotRow;
  speciesKey?: string;
}): Mascot {
  const fallbackMascot = getMascotById(getMascotPublicId(row)) ?? starterMascots[0];

  return {
    appearance: mapAppearance(row.appearance, fallbackMascot.appearance),
    attributes: mapAttributes(row.attributes, fallbackMascot.attributes),
    currentDelivery,
    equipment: mapEquipment(row.equipment, fallbackMascot.equipment),
    id: getMascotPublicId(row),
    level: readNumber(row.level, fallbackMascot.level),
    name: readString(row.name, fallbackMascot.name),
    nextLevelXp: readNumber(row.next_level_xp, fallbackMascot.nextLevelXp),
    skills: mapSkills(row.skills, fallbackMascot.skills),
    speciesKey: readTranslationKey(speciesKey, fallbackMascot.speciesKey),
    trait: mapTrait(row.trait, fallbackMascot.trait),
    xp: readNumber(row.xp, fallbackMascot.xp),
  };
}

export function composeAuthenticatedMascots({
  deliveryRows,
  mascotRows,
  speciesRows,
}: {
  deliveryRows: DeliveryRow[];
  mascotRows: PlayerMascotRow[];
  speciesRows: MascotSpeciesRow[];
}) {
  if (mascotRows.length === 0) {
    return [];
  }

  const speciesKeyByTemplateId = new Map(
    speciesRows.map((speciesRow) => [speciesRow.id, speciesRow.species_key]),
  );

  return mascotRows
    .map((mascotRow) => {
      const mascotPublicId = getMascotPublicId(mascotRow);
      const selectedDelivery = selectCurrentDelivery(
        deliveryRows.filter((deliveryRow) => deliveryRow.mascot_id === mascotRow.id),
      );

      return mapPlayerMascotRowToMascot({
        currentDelivery: selectedDelivery
          ? mapDeliveryRowToDelivery(selectedDelivery, mascotPublicId)
          : undefined,
        row: mascotRow,
        speciesKey: speciesKeyByTemplateId.get(mascotRow.template_id),
      });
    })
    .sort((firstMascot, secondMascot) => {
      const firstIndex = getStarterMascotOrder(firstMascot.id);
      const secondIndex = getStarterMascotOrder(secondMascot.id);

      if (firstIndex === -1 && secondIndex === -1) {
        return firstMascot.name.localeCompare(secondMascot.name);
      }

      if (firstIndex === -1) {
        return 1;
      }

      if (secondIndex === -1) {
        return -1;
      }

      return firstIndex - secondIndex;
    });
}

export async function fetchAuthenticatedMascots(profileId: string): Promise<Mascot[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: mascotRows, error: mascotError } = await supabase
    .from("player_mascots")
    .select("*")
    .eq("owner_profile_id", profileId);

  if (mascotError || !mascotRows || mascotRows.length === 0) {
    return [];
  }

  const mascotIds = mascotRows.map((mascotRow) => mascotRow.id);
  const templateIds = [...new Set(mascotRows.map((mascotRow) => mascotRow.template_id))];

  const [{ data: deliveryRows }, { data: speciesRows }] = await Promise.all([
    supabase.from("deliveries").select("*").in("mascot_id", mascotIds),
    supabase.from("mascot_templates").select("id, species_key").in("id", templateIds),
  ]);

  return composeAuthenticatedMascots({
    deliveryRows: deliveryRows ?? [],
    mascotRows,
    speciesRows: speciesRows ?? [],
  });
}
