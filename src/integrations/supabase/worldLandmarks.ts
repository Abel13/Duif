import { parseWorldLandmarksPayload, type WorldLandmark } from "../../game";
import { getSupabaseClient } from "./client";

export async function reconcileWorldLandmarks(): Promise<WorldLandmark[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.rpc("reconcile_my_world_landmarks");
  if (error) throw error;
  return parseWorldLandmarksPayload(data);
}

export async function acknowledgeWorldLandmark(catalogKey: string) {
  const client = getSupabaseClient();
  if (!client) return false;
  const { data, error } = await client.rpc("acknowledge_world_landmark", { target_catalog_key: catalogKey });
  if (error) throw error;
  return data === true;
}
