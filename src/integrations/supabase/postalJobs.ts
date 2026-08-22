import { getSupabaseClient } from "./client";

export type PostalJobOffer = {
  offer: { id: string; status: "offered" | "accepted" };
  template: { title_key: string; description_key: string; cargo_slots: number; seed_reward: number; mascot_xp: number; min_distance_km: number; max_distance_km: number };
  replacementsRemaining: number;
};

type Rpc = (name: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>;

function clientRpc(): Rpc {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured");
  return client.rpc as unknown as Rpc;
}

function offerFrom(value: unknown): PostalJobOffer {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid postal job offer");
  const candidate = value as PostalJobOffer;
  if (!candidate.offer?.id || !candidate.template?.title_key) throw new Error("Invalid postal job offer");
  return candidate;
}

export async function fetchPostalJobOffer(mascotId: string) {
  const { data, error } = await clientRpc()("postal_job_offer_payload", { target_mascot_id: mascotId });
  if (error) throw error;
  return offerFrom(data);
}

export async function replacePostalJobOffer(mascotId: string) {
  const { data, error } = await clientRpc()("replace_postal_job_offer", { target_mascot_id: mascotId });
  if (error) throw error;
  return offerFrom(data);
}

export async function acceptPostalJobOffer(offerId: string) {
  const { data, error } = await clientRpc()("accept_postal_job_offer", { target_offer_id: offerId });
  if (error) throw error;
  return data;
}

export async function dispatchPostalJob(offerId: string) {
  const { data, error } = await clientRpc()("dispatch_postal_job", { target_offer_id: offerId });
  if (error || !data || typeof data !== "object") throw error ?? new Error("Postal job dispatch failed");
  return data as { id: string };
}
