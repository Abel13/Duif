import type { MascotArchetype } from "../../game/types";
import { getSupabaseClient } from "./client";
import {
  STARTER_MASCOT_IDS,
  mapStarterMascotTemplateRows,
  type MascotTemplateRow,
} from "./catalogMappers";

export async function fetchStarterMascotCatalog(): Promise<MascotArchetype[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("mascot_templates")
    .select("*")
    .eq("status", "active")
    .in("catalog_key", [...STARTER_MASCOT_IDS]);

  if (error) {
    throw error;
  }

  return mapStarterMascotTemplateRows((data ?? []) as MascotTemplateRow[]);
}
