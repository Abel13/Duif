import { getSupabaseClient } from "./client";

export type SkillPreviewReason = "snapshot" | "conditionNotMet";
export type SkillPreview = { version: 3; skillRulesVersion?: number; preparationMinutes: number; outboundSpeedMultiplier: number; returnSpeedMultiplier: number; discoveryRadiusMultiplier: number; rarityWeightMultiplier: number; skillEffects: Array<{ skillId: string; level: number; state: "active" | "inactive"; reason: SkillPreviewReason; weatherDependent: boolean; impact?: {kind:string;value:number;duration?:number} }>; weatherMayChange: boolean };

export function mapSkillPreviewPayload(data: unknown): SkillPreview | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;
  const effects = (data as { skillEffects?: unknown }).skillEffects;
  if (!Array.isArray(effects)) return undefined;
  const source=data as Record<string,unknown>;
  if(source.version!==3||typeof source.preparationMinutes!=="number"||typeof source.outboundSpeedMultiplier!=="number"||typeof source.returnSpeedMultiplier!=="number"||typeof source.discoveryRadiusMultiplier!=="number"||typeof source.rarityWeightMultiplier!=="number")return undefined;
  return {version:3,skillRulesVersion:typeof source.skillRulesVersion==="number"?source.skillRulesVersion:undefined,preparationMinutes:source.preparationMinutes,outboundSpeedMultiplier:source.outboundSpeedMultiplier,returnSpeedMultiplier:source.returnSpeedMultiplier,discoveryRadiusMultiplier:source.discoveryRadiusMultiplier,rarityWeightMultiplier:source.rarityWeightMultiplier,skillEffects:effects.flatMap((item)=>{if(typeof item!=="object"||item===null)return[];const value=item as Record<string,unknown>;if(typeof value.skillId!=="string"||typeof value.level!=="number"||(value.state!=="active"&&value.state!=="inactive")||(value.reason!=="snapshot"&&value.reason!=="conditionNotMet"))return[];const impact=value.impact&&typeof value.impact==="object"&&!Array.isArray(value.impact)?value.impact as Record<string,unknown>:undefined;return[{skillId:value.skillId,level:value.level,state:value.state,reason:value.reason,weatherDependent:value.weatherDependent===true,...(impact&&typeof impact.kind==="string"&&typeof impact.value==="number"?{impact:{kind:impact.kind,value:impact.value,...(typeof impact.duration==="number"?{duration:impact.duration}:{})}}:{})}]}),weatherMayChange:source.weatherMayChange===true};
}

export async function previewMascotSkillModifiers(mascotId: string, destinationKey: string, distanceKm: number): Promise<SkillPreview | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) return undefined;
  const { data, error } = await supabase.rpc("preview_mascot_skill_modifiers", { target_mascot_id: mascotId, destination_key: destinationKey, distance_km: distanceKm });
  if (error) return undefined;
  return mapSkillPreviewPayload(data);
}
