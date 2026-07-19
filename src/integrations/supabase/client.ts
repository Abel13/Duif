import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabaseConfig } from "./config";

let supabaseClient: SupabaseClient<Database> | null = null;

export const supabaseAuthOptions = {
  detectSessionInUrl: false,
  flowType: "pkce",
} as const;

export function getSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(config.url, config.anonKey, {
      auth: supabaseAuthOptions,
    });
  }

  return supabaseClient;
}
