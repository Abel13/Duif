import type { Database } from "./database.types";

export type AuthProfile = Database["public"]["Tables"]["profiles"]["Row"];

export function getProfileDisplayLabel(profile: AuthProfile | null) {
  return profile?.display_name ?? "";
}
