import { starterMascots } from "../../game/mockData";
import type { Mascot } from "../../game/types";
import { getSupabaseClient } from "./client";
import {
  STARTER_MASCOT_IDS,
  mapStarterMascotTemplateRows,
  type MascotTemplateRow,
} from "./catalogMappers";

export async function fetchStarterMascotCatalog(): Promise<Mascot[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return starterMascots;
  }

  const { data, error } = await supabase
    .from("mascot_templates")
    .select("*")
    .in("mock_key", [...STARTER_MASCOT_IDS]);

  if (error || !data || data.length === 0) {
    return starterMascots;
  }

  return mapStarterMascotTemplateRows(data as MascotTemplateRow[]);
}
