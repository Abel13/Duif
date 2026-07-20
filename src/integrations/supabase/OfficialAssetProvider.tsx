import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import {
  parseOfficialAssetManifest,
  resolveOfficialAssetPath,
  setActiveOfficialAssetManifest,
  type OfficialAssetKey,
  type OfficialAssetManifest,
  type OfficialAssetManifestRow,
} from "../../game/assets";
import { getSupabaseClient } from "./client";

type OfficialAssetContextValue = {
  manifest: OfficialAssetManifest;
  status: "loading" | "ready" | "unavailable";
  resolve: (key?: OfficialAssetKey) => string | undefined;
};

const emptyManifest: OfficialAssetManifest = new Map();
const OfficialAssetContext = createContext<OfficialAssetContextValue>({
  manifest: emptyManifest,
  status: "loading",
  resolve: () => undefined,
});

export function OfficialAssetProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<OfficialAssetManifest>(emptyManifest);
  const [status, setStatus] = useState<OfficialAssetContextValue["status"]>("loading");

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("unavailable");
      return;
    }
    const client = supabase;
    let active = true;
    async function loadManifest() {
      try {
        const { data, error } = await client.from("official_asset_versions")
          .select("version,source,status,packaged_path,storage_bucket,storage_object_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,official_assets!inner(asset_key,asset_type)")
          .eq("status", "active");
        if (!active) return;
        if (error) throw error;
        const rows = (data ?? []).map((row) => row.source === "storage" && row.storage_bucket && row.storage_object_path
          ? { ...row, resolved_path: client.storage.from(row.storage_bucket).getPublicUrl(row.storage_object_path).data.publicUrl }
          : row);
        const nextManifest = parseOfficialAssetManifest(rows as unknown as OfficialAssetManifestRow[]);
        setActiveOfficialAssetManifest(nextManifest);
        setManifest(nextManifest);
        setStatus("ready");
      } catch {
        if (active) setStatus("unavailable");
      }
    }
    void loadManifest();
    return () => { active = false; };
  }, []);

  const value = useMemo<OfficialAssetContextValue>(() => ({
    manifest,
    status,
    resolve: (key) => resolveOfficialAssetPath(manifest, key),
  }), [manifest, status]);
  return <OfficialAssetContext.Provider value={value}>{children}</OfficialAssetContext.Provider>;
}

export function useOfficialAssets() {
  return useContext(OfficialAssetContext);
}
