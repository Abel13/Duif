import type { InventoryItem } from "../../game";
import { isOfficialAssetKey } from "../../game/assets";
import type { TranslationKey } from "../../i18n";
import { requireTranslationKey } from "./catalogMappers";
import type { Database } from "./database.types";

export type InventoryItemRow = Database["public"]["Tables"]["inventory_items"]["Row"];

export function mapInventoryItemRow(row: InventoryItemRow): InventoryItem {
  return {
    category: row.category,
    collectedAt: row.collected_at,
    descriptionKey: requireTranslationKey(row.description_key, "inventory description key"),
    equipped: row.equipped,
    id: row.id,
    nameKey: requireTranslationKey(row.name_key, "inventory name key"),
    rarity: row.rarity,
    sourceKey: row.source_key ? (row.source_key as TranslationKey) : undefined,
    thumbnailAssetKey: isOfficialAssetKey(row.thumbnail_asset_key) ? row.thumbnail_asset_key : undefined,
  };
}
