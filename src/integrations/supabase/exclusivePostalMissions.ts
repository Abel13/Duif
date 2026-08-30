import { getSupabaseClient } from "./client";

export type ExclusiveMissionQuest = { title: string; briefing: string; outboundObjective: string; returnRecord: string };

export type ExclusivePostalMission = {
  id: string;
  mascotId: string;
  mascotName: string;
  status: "offered" | "accepted" | "expired";
  expiresAt: string;
  destinationName: string | null;
  destinationCountryCode: string | null;
  distanceKm: number | null;
  cargoSlots: number;
  seedReward: number;
  mascotXp: number;
  copy: { "pt-BR": ExclusiveMissionQuest; "en-US": ExclusiveMissionQuest } | null;
};

export type ExclusiveMissionDossier = { missionId: string; deliveryId: string; copy: NonNullable<ExclusivePostalMission["copy"]> };

function clientOrThrow() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

function missionFrom(value: unknown): ExclusivePostalMission {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid exclusive mission");
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.mascot_id !== "string" || typeof item.mascot_name !== "string"
    || (item.status !== "offered" && item.status !== "accepted" && item.status !== "expired")
    || typeof item.expires_at !== "string" || typeof item.cargo_slots !== "number" || typeof item.seed_reward !== "number" || typeof item.mascot_xp !== "number") {
    throw new Error("Invalid exclusive mission");
  }
  return {
    id: item.id, mascotId: item.mascot_id, mascotName: item.mascot_name, status: item.status, expiresAt: item.expires_at,
    destinationName: typeof item.destination_name === "string" ? item.destination_name : null,
    destinationCountryCode: typeof item.destination_country_code === "string" ? item.destination_country_code : null,
    distanceKm: typeof item.distance_km === "number" ? item.distance_km : item.distance_km === null ? null : Number(item.distance_km),
    cargoSlots: item.cargo_slots, seedReward: item.seed_reward, mascotXp: item.mascot_xp,
    copy: isCopy(item.copy) ? item.copy : null,
  };
}

function isCopy(value: unknown): value is NonNullable<ExclusivePostalMission["copy"]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const copy = value as Record<string, unknown>;
  return isLocaleCopy(copy["pt-BR"]) && isLocaleCopy(copy["en-US"]);
}

function isLocaleCopy(value: unknown): value is ExclusiveMissionQuest {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    && typeof (value as { title?: unknown }).title === "string" && typeof (value as { briefing?: unknown }).briefing === "string"
    && typeof (value as { outboundObjective?: unknown }).outboundObjective === "string" && typeof (value as { returnRecord?: unknown }).returnRecord === "string";
}

export async function fetchExclusivePostalMissions() {
  const { data, error } = await clientOrThrow().rpc("list_exclusive_postal_missions");
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error("Invalid exclusive mission list");
  return data.map(missionFrom);
}

export async function fetchExclusiveMissionDossier(deliveryId: string): Promise<ExclusiveMissionDossier | undefined> {
  const { data, error } = await clientOrThrow().rpc("get_exclusive_postal_mission_dossier", { target_delivery_id: deliveryId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : undefined;
  if (!row || typeof row !== "object") return undefined;
  const value = row as Record<string, unknown>;
  if (typeof value.mission_id !== "string" || typeof value.delivery_id !== "string" || !isCopy(value.copy)) return undefined;
  return { missionId: value.mission_id, deliveryId: value.delivery_id, copy: value.copy };
}

export async function acceptExclusivePostalMission(missionId: string) {
  const { error } = await clientOrThrow().rpc("accept_exclusive_postal_mission", { target_mission_id: missionId });
  if (error) throw error;
}

export async function dispatchExclusivePostalMission(missionId: string) {
  const { data, error } = await clientOrThrow().rpc("dispatch_exclusive_postal_mission", { target_mission_id: missionId });
  if (error || !data || typeof data !== "object") throw error ?? new Error("Exclusive mission dispatch failed");
  const id = (data as { id?: unknown }).id;
  if (typeof id !== "string") throw new Error("Exclusive mission dispatch failed");
  return { id };
}
