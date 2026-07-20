import type { CorrespondenceType, Delivery, Mascot, MascotTravelModifiers, TutorialTravelBoost } from "../../game/types";
import type { TranslationKey } from "../../i18n";
import { getSupabaseClient } from "./client";
import {
  mapAppearance,
  mapAttributes,
  mapEquipment,
  mapSkills,
  mapTrait,
  readNumber,
  readString,
  requireTranslationKey,
  type MascotTemplateRow,
} from "./catalogMappers";
import type { Database } from "./database.types";

export type PlayerMascotRow = Database["public"]["Tables"]["player_mascots"]["Row"];
export type DeliveryRow = Database["public"]["Tables"]["deliveries"]["Row"];
export type MascotSpeciesRow = Pick<MascotTemplateRow, "id" | "species_key">;

function getMascotPublicId(row: PlayerMascotRow) {
  return row.id;
}

export function mapDeliveryRowToDelivery(row: DeliveryRow, mascotPublicId: string): Delivery {
  return {
    animalSpeedKmh: readNumber(row.animal_speed_kmh, 1),
    correspondenceType: mapCorrespondenceType(row.correspondence_option_id),
    destination: {
      labelKey: row.destination_label_key as TranslationKey,
      latitude: readNumber(row.destination_latitude, 0),
      longitude: readNumber(row.destination_longitude, 0),
    },
    distanceKm: readNumber(row.distance_km, 0),
    id: row.id,
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
    tutorialTravelBoost: mapTutorialTravelBoost(row.travel_modifiers),
  };
}

const correspondenceTypeByOptionId: Record<string, CorrespondenceType> = {
  "00000000-0000-4000-8000-000000000401": "letter",
  "00000000-0000-4000-8000-000000000402": "postcard",
  "00000000-0000-4000-8000-000000000403": "sticker",
  "00000000-0000-4000-8000-000000000404": "smallGift",
};

function mapCorrespondenceType(optionId: string | null) {
  return optionId ? correspondenceTypeByOptionId[optionId] : undefined;
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

function mapTutorialTravelBoost(value: DeliveryRow["travel_modifiers"]): TutorialTravelBoost | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") return undefined;
  const boost = (value as Record<string, unknown>).tutorialBoost;
  if (!boost || Array.isArray(boost) || typeof boost !== "object") return undefined;
  const candidate = boost as Record<string, unknown>;
  return candidate.kind === "firstJourney" && candidate.version === 1
    && candidate.preparationSeconds === 30 && candidate.outboundSeconds === 120
    && candidate.destinationSeconds === 30 && candidate.returnSeconds === 120
    ? candidate as TutorialTravelBoost : undefined;
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
    .filter((delivery) => delivery.status === "completed" && !delivery.is_tutorial)
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
  return {
    appearance: mapAppearance(row.appearance),
    attributes: mapAttributes(row.attributes),
    currentDelivery,
    equipment: mapEquipment(row.equipment),
    id: getMascotPublicId(row),
    level: readNumber(row.level, 1),
    name: readString(row.name, ""),
    nextLevelXp: readNumber(row.next_level_xp, 1),
    skills: mapSkills(row.skills),
    speciesKey: requireTranslationKey(speciesKey, "mascot species key"),
    trait: mapTrait(row.trait),
    xp: readNumber(row.xp, 0),
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
        speciesKey: speciesKeyByTemplateId.get(mascotRow.template_id) ?? undefined,
      });
    })
    .sort((firstMascot, secondMascot) => firstMascot.name.localeCompare(secondMascot.name));
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
    supabase.from("mascot_templates").select("id, species_key").eq("status", "active").in("id", templateIds),
  ]);

  return composeAuthenticatedMascots({
    deliveryRows: deliveryRows ?? [],
    mascotRows,
    speciesRows: speciesRows ?? [],
  });
}
