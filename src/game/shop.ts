import { assetKeys } from "./assets";
import type { ShopCatalogItem, ShopCategory } from "./types";

export const shopCategories: ShopCategory[] = [
  "all",
  "cosmetics",
  "stickers",
  "postcards",
  "decorations",
];

export const mockShopCatalog: ShopCatalogItem[] = [
  {
    id: "shop-crimson-courier-scarf",
    category: "cosmetics",
    currency: "premium",
    price: 45,
    nameKey: "shop.items.crimsonCourierScarf.name",
    descriptionKey: "shop.items.crimsonCourierScarf.description",
    thumbnailAssetKey: assetKeys.shop.crimsonCourierScarf,
    previewKind: "mascot",
  },
  {
    id: "shop-meadow-post-cap",
    category: "cosmetics",
    currency: "free",
    price: 180,
    nameKey: "shop.items.meadowPostCap.name",
    descriptionKey: "shop.items.meadowPostCap.description",
    thumbnailAssetKey: assetKeys.shop.meadowPostCap,
    previewKind: "mascot",
  },
  {
    id: "shop-sunny-route-sticker",
    category: "stickers",
    currency: "free",
    price: 35,
    nameKey: "shop.items.sunnyRouteSticker.name",
    descriptionKey: "shop.items.sunnyRouteSticker.description",
    thumbnailAssetKey: assetKeys.shop.sunnyRouteSticker,
    previewKind: "item",
  },
  {
    id: "shop-blue-envelope-sticker",
    category: "stickers",
    currency: "premium",
    price: 12,
    nameKey: "shop.items.blueEnvelopeSticker.name",
    descriptionKey: "shop.items.blueEnvelopeSticker.description",
    thumbnailAssetKey: assetKeys.shop.blueEnvelopeSticker,
    previewKind: "item",
  },
  {
    id: "shop-coastal-town-postcard",
    category: "postcards",
    currency: "free",
    price: 60,
    nameKey: "shop.items.coastalTownPostcard.name",
    descriptionKey: "shop.items.coastalTownPostcard.description",
    thumbnailAssetKey: assetKeys.shop.coastalTownPostcard,
    previewKind: "item",
  },
  {
    id: "shop-lantern-festival-postcard",
    category: "postcards",
    currency: "premium",
    price: 20,
    nameKey: "shop.items.lanternFestivalPostcard.name",
    descriptionKey: "shop.items.lanternFestivalPostcard.description",
    thumbnailAssetKey: assetKeys.shop.lanternFestivalPostcard,
    previewKind: "item",
  },
  {
    id: "shop-brass-nest-plaque",
    category: "decorations",
    currency: "premium",
    price: 30,
    nameKey: "shop.items.brassNestPlaque.name",
    descriptionKey: "shop.items.brassNestPlaque.description",
    thumbnailAssetKey: assetKeys.shop.brassNestPlaque,
    previewKind: "mascot",
  },
  {
    id: "shop-airmail-profile-ribbon",
    category: "decorations",
    currency: "free",
    price: 90,
    nameKey: "shop.items.airmailProfileRibbon.name",
    descriptionKey: "shop.items.airmailProfileRibbon.description",
    thumbnailAssetKey: assetKeys.shop.airmailProfileRibbon,
    previewKind: "mascot",
  },
];

export function filterShopItemsByCategory(
  items: ShopCatalogItem[],
  category: ShopCategory,
) {
  if (category === "all") {
    return items;
  }

  if (!shopCategories.includes(category)) {
    return [];
  }

  return items.filter((item) => item.category === category);
}
