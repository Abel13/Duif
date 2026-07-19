function readEnvValue(key: string) {
  const value = import.meta.env[key];

  return typeof value === "string" ? value.trim() : "";
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
  return getSupabaseConfig().isConfigured;
}
