import type { InventoryItem } from "../../game";
import type { TranslationKey } from "../../i18n";
import { readString, readTranslationKey } from "./catalogMappers";
import type { Database } from "./database.types";

export type InventoryItemRow = Database["public"]["Tables"]["inventory_items"]["Row"];

export function mapInventoryItemRow(row: InventoryItemRow): InventoryItem {
  return {
    category: row.category,
    collectedAt: row.collected_at,
    descriptionKey: readTranslationKey(
      row.description_key,
      "rewards.items.wornRouteStamp.description",
    ),
    equipped: row.equipped,
    id: readString(row.mock_key, row.id),
    nameKey: readTranslationKey(row.name_key, "rewards.items.wornRouteStamp.name"),
    rarity: row.rarity,
    sourceKey: row.source_key ? (row.source_key as TranslationKey) : undefined,
    thumbnailAssetPath: row.thumbnail_asset_path ?? undefined,
  };
}
