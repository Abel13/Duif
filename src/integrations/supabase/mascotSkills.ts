import { getSupabaseClient } from "./client";

export async function chooseMascotIndividualSkill(mascotId: string, skillId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is unavailable");
  const { error } = await supabase.rpc("choose_mascot_individual_skill", {
    target_mascot_id: mascotId,
    target_skill_id: skillId,
  });
  if (error) throw error;
}

export async function resolveSoftLandingMigration(mascotId: string, skillId: "skill-nuvem-long-route" | "skill-nuvem-postal-memory") {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is unavailable");
  const { error } = await supabase.rpc("resolve_soft_landing_migration", {
    target_mascot_id: mascotId,
    target_skill_id: skillId,
  });
  if (error) throw error;
}
