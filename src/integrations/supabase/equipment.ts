import type { EquipmentData, EquipmentEffect, EquipmentInstance, FunctionalEquipmentCatalogItem, MascotLoadout } from "../../game/equipment";
import { isOfficialAssetKey } from "../../game/assets";
import { getSupabaseClient } from "./client";
import type { TranslationKey } from "../../i18n";

export async function fetchEquipmentData(profileId: string): Promise<EquipmentData | undefined> {
  const client = getSupabaseClient();
  if (!client) return undefined;
  const [catalogResult, effectsResult, instancesResult, loadoutsResult, balanceResult] = await Promise.all([
    client.from("equipment_catalog").select("*").eq("status", "active").order("sort_order"),
    client.from("equipment_catalog_effects").select("catalog_id,hazard_key,mitigation_points,sort_order").order("sort_order"),
    client.from("equipment_instances").select("*").eq("owner_profile_id", profileId).order("acquired_at"),
    client.from("mascot_loadouts").select("*"),
    client.from("profile_seed_balances").select("quantity").eq("profile_id", profileId).maybeSingle(),
  ]);
  const error = catalogResult.error ?? effectsResult.error ?? instancesResult.error ?? loadoutsResult.error ?? balanceResult.error;
  if (error) throw error;
  return {
    catalog: (catalogResult.data ?? []).flatMap((row): FunctionalEquipmentCatalogItem[] => row.kind === "backpack" || row.kind === "utility" ? [{
      assetKey: isOfficialAssetKey(row.asset_key) ? row.asset_key : undefined,
      catalogKey: row.catalog_key,
      descriptionKey: row.description_key as TranslationKey,
      effects: (effectsResult.data ?? []).filter((effect) => effect.catalog_id === row.id).map((effect):EquipmentEffect=>({hazardKey:effect.hazard_key,mitigationPoints:Number(effect.mitigation_points),sortOrder:effect.sort_order})),
      id: row.id,
      kind: row.kind,
      maxUses: row.max_uses ?? undefined,
      nameKey: row.name_key as TranslationKey,
      repairSeedPrice: row.repair_seed_price ?? undefined,
      seedPrice: row.seed_price ?? 0,
      slotBonus: row.slot_bonus,
      speedMultiplier: Number(row.speed_multiplier),
    }] : []),
    instances: (instancesResult.data ?? []).map((row): EquipmentInstance => ({
      acquiredAt: row.acquired_at,
      catalogId: row.catalog_id,
      equippedMascotId: row.equipped_mascot_id ?? undefined,
      id: row.id,
      usesRemaining: row.uses_remaining ?? undefined,
    })),
    loadouts: (loadoutsResult.data ?? []).map((row): MascotLoadout => ({
      backpackInstanceId: row.backpack_instance_id ?? undefined,
      mascotId: row.mascot_id,
      revision: row.revision,
      utilityInstanceId: row.utility_instance_id ?? undefined,
    })),
    seedBalance: balanceResult.data?.quantity ?? 0,
  };
}

export async function purchaseEquipment(catalogKey: string, requestId = crypto.randomUUID()) {
  const client = getSupabaseClient(); if (!client) return;
  const { error } = await client.rpc("purchase_equipment", { target_catalog_key: catalogKey, request_id: requestId });
  if (error) throw error;
}

export async function saveMascotLoadout(loadout: MascotLoadout, backpackInstanceId?: string, utilityInstanceId?: string, requestId = crypto.randomUUID()) {
  const client = getSupabaseClient(); if (!client) return;
  const { error } = await client.rpc("set_mascot_loadout", {
    target_mascot_id: loadout.mascotId,
    backpack_instance_id: (backpackInstanceId ?? null) as unknown as string,
    utility_instance_id: (utilityInstanceId ?? null) as unknown as string,
    expected_revision: loadout.revision,
    request_id: requestId,
  });
  if (error) throw error;
}

export async function repairEquipment(instanceId: string, requestId = crypto.randomUUID()) {
  const client = getSupabaseClient(); if (!client) return;
  const { error } = await client.rpc("repair_equipment", { target_instance_id: instanceId, request_id: requestId });
  if (error) throw error;
}
