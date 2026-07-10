export type DuifDataSource = "mock" | "supabase";

const SUPABASE_SOURCE: DuifDataSource = "supabase";

function readEnvValue(key: string) {
  const value = import.meta.env[key];

  return typeof value === "string" ? value.trim() : "";
}

export function getDuifDataSource(): DuifDataSource {
  return readEnvValue("VITE_DUIF_DATA_SOURCE") === SUPABASE_SOURCE
    ? SUPABASE_SOURCE
    : "mock";
}

export function getSupabaseConfig() {
  const url = readEnvValue("VITE_SUPABASE_URL");
  const anonKey = readEnvValue("VITE_SUPABASE_ANON_KEY");

  return {
    anonKey,
    isConfigured: url.length > 0 && anonKey.length > 0,
    url,
  };
}

export function isSupabaseCatalogEnabled() {
  return getDuifDataSource() === SUPABASE_SOURCE && getSupabaseConfig().isConfigured;
}
