export { currentPlayer, getDeliveryById, getMascotById, nuvemDelivery, starterMascots } from "./mockData";
export { createMockRewardFromDelivery, initialMockInventory } from "./rewards";
export {
  correspondenceOptions,
  createMockDeliveryFromSelection,
  estimateMascotSpeedKmh,
  getCorrespondenceById,
  getFriendById,
  mockFriends,
} from "./sendFlow";
export {
  clampProgress,
  DEFAULT_GAME_SPEED_MULTIPLIER,
  estimateTravelDurationHours,
  formatRemainingTime,
  getDeliveryStatus,
  getTravelProgress,
  haversineDistanceKm,
} from "./travel";
export type {
  Coordinates,
  CorrespondenceOption,
  CorrespondenceType,
  Delivery,
  DeliveryStatus,
  EquipmentItem,
  EquipmentRarity,
  EquipmentType,
  FriendProfile,
  InventoryItem,
  Mascot,
  MascotAppearance,
  MascotAttributeSet,
  MascotTrait,
  Player,
  DeliveryReward,
  RewardItem,
  RewardRarity,
  SendFlowSelection,
  Skill,
} from "./types";
