import type { Delivery, Mascot } from "./types";

export type SeedPackageCatalogItem = {
  catalogKey: string;
  nameKey: string;
  descriptionKey: string;
  assetKey?: string;
  seedQuantity: number;
  baseChancePercent: number;
  tier: number;
  minDistanceKm: number;
};

export type SeedPackageOpportunity = {
  opportunityIndex: number;
  segmentIndex: number;
  seedValue: string;
  mascotLuckSnapshot: number;
  eligiblePackages: SeedPackageCatalogItem[];
};

export type SeedPackageResult = {
  packageKey: string;
  seedQuantity: number;
  effectiveChance: number;
  roll: number;
} | null;

export type SeedPackageIndicator = {
  opportunityId: string;
  segmentIndex: number;
  hasPackage: boolean;
  tier?: number;
  quantity?: number;
};

/**
 * Gera seed determinística baseada em múltiplos fatores
 */
export function generateDeterministicSeed(
  deliveryId: string,
  opportunityIndex: number,
  mascotId: string,
  rewardSeed: string
): string {
  return `${deliveryId}-${opportunityIndex}-${mascotId}-${rewardSeed}`;
}

/**
 * Hash simples para gerar número pseudo-aleatório determinístico
 */
export function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calcula quantas oportunidades uma viagem deve gerar
 * Regra híbrida: mínimo 50km + 1 oportunidade a cada 100km + segmentos adversos
 */
export function calculateOpportunityCount(
  totalDistanceKm: number,
  hasAdverseConditions: boolean,
  adverseSegmentCount: number
): number {
  // Mínimo de 50km para ter chances
  if (totalDistanceKm < 50) {
    return 0;
  }
  
  // 1 oportunidade base a cada 100km
  const baseOpportunities = Math.floor(totalDistanceKm / 100);
  
  // + oportunidades por segmentos com condições adversas
  const bonusOpportunities = hasAdverseConditions ? adverseSegmentCount : 0;
  
  // Teto máximo de 5 oportunidades por viagem
  return Math.min(baseOpportunities + bonusOpportunities, 5);
}

/**
 * Filtra pacotes elegíveis baseado na distância da viagem
 */
export function getEligiblePackages(
  catalog: SeedPackageCatalogItem[],
  totalDistanceKm: number
): SeedPackageCatalogItem[] {
  return catalog.filter(pkg => totalDistanceKm >= pkg.minDistanceKm);
}

/**
 * Gera as oportunidades de pacotes para uma entrega
 */
export function generateSeedPackageOpportunities(
  delivery: Delivery,
  mascot: Mascot,
  catalog: SeedPackageCatalogItem[],
  segmentCount: number,
  adverseSegmentCount: number
): SeedPackageOpportunity[] {
  const totalDistanceKm = delivery.distanceKm * 2; // ida + volta
  const luckValue = mascot.attributes.luck;
  
  const opportunityCount = calculateOpportunityCount(
    totalDistanceKm,
    adverseSegmentCount > 0,
    adverseSegmentCount
  );
  
  if (opportunityCount === 0) {
    return [];
  }
  
  const eligiblePackages = getEligiblePackages(catalog, totalDistanceKm);
  
  if (eligiblePackages.length === 0) {
    return [];
  }
  
  const opportunities: SeedPackageOpportunity[] = [];
  
  for (let i = 0; i < opportunityCount; i++) {
    // Distribuir oportunidades ao longo dos segmentos
    const segmentIndex = Math.floor((i * segmentCount) / opportunityCount);
    
    const seedValue = generateDeterministicSeed(
      delivery.id,
      i,
      mascot.id,
      delivery.rewardSeed
    );
    
    opportunities.push({
      opportunityIndex: i,
      segmentIndex,
      seedValue,
      mascotLuckSnapshot: luckValue,
      eligiblePackages: [...eligiblePackages]
    });
  }
  
  return opportunities;
}

/**
 * Resolve o resultado de uma oportunidade (determinístico)
 */
export function resolveSeedPackageOpportunity(
  opportunity: SeedPackageOpportunity
): SeedPackageResult {
  const luckValue = opportunity.mascotLuckSnapshot;
  const seedHash = hashSeed(opportunity.seedValue);
  
  // Sorte linear: luck 0-100 = 0-100% de bônus
  const luckBonus = luckValue;
  
  // Roll determinístico (0-99.99%)
  const roll = (seedHash % 10000) / 100;
  
  // Ordenar do maior tier para o menor (tentar tesouro primeiro)
  const sortedPackages = [...opportunity.eligiblePackages].sort(
    (a, b) => b.tier - a.tier
  );
  
  // Tentar encontrar pacote
  for (const pkg of sortedPackages) {
    const effectiveChance = pkg.baseChancePercent + luckBonus;
    const cappedChance = Math.min(effectiveChance, 95); // teto 95%
    
    if (roll < cappedChance) {
      return {
        packageKey: pkg.catalogKey,
        seedQuantity: pkg.seedQuantity,
        effectiveChance: cappedChance,
        roll
      };
    }
  }
  
  return null; // nenhum pacote encontrado
}

/**
 * Calcula estatísticas esperadas para uma viagem
 */
export function calculateExpectedPackageStats(
  opportunities: SeedPackageOpportunity[]
): {
  totalOpportunities: number;
  avgLuck: number;
  expectedFindRate: number;
  minSeeds: number;
  maxSeeds: number;
} {
  if (opportunities.length === 0) {
    return {
      totalOpportunities: 0,
      avgLuck: 0,
      expectedFindRate: 0,
      minSeeds: 0,
      maxSeeds: 0
    };
  }
  
  const avgLuck = opportunities.reduce((sum, opp) => sum + opp.mascotLuckSnapshot, 0) / opportunities.length;
  
  // Calcular chance média considerando todos os pacotes elegíveis
  let totalExpectedChance = 0;
  let minSeeds = Infinity;
  let maxSeeds = 0;
  
  for (const opp of opportunities) {
    let oppTotalChance = 0;
    
    for (const pkg of opp.eligiblePackages) {
      const effectiveChance = Math.min(pkg.baseChancePercent + avgLuck, 95);
      oppTotalChance += effectiveChance;
      
      minSeeds = Math.min(minSeeds, pkg.seedQuantity);
      maxSeeds = Math.max(maxSeeds, pkg.seedQuantity);
    }
    
    // Chance de encontrar pelo menos um pacote
    const findChance = Math.min(oppTotalChance, 95);
    totalExpectedChance += findChance;
  }
  
  const expectedFindRate = (totalExpectedChance / opportunities.length) / 100;
  
  return {
    totalOpportunities: opportunities.length,
    avgLuck: Math.round(avgLuck),
    expectedFindRate,
    minSeeds: minSeeds === Infinity ? 0 : minSeeds,
    maxSeeds
  };
}
