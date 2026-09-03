import { getSupabaseClient } from "./client";

export type EncounterAdminSettings = {
  radiusKm: number;
  refreshMinutes: number;
  resultLimit: number;
};

export async function getEncounterAdminSettings(): Promise<EncounterAdminSettings> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is unavailable");
  const { data, error } = await supabase.rpc("admin_get_encounter_settings");
  if (error) throw error;
  return mapSettings(data);
}

export async function updateEncounterAdminSettings(
  settings: EncounterAdminSettings,
): Promise<EncounterAdminSettings> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is unavailable");
  const { data, error } = await supabase.rpc("admin_update_encounter_settings", {
    target_radius_km: settings.radiusKm,
    target_refresh_minutes: settings.refreshMinutes,
    target_result_limit: settings.resultLimit,
  });
  if (error) throw error;
  return mapSettings(data);
}

function mapSettings(data: unknown): EncounterAdminSettings {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid encounter settings payload");
  }
  const value = data as Record<string, unknown>;
  if (
    typeof value.radiusKm !== "number" ||
    typeof value.refreshMinutes !== "number" ||
    typeof value.resultLimit !== "number"
  ) {
    throw new Error("Invalid encounter settings payload");
  }
  return {
    radiusKm: value.radiusKm,
    refreshMinutes: value.refreshMinutes,
    resultLimit: value.resultLimit,
  };
}
