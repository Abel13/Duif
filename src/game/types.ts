import type { TranslationKey } from "../i18n";

export type Coordinates = {
  latitude: number;
  longitude: number;
  labelKey: TranslationKey;
};

export type MascotAttributeSet = {
  speed: number;
  stamina: number;
  orientation: number;
  luck: number;
};

export type MascotArchetype = {
  id: string;
  catalogKey: string;
  speciesKey: TranslationKey;
  suggestedNameKey: TranslationKey;
  baseLevel: number;
  baseXp: number;
  nextLevelXp: number;
  attributes: MascotAttributeSet;
  trait: MascotTrait;
  equipment: EquipmentItem[];
  skills: Skill[];
  appearance: MascotAppearance;
};

export type MascotTrait = {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  effect: "rareFind" | "fastReturn" | "deliveryReward" | "eventDiscovery" | "friendshipBonus";
};

export type EquipmentType = "bag" | "scarf" | "cap" | "badge" | "goggles" | "charm";

export type EquipmentRarity = "common" | "uncommon" | "rare";

export type RewardRarity = "common" | "uncommon" | "rare";

export type InventoryCategory = "all" | "equipment" | "stamps" | "keepsakes" | "routeMarks";

export type ShopCategory = "all" | "cosmetics" | "stickers" | "postcards" | "decorations";

export type ShopCurrency = "free" | "premium";

export type ShopCatalogItem = {
  id: string;
  category: Exclude<ShopCategory, "all">;
  currency: ShopCurrency;
  price: number;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  thumbnailAssetPath: string;
  previewKind: "mascot" | "item";
};

export type EquipmentItem = {
  id: string;
  nameKey: TranslationKey;
  type: EquipmentType;
  rarity: EquipmentRarity;
  equipped: boolean;
  descriptionKey?: TranslationKey;
  iconAssetPath?: string;
};

export type Skill = {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  level: number;
};

export type DeliveryStatus =
  | "available"
  | "preparing"
  | "outbound"
  | "delivered"
  | "returning"
  | "returned"
  | "completed";

export type MascotTravelModifiers = {
  version: 1;
  preparationMinutes: number;
  outboundSpeedMultiplier: number;
  returnSpeedMultiplier: number;
  discoveryRadiusMultiplier: number;
  rarityWeightMultiplier: number;
  longRouteConsistency: number;
  isLongRoute: boolean;
};

export type Delivery = {
  id: string;
  senderId: string;
  receiverId: string;
  mascotId: string;
  origin: Coordinates;
  destination: Coordinates;
  distanceKm: number;
  animalSpeedKmh: number;
  outboundStartAt: string;
  outboundArrivalAt: string;
  returnStartAt?: string;
  returnArrivalAt?: string;
  status: DeliveryStatus;
  rewardSeed: string;
  routeDiscoveryVersion?: number;
  travelModifiers?: MascotTravelModifiers;
  correspondenceType?: CorrespondenceType;
};

export type RewardItem = {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  rarity: RewardRarity;
  thumbnailAssetPath?: string;
};

export type DeliveryReward = {
  id: string;
  deliveryId: string;
  xpGained: number;
  item: RewardItem;
};

export type InventoryItem = RewardItem & {
  category: Exclude<InventoryCategory, "all">;
  collectedAt: string;
  equipped: boolean;
  sourceKey?: TranslationKey;
  thumbnailAssetPath?: string;
};

export type FriendLocation = {
  city: string;
  state: string;
  country: string;
  labelKey?: TranslationKey;
  latitude?: number;
  longitude?: number;
};

export type FriendProfile = {
  id: string;
  name: string;
  location: FriendLocation;
  favoriteNoteKey?: TranslationKey;
  friendshipLevel: number;
  exchangeCount: number;
  mascotIds: string[];
  receivedCorrespondence: ReceivedCorrespondencePreview[];
};

export type FriendMascotPreview = {
  id: string;
  name: string;
  speciesKey: TranslationKey;
  level: number;
  appearance: MascotAppearance;
};

export type ReceivedCorrespondencePreview = {
  id: string;
  fromName: string;
  type: CorrespondenceType;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  receivedAt: string;
};

export type CorrespondenceType = "letter" | "postcard" | "sticker" | "smallGift";
export type PostcardVariant = "city" | "event" | "photo";

export type LetterContent = {
  type: "letter";
  letterText: string;
};

export type PostcardContent = {
  type: "postcard";
  postcardMessage: string;
  postcardVariant: PostcardVariant;
};

export type StickerContent = {
  type: "sticker";
  stickerIds: string[];
};

export type GiftContentPlaceholder = {
  type: "smallGift";
  giftNote: string;
};

export type CorrespondenceContent =
  | LetterContent
  | PostcardContent
  | StickerContent
  | GiftContentPlaceholder;

export type CorrespondenceOption = {
  id: string;
  type: CorrespondenceType;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
};

export type SendFlowSelection = {
  friendId?: string;
  mascotId?: string;
  correspondenceId?: string;
};

export type MascotAppearance = {
  primaryColor: string;
  accentColor: string;
  portraitPlaceholderKey: TranslationKey;
  portraitAssetPath?: string;
};

export type Mascot = {
  id: string;
  name: string;
  speciesKey: TranslationKey;
  level: number;
  xp: number;
  nextLevelXp: number;
  attributes: MascotAttributeSet;
  trait: MascotTrait;
  equipment: EquipmentItem[];
  skills: Skill[];
  appearance: MascotAppearance;
  currentDelivery?: Delivery;
};

export type Player = {
  id: string;
  name: string;
  homeBase: Coordinates;
  mascotIds: string[];
};
