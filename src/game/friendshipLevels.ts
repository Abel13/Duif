import { assetKeys, type OfficialAssetKey } from "./assets";
import type { TranslationKey } from "../i18n";

/** Completed travel cycles required to reach each friendship level (1–5). */
export const FRIENDSHIP_LEVEL_THRESHOLDS = [0, 3, 8, 20, 50] as const;

export type FriendshipLevel = 1 | 2 | 3 | 4 | 5;

export type FriendshipLevelId =
  | "newCorrespondents"
  | "frequentCorrespondents"
  | "postalFriends"
  | "routeCompanions"
  | "lastingBond";

const LEVEL_IDS: readonly FriendshipLevelId[] = [
  "newCorrespondents",
  "frequentCorrespondents",
  "postalFriends",
  "routeCompanions",
  "lastingBond",
];

const SEAL_KEYS: Record<FriendshipLevelId, OfficialAssetKey> = {
  newCorrespondents: assetKeys.friendship.seals.newCorrespondents,
  frequentCorrespondents: assetKeys.friendship.seals.frequentCorrespondents,
  postalFriends: assetKeys.friendship.seals.postalFriends,
  routeCompanions: assetKeys.friendship.seals.routeCompanions,
  lastingBond: assetKeys.friendship.seals.lastingBond,
};

export type FriendshipProgress = {
  level: FriendshipLevel;
  levelId: FriendshipLevelId;
  nameKey: TranslationKey;
  sealAssetKey: OfficialAssetKey;
  sealAltKey: TranslationKey;
  cycles: number;
  currentThreshold: number;
  nextThreshold: number | null;
  cyclesInLevel: number;
  cyclesToNext: number | null;
  levelSpan: number;
  progressRatio: number;
  isMax: boolean;
};

export function friendshipLevelFromCycles(cycleCount: number): FriendshipLevel {
  const cycles = Math.max(0, Math.floor(cycleCount));
  if (cycles >= 50) return 5;
  if (cycles >= 20) return 4;
  if (cycles >= 8) return 3;
  if (cycles >= 3) return 2;
  return 1;
}

export function getFriendshipProgress(exchangeCount: number): FriendshipProgress {
  const cycles = Math.max(0, Math.floor(exchangeCount));
  const level = friendshipLevelFromCycles(cycles);
  const levelId = LEVEL_IDS[level - 1];
  const currentThreshold = FRIENDSHIP_LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = level < 5 ? ([3, 8, 20, 50] as const)[level - 1] : null;
  const isMax = nextThreshold === null;
  const cyclesInLevel = cycles - currentThreshold;
  const levelSpan = isMax ? 1 : nextThreshold - currentThreshold;
  const progressRatio = isMax ? 1 : Math.min(1, Math.max(0, cyclesInLevel / levelSpan));
  const cyclesToNext = isMax ? null : nextThreshold - cycles;

  return {
    level,
    levelId,
    nameKey: `friends.levels.${levelId}` as TranslationKey,
    sealAssetKey: SEAL_KEYS[levelId],
    sealAltKey: `friends.seals.${levelId}.alt` as TranslationKey,
    cycles,
    currentThreshold,
    nextThreshold,
    cyclesInLevel,
    cyclesToNext,
    levelSpan,
    progressRatio,
    isMax,
  };
}
