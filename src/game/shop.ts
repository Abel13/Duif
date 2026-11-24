import { assetKeys } from "./assets";
import type { ShopCatalogItem, ShopCategory } from "./types";
import type { TranslationKey } from "../i18n";

export type SeasonalPostcardShopItem = {
  catalogKey: string;
  descriptionKey: TranslationKey;
  nameKey: TranslationKey;
  thumbnailAssetKey: ShopCatalogItem["thumbnailAssetKey"];
};

export const seasonalPostcardShopItems: SeasonalPostcardShopItem[] = [
  { catalogKey: "postcard-seasonal-christmas-tree", nameKey: "officialPostcards.christmasTree.name", descriptionKey: "officialPostcards.christmasTree.description", thumbnailAssetKey: assetKeys.postcards.christmas.tree },
  { catalogKey: "postcard-seasonal-christmas-feast", nameKey: "officialPostcards.christmasFeast.name", descriptionKey: "officialPostcards.christmasFeast.description", thumbnailAssetKey: assetKeys.postcards.christmas.feast },
  { catalogKey: "postcard-seasonal-christmas-gifts", nameKey: "officialPostcards.christmasGifts.name", descriptionKey: "officialPostcards.christmasGifts.description", thumbnailAssetKey: assetKeys.postcards.christmas.gifts },
  { catalogKey: "postcard-seasonal-christmas-carols", nameKey: "officialPostcards.christmasCarols.name", descriptionKey: "officialPostcards.christmasCarols.description", thumbnailAssetKey: assetKeys.postcards.christmas.carols },
  { catalogKey: "postcard-seasonal-christmas-sleigh", nameKey: "officialPostcards.christmasSleigh.name", descriptionKey: "officialPostcards.christmasSleigh.description", thumbnailAssetKey: assetKeys.postcards.christmas.sleigh },
  { catalogKey: "postcard-seasonal-christmas-cottage", nameKey: "officialPostcards.christmasCottage.name", descriptionKey: "officialPostcards.christmasCottage.description", thumbnailAssetKey: assetKeys.postcards.christmas.cottage },
  { catalogKey: "postcard-seasonal-christmas-table", nameKey: "officialPostcards.christmasTable.name", descriptionKey: "officialPostcards.christmasTable.description", thumbnailAssetKey: assetKeys.postcards.christmas.table },
  { catalogKey: "postcard-seasonal-christmas-mailbox", nameKey: "officialPostcards.christmasMailbox.name", descriptionKey: "officialPostcards.christmasMailbox.description", thumbnailAssetKey: assetKeys.postcards.christmas.mailbox },
  { catalogKey: "postcard-seasonal-newyear-beach", nameKey: "officialPostcards.newYearBeach.name", descriptionKey: "officialPostcards.newYearBeach.description", thumbnailAssetKey: assetKeys.postcards.newYear.beach },
  { catalogKey: "postcard-seasonal-newyear-andes", nameKey: "officialPostcards.newYearAndes.name", descriptionKey: "officialPostcards.newYearAndes.description", thumbnailAssetKey: assetKeys.postcards.newYear.andes },
  { catalogKey: "postcard-seasonal-newyear-buenos-aires", nameKey: "officialPostcards.newYearBuenosAires.name", descriptionKey: "officialPostcards.newYearBuenosAires.description", thumbnailAssetKey: assetKeys.postcards.newYear.buenosAires },
];

export const shopCategories: ShopCategory[] = [
  "all",
  "cosmetics",
  "stickers",
  "postcards",
  "decorations",
];

export const shopCatalog: ShopCatalogItem[] = [
  {
    id: "shop-sunny-route-sticker",
    category: "stickers",
    currency: "seeds",
    price: 35,
    nameKey: "shop.items.sunnyRouteSticker.name",
    descriptionKey: "shop.items.sunnyRouteSticker.description",
    thumbnailAssetKey: assetKeys.shop.sunnyRouteSticker,
    previewKind: "item",
  },
  {
    id: "shop-blue-envelope-sticker",
    category: "stickers",
    currency: "crystals",
    price: 12,
    nameKey: "shop.items.blueEnvelopeSticker.name",
    descriptionKey: "shop.items.blueEnvelopeSticker.description",
    thumbnailAssetKey: assetKeys.shop.blueEnvelopeSticker,
    previewKind: "item",
  },
  {
    id: "shop-coastal-town-postcard",
    category: "postcards",
    currency: "seeds",
    price: 60,
    nameKey: "shop.items.coastalTownPostcard.name",
    descriptionKey: "shop.items.coastalTownPostcard.description",
    thumbnailAssetKey: assetKeys.shop.coastalTownPostcard,
    previewKind: "item",
  },
  {
    id: "shop-lantern-festival-postcard",
    category: "postcards",
    currency: "crystals",
    price: 20,
    nameKey: "shop.items.lanternFestivalPostcard.name",
    descriptionKey: "shop.items.lanternFestivalPostcard.description",
    thumbnailAssetKey: assetKeys.shop.lanternFestivalPostcard,
    previewKind: "item",
  },
  {
    id: "shop-brass-nest-plaque",
    category: "decorations",
    currency: "crystals",
    price: 30,
    nameKey: "shop.items.brassNestPlaque.name",
    descriptionKey: "shop.items.brassNestPlaque.description",
    thumbnailAssetKey: assetKeys.shop.brassNestPlaque,
    previewKind: "mascot",
  },
  {
    id: "shop-airmail-profile-ribbon",
    category: "decorations",
    currency: "seeds",
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
