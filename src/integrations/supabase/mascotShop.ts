import { getSupabaseClient } from "./client";

export async function fetchAuroraOffer() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.rpc("get_aurora_offer").maybeSingle();
  if (error) throw error;
  return data;
}

export async function purchaseAurora() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Authentication required");
  const { error } = await client.rpc("purchase_aurora");
  if (error) throw error;
}
