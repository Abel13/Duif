import { getSupabaseClient } from "./client";

export type ProfileProgression = {
  level: number;
  xp: number;
  nextLevelXp: number;
  seeds: number;
};

export async function fetchProfileProgression(profileId: string): Promise<ProfileProgression | undefined> {
  const client = getSupabaseClient();
  if (!client) return undefined;

  const [progressionResult, seedsResult] = await Promise.all([
    client.from("profile_postal_progression").select("level, xp, next_level_xp").eq("profile_id", profileId).maybeSingle(),
    client.from("profile_seed_balances").select("quantity").eq("profile_id", profileId).maybeSingle(),
  ]);

  const error = progressionResult.error ?? seedsResult.error;
  if (error) throw error;

  return {
    level: progressionResult.data?.level ?? 1,
    xp: progressionResult.data?.xp ?? 0,
    nextLevelXp: progressionResult.data?.next_level_xp ?? 150,
    seeds: seedsResult.data?.quantity ?? 0,
  };
}
