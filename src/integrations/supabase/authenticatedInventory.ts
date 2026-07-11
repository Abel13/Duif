import type { InventoryItem } from "../../game";
import { getSupabaseClient } from "./client";
import { mapInventoryItemRow } from "./inventoryMappers";

export async function fetchAuthenticatedInventoryItems(
  profileId: string,
): Promise<InventoryItem[] | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("owner_profile_id", profileId)
    .order("collected_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapInventoryItemRow);
}
