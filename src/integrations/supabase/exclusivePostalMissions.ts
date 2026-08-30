import { getSupabaseClient } from "./client";

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
  copy: { "pt-BR": { title: string; story: string }; "en-US": { title: string; story: string } } | null;
};

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

function isCopy(value: unknown): value is ExclusivePostalMission["copy"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const copy = value as Record<string, unknown>;
  return isLocaleCopy(copy["pt-BR"]) && isLocaleCopy(copy["en-US"]);
}

function isLocaleCopy(value: unknown): value is { title: string; story: string } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    && typeof (value as { title?: unknown }).title === "string" && typeof (value as { story?: unknown }).story === "string";
}

export async function fetchExclusivePostalMissions() {
  const { data, error } = await clientOrThrow().rpc("list_exclusive_postal_missions");
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error("Invalid exclusive mission list");
  return data.map(missionFrom);
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
