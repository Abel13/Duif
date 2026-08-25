import { getSupabaseClient } from "./client";

export type SkillPreviewReason = "snapshot" | "conditionNotMet";
export type SkillPreview = { skillEffects: Array<{ skillId: string; level: number; state: "active" | "inactive"; reason: SkillPreviewReason; weatherDependent: boolean }>; weatherMayChange: boolean };

export function mapSkillPreviewPayload(data: unknown): SkillPreview | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;
  const effects = (data as { skillEffects?: unknown }).skillEffects;
  if (!Array.isArray(effects)) return undefined;
  return { skillEffects: effects.flatMap((item)=>{if(typeof item!=="object"||item===null)return[];const value=item as Record<string,unknown>;if(typeof value.skillId!=="string"||typeof value.level!=="number"||(value.state!=="active"&&value.state!=="inactive")||(value.reason!=="snapshot"&&value.reason!=="conditionNotMet"))return[];return[{skillId:value.skillId,level:value.level,state:value.state,reason:value.reason,weatherDependent:value.weatherDependent===true}]}), weatherMayChange: (data as { weatherMayChange?: unknown }).weatherMayChange === true };
}

export async function previewMascotSkillModifiers(mascotId: string, destinationKey: string, distanceKm: number): Promise<SkillPreview | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) return undefined;
  const { data, error } = await supabase.rpc("preview_mascot_skill_modifiers", { target_mascot_id: mascotId, destination_key: destinationKey, distance_km: distanceKm });
  if (error) return undefined;
  return mapSkillPreviewPayload(data);
}
