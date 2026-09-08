import type { SeedPackageCatalogItem, SeedPackageOpportunity, SeedPackageIndicator } from "../../game/seedPackages";
import { getSupabaseClient } from "./client";
import type { Database } from "./database.types";

export type SeedPackageCatalogRow = Database["public"]["Tables"]["seed_package_catalog"]["Row"];
export type SeedPackageOpportunityRow = Database["public"]["Tables"]["delivery_seed_package_opportunities"]["Row"];
export type SeedPackageLedgerRow = Database["public"]["Tables"]["seed_package_ledger"]["Row"];

/**
 * Busca catálogo ativo de pacotes de sementes
 */
export async function fetchSeedPackageCatalog(): Promise<SeedPackageCatalogItem[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  
  const { data, error } = await client
    .from("seed_package_catalog")
    .select("*")
    .eq("status", "active")
    .order("tier", { ascending: true });
  
  if (error) throw error;
  
  return (data ?? []).map(row => ({
    catalogKey: row.catalog_key,
    nameKey: row.name_key,
    descriptionKey: row.description_key,
    assetKey: row.asset_key ?? undefined,
    seedQuantity: row.seed_quantity,
    baseChancePercent: Number(row.base_chance_percent),
    tier: row.tier,
    minDistanceKm: Number(row.min_distance_km)
  }));
}

/**
 * Persiste oportunidades geradas no banco
 */
export async function persistSeedPackageOpportunities(
  deliveryId: string,
  opportunities: SeedPackageOpportunity[],
  catalogVersion: number = 1
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  
  const rows = opportunities.map(opp => ({
    delivery_id: deliveryId,
    opportunity_index: opp.opportunityIndex,
    segment_index: opp.segmentIndex,
    catalog_version: catalogVersion,
    eligible_packages: opp.eligiblePackages,
    mascot_luck_snapshot: opp.mascotLuckSnapshot,
    seed_value: opp.seedValue,
    result_package_key: null,
    result_seed_quantity: null,
    result_calculated_at: null
  }));
  
  const { error } = await client
    .from("delivery_seed_package_opportunities")
    .insert(rows);
  
  if (error) throw error;
}

/**
 * Resolve oportunidades e atualiza resultados
 */
export async function resolveAndUpdateOpportunities(
  deliveryId: string,
  results: Map<number, { packageKey: string; seedQuantity: number }>
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  
  // Atualizar cada oportunidade com seu resultado
  for (const [opportunityIndex, result] of results.entries()) {
    const { error } = await client
      .from("delivery_seed_package_opportunities")
      .update({
        result_package_key: result.packageKey,
        result_seed_quantity: result.seedQuantity,
        result_calculated_at: new Date().toISOString()
      })
      .eq("delivery_id", deliveryId)
      .eq("opportunity_index", opportunityIndex);
    
    if (error) throw error;
  }
}

/**
 * Busca oportunidades de uma entrega
 */
export async function fetchDeliverySeedPackageOpportunities(
  deliveryId: string
): Promise<SeedPackageOpportunityRow[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  
  const { data, error } = await client
    .from("delivery_seed_package_opportunities")
    .select("*")
    .eq("delivery_id", deliveryId)
    .order("opportunity_index", { ascending: true });
  
  if (error) throw error;
  
  return data ?? [];
}

/**
 * Busca pacotes creditados de uma entrega
 */
export async function fetchDeliverySeedPackages(
  deliveryId: string
): Promise<SeedPackageLedgerRow[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  
  const { data, error } = await client
    .from("seed_package_ledger")
    .select("*")
    .eq("delivery_id", deliveryId)
    .order("credited_at", { ascending: true });
  
  if (error) throw error;
  
  return data ?? [];
}

/**
 * Mapeia oportunidades para indicadores visuais
 */
export function mapOpportunitiesToIndicators(
  opportunities: SeedPackageOpportunityRow[]
): SeedPackageIndicator[] {
  return opportunities.map(opp => ({
    opportunityId: opp.id,
    segmentIndex: opp.segment_index,
    hasPackage: opp.result_package_key !== null,
    tier: opp.result_package_key ? extractTierFromKey(opp.result_package_key) : undefined,
    quantity: opp.result_seed_quantity ?? undefined
  }));
}

/**
 * Extrai tier do catalog_key
 */
function extractTierFromKey(catalogKey: string): number | undefined {
  if (catalogKey.includes("minimum")) return 1;
  if (catalogKey.includes("small")) return 2;
  if (catalogKey.includes("medium")) return 3;
  if (catalogKey.includes("large")) return 4;
  if (catalogKey.includes("treasure")) return 5;
  return undefined;
}

/**
 * Verifica se uma rota está em cooldown
 */
export async function checkRouteCooldown(
  mascotId: string,
  originKey: string,
  destinationKey: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return true; // Assume em cooldown se não conseguir verificar
  
  const { data, error } = await client.rpc("check_seed_package_cooldown", {
    target_mascot_id: mascotId,
    origin_canonical_key: originKey,
    destination_canonical_key: destinationKey
  });
  
  if (error) {
    console.error("Error checking cooldown:", error);
    return true;
  }
  
  return data as boolean;
}

/**
 * Credita pacotes de sementes (chamado na coleta)
 */
export async function creditSeedPackages(deliveryId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  
  const { error } = await client.rpc("credit_seed_packages", {
    delivery_id_param: deliveryId
  });
  
  if (error) throw error;
}
