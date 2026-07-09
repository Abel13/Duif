import type { Delivery, DeliveryReward, InventoryItem, RewardItem } from "./types";
import { assetPaths } from "./assets";

const rewardItems: RewardItem[] = [
  {
    id: "reward-worn-route-stamp",
    nameKey: "rewards.items.wornRouteStamp.name",
    descriptionKey: "rewards.items.wornRouteStamp.description",
    rarity: "common",
    thumbnailAssetPath: assetPaths.items.thumbnail("worn-route-stamp.webp"),
  },
  {
    id: "reward-blue-airmail-label",
    nameKey: "rewards.items.blueAirmailLabel.name",
    descriptionKey: "rewards.items.blueAirmailLabel.description",
    rarity: "uncommon",
    thumbnailAssetPath: assetPaths.items.thumbnail("blue-airmail-label.webp"),
  },
  {
    id: "reward-golden-compass-pin",
    nameKey: "rewards.items.goldenCompassPin.name",
    descriptionKey: "rewards.items.goldenCompassPin.description",
    rarity: "rare",
    thumbnailAssetPath: assetPaths.items.thumbnail("golden-compass-pin.webp"),
  },
];

export const initialMockInventory: InventoryItem[] = [];

export function createMockRewardFromDelivery(delivery?: Delivery): DeliveryReward | undefined {
  if (!delivery?.rewardSeed) {
    return undefined;
  }

  const seedValue = hashSeed(delivery.rewardSeed);
  const item = rewardItems[seedValue % rewardItems.length];

  return {
    id: `reward-${delivery.id}`,
    deliveryId: delivery.id,
    xpGained: 24 + (seedValue % 28),
    item,
  };
}

function hashSeed(seed: string) {
  return seed.split("").reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);
}
