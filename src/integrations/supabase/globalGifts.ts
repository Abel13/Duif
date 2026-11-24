import { getSupabaseClient } from "./client";
export type GlobalGift = { id: string; seedQuantity: number };
export type GlobalGiftClaim = { seedQuantity: number };

export function mapGlobalGiftClaim(value: unknown): GlobalGiftClaim {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid global gift claim");
  }

  const seedQuantity = (value as Record<string, unknown>).seedQuantity;
  if (typeof seedQuantity !== "number" || !Number.isInteger(seedQuantity) || seedQuantity < 1) {
    throw new Error("Invalid global gift claim");
  }

  return { seedQuantity };
}

export async function listPendingGlobalGifts() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.rpc("list_pending_global_gifts");
  if (error) throw error;
  return (data ?? []).map((gift) => ({ id: gift.id, seedQuantity: gift.seed_quantity }));
}

export async function claimGlobalGift(id: string): Promise<GlobalGiftClaim> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase unavailable");
  const { data, error } = await client.rpc("claim_global_gift", { gift_id: id });
  if (error) throw error;
  return mapGlobalGiftClaim(data);
}
