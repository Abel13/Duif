export { currentPlayer, getMascotById, nuvemDelivery, starterMascots } from "./mockData";
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
  Mascot,
  MascotAppearance,
  MascotAttributeSet,
  MascotTrait,
  Player,
  SendFlowSelection,
  Skill,
} from "./types";
