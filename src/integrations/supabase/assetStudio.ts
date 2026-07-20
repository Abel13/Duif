import { getSupabaseClient } from "./client";

export type AssetStudioVersion = { id: string; version: number; source: "packaged" | "storage"; status: "draft" | "active" | "archived"; packagedPath: string | null; storageBucket: string | null; storageObjectPath: string | null; mimeType: string; width: number; height: number; byteSize: number; altTextKey: string | null; isDecorative: boolean; author: string; metadata: Record<string, unknown>; createdAt: string };
export type AssetStudioAsset = { id: string; key: string; type: string; createdAt: string; versions: AssetStudioVersion[]; usage: Record<string, number> };

export function isAssetAdministrator(appMetadata: unknown) {
  return typeof appMetadata === "object" && appMetadata !== null && (appMetadata as { duif_role?: unknown }).duif_role === "admin";
}

export async function listStudioAssets(): Promise<AssetStudioAsset[]> {
  const supabase = getSupabaseClient(); if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.rpc("admin_list_official_assets");
  if (error || !Array.isArray(data)) throw error ?? new Error("Asset studio unavailable");
  return (data as unknown[]).filter(isAsset);
}

export async function createAssetUpload(input: { assetKey: string; assetType: string; file: File; altTextKey: string | null; isDecorative: boolean; author: string }) {
  const supabase = getSupabaseClient(); if (!supabase) throw new Error("Supabase is not configured");
  const dimensions = await getImageDimensions(input.file);
  const { data, error } = await supabase.functions.invoke("asset-studio", { body: {
    action: "createUpload", assetKey: input.assetKey, assetType: input.assetType,
    mimeType: input.file.type, width: dimensions.width, height: dimensions.height, byteSize: input.file.size,
    altTextKey: input.altTextKey, isDecorative: input.isDecorative, author: input.author,
    metadata: { kind: input.assetType },
  } });
  if (error || !data?.signedUploadUrl || !data?.version?.versionId) throw error ?? new Error("Could not create asset draft");
  const upload = await fetch(data.signedUploadUrl, { method: "PUT", headers: { "Content-Type": input.file.type }, body: input.file });
  if (!upload.ok) throw new Error("Could not upload asset draft");
  return data.version as { versionId: string; version: number };
}

export async function publishAssetDraft(versionId: string) { return invokeStudioAction("publish", { versionId }); }
export async function archiveAssetVersion(versionId: string) { return invokeStudioAction("archive", { versionId }); }
export async function activateAssetVersion(versionId: string, publicObjectPath: string) { return invokeStudioAction("activate", { versionId, publicObjectPath }); }

async function invokeStudioAction(action: string, value: Record<string, unknown>) {
  const supabase = getSupabaseClient(); if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.functions.invoke("asset-studio", { body: { action, ...value } });
  if (error || !data?.version) throw error ?? new Error("Asset studio action failed"); return data.version as AssetStudioVersion;
}

function isAsset(value: unknown): value is AssetStudioAsset {
  return typeof value === "object" && value !== null && typeof (value as AssetStudioAsset).id === "string" && typeof (value as AssetStudioAsset).key === "string" && Array.isArray((value as AssetStudioAsset).versions);
}

async function getImageDimensions(file: File) {
  if (file.type === "image/svg+xml") {
    const text = await file.text(); const box = text.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
    if (!box) throw new Error("SVG must include a viewBox"); return { width: Number(box[1]), height: Number(box[2]) };
  }
  const bitmap = await createImageBitmap(file); try { return { width: bitmap.width, height: bitmap.height }; } finally { bitmap.close(); }
}
