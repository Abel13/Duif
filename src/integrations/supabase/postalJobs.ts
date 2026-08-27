import { getSupabaseClient } from "./client";

export type PostalJobOffer = {
  offer: { id: string; status: "offered" | "accepted" };
  template: { title_key: string; description_key: string; cargo_slots: number; seed_reward: number; mascot_xp: number; min_distance_km: number; max_distance_km: number };
  replacementsRemaining: number;
};

function postalJobsClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

function reportPostalJobFailure(operation: string, error: unknown) {
  const details = typeof error === "object" && error !== null
    ? error as { code?: unknown; status?: unknown }
    : {};
  console.error(`[postal-jobs] ${operation} failed`, {
    code: typeof details.code === "string" ? details.code : "unknown",
    status: typeof details.status === "number" ? details.status : undefined,
  });
}

function offerFrom(value: unknown): PostalJobOffer {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid postal job offer");
  const candidate = value as PostalJobOffer;
  if (!candidate.offer?.id || !candidate.template?.title_key) throw new Error("Invalid postal job offer");
  return candidate;
}

export async function fetchPostalJobOffer(mascotId: string) {
  const { data, error } = await postalJobsClient().rpc("postal_job_offer_payload", { target_mascot_id: mascotId });
  if (error) { reportPostalJobFailure("fetchOffer", error); throw error; }
  try { return offerFrom(data); } catch (invalidResponse) { reportPostalJobFailure("fetchOffer", invalidResponse); throw invalidResponse; }
}

export async function replacePostalJobOffer(mascotId: string) {
  const { data, error } = await postalJobsClient().rpc("replace_postal_job_offer", { target_mascot_id: mascotId });
  if (error) { reportPostalJobFailure("replaceOffer", error); throw error; }
  try { return offerFrom(data); } catch (invalidResponse) { reportPostalJobFailure("replaceOffer", invalidResponse); throw invalidResponse; }
}

export async function acceptPostalJobOffer(offerId: string) {
  const { data, error } = await postalJobsClient().rpc("accept_postal_job_offer", { target_offer_id: offerId });
  if (error) { reportPostalJobFailure("acceptOffer", error); throw error; }
  return data;
}

export async function dispatchPostalJob(offerId: string) {
  const { data, error } = await postalJobsClient().rpc("dispatch_postal_job", { target_offer_id: offerId });
  if (error || !data || typeof data !== "object") {
    const failure = error ?? new Error("Postal job dispatch failed");
    reportPostalJobFailure("dispatchOffer", failure);
    throw failure;
  }
  return data as { id: string };
}
