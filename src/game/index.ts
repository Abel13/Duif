export {
  friendMascots,
  getFriendById,
  getFriendCorrespondence,
  getFriendMascots,
  mockFriends,
} from "./friends";
export {
  getInventoryItemsByCategory,
  getInventorySummary,
  inventoryCategories,
  mockInventoryItems,
} from "./inventory";
export { currentPlayer, getDeliveryById, getMascotById, nuvemDelivery, starterMascots } from "./mockData";
export { createMockRewardFromDelivery, initialMockInventory } from "./rewards";
export {
  correspondenceOptions,
  createMockDeliveryFromSelection,
  estimateMascotSpeedKmh,
  getCorrespondenceById,
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
  FriendMascotPreview,
  FriendProfile,
  InventoryCategory,
  InventoryItem,
  Mascot,
  MascotAppearance,
  MascotAttributeSet,
  MascotTrait,
  Player,
  DeliveryReward,
  RewardItem,
  RewardRarity,
  ReceivedCorrespondencePreview,
  SendFlowSelection,
  Skill,
} from "./types";
