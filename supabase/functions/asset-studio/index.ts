import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Content-Type": "application/json" };
const sourceBucket = "duif-asset-staging";
const publicBucket = "duif-assets";

type ImageInfo = { mime: "image/webp" | "image/svg+xml"; width: number; height: number; byteSize: number; extension: "webp" | "svg" };

Deno.serve(async (request) => {
  if (request.method !== "POST") return response({ error: "method_not_allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!url || !anon || !service || !token) return response({ error: "unauthorized" }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData.user;
  if (userError || !user || user.app_metadata?.duif_role !== "admin") return response({ error: "forbidden" }, 403);
  const admin = createClient(url, service);
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload || typeof payload.action !== "string") return response({ error: "invalid_request" }, 400);

  try {
    if (payload.action === "createUpload") return await createUpload(admin, user.id, payload);
    if (payload.action === "publish") return await publish(admin, user.id, payload);
    if (payload.action === "archive") return await archive(admin, user.id, payload);
    if (payload.action === "activate") return await activate(admin, user.id, payload);
    return response({ error: "invalid_action" }, 400);
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "asset_studio_failed" }, 400);
  }
});

async function createUpload(admin: ReturnType<typeof createClient>, actorId: string, payload: Record<string, unknown>) {
  const key = string(payload.assetKey); const type = string(payload.assetType); const mime = string(payload.mimeType);
  const width = integer(payload.width); const height = integer(payload.height); const byteSize = integer(payload.byteSize);
  const altTextKey = nullableString(payload.altTextKey); const decorative = payload.isDecorative === true;
  const author = string(payload.author); const metadata = payload.metadata;
  if (!key || !type || !mime || !width || !height || !byteSize || !author || !isObject(metadata)) throw new Error("invalid_asset_draft");
  const extension = mime === "image/svg+xml" ? "svg" : mime === "image/webp" ? "webp" : "invalid";
  if (extension === "invalid") throw new Error("unsupported_mime_type");
  const stagingPath = `draft/${crypto.randomUUID()}/1/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await admin.rpc("admin_create_asset_draft", {
    actor_id: actorId, requested_key: key, requested_type: type, requested_mime: mime,
    requested_width: width, requested_height: height, requested_bytes: byteSize,
    requested_alt_key: altTextKey, requested_decorative: decorative, requested_author: author,
    requested_metadata: metadata, staging_object_path: stagingPath,
  });
  if (error || !isObject(data) || typeof data.stagingObjectPath !== "string") throw error ?? new Error("draft_creation_failed");
  const { data: signed, error: signedError } = await admin.storage.from(sourceBucket).createSignedUploadUrl(data.stagingObjectPath);
  if (signedError || !signed?.signedUrl) throw signedError ?? new Error("upload_url_failed");
  return response({ version: data, signedUploadUrl: signed.signedUrl, token: signed.token });
}

async function publish(admin: ReturnType<typeof createClient>, actorId: string, payload: Record<string, unknown>) {
  const versionId = string(payload.versionId); if (!versionId) throw new Error("invalid_version");
  const { data: rows, error } = await admin.from("official_asset_versions")
    .select("id,version,mime_type,storage_bucket,storage_object_path,official_assets!inner(asset_key,asset_type)")
    .eq("id", versionId).eq("status", "draft").single();
  if (error || !rows || rows.storage_bucket !== sourceBucket || !rows.storage_object_path) throw error ?? new Error("draft_not_found");
  const download = await admin.storage.from(sourceBucket).download(rows.storage_object_path);
  if (download.error || !download.data) throw download.error ?? new Error("staging_file_not_found");
  const info = await inspectImage(download.data);
  if (info.mime !== rows.mime_type) throw new Error("file_signature_does_not_match_declared_mime");
  const asset = rows.official_assets as { asset_key?: string }; const key = asset?.asset_key;
  if (!key) throw new Error("invalid_asset_identity");
  const publicPath = `assets/${key.replaceAll(".", "/")}/v${rows.version}.${info.extension}`;
  const upload = await admin.storage.from(publicBucket).upload(publicPath, download.data, { contentType: info.mime, upsert: false });
  if (upload.error && !/already exists/i.test(upload.error.message)) throw upload.error;
  const { error: validateError } = await admin.rpc("admin_validate_asset_draft", {
    actor_id: actorId, version_id: versionId, observed_mime: info.mime,
    observed_width: info.width, observed_height: info.height, observed_bytes: info.byteSize,
  });
  if (validateError) { await admin.storage.from(publicBucket).remove([publicPath]); throw validateError; }
  const { data: activated, error: activationError } = await admin.rpc("admin_activate_asset_version", { actor_id: actorId, version_id: versionId, public_object_path: publicPath });
  if (activationError) { await admin.storage.from(publicBucket).remove([publicPath]); throw activationError; }
  await admin.storage.from(sourceBucket).remove([rows.storage_object_path]);
  return response({ version: activated });
}

async function archive(admin: ReturnType<typeof createClient>, actorId: string, payload: Record<string, unknown>) {
  const versionId = string(payload.versionId); if (!versionId) throw new Error("invalid_version");
  const { data, error } = await admin.rpc("admin_archive_asset_version", { actor_id: actorId, version_id: versionId });
  if (error) throw error; return response({ version: data });
}

async function activate(admin: ReturnType<typeof createClient>, actorId: string, payload: Record<string, unknown>) {
  const versionId = string(payload.versionId); const publicPath = string(payload.publicObjectPath);
  if (!versionId || !publicPath) throw new Error("invalid_version");
  const { data, error } = await admin.rpc("admin_activate_asset_version", { actor_id: actorId, version_id: versionId, public_object_path: publicPath });
  if (error) throw error; return response({ version: data });
}

async function inspectImage(blob: Blob): Promise<ImageInfo> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes.length < 16) throw new Error("invalid_image_file");
  const text = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 4096))).trimStart();
  if (text.startsWith("<svg") || text.startsWith("<?xml")) {
    const viewBox = text.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
    const width = numericAttribute(text, "width") ?? (viewBox ? Number(viewBox[1]) : undefined);
    const height = numericAttribute(text, "height") ?? (viewBox ? Number(viewBox[2]) : undefined);
    if (!width || !height) throw new Error("svg_requires_dimensions");
    return { mime: "image/svg+xml", width, height, byteSize: bytes.length, extension: "svg" };
  }
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") throw new Error("unsupported_file_signature");
  const chunk = ascii(bytes, 12, 4);
  let width = 0; let height = 0;
  if (chunk === "VP8X" && bytes.length >= 30) { width = 1 + read24(bytes, 24); height = 1 + read24(bytes, 27); }
  else if (chunk === "VP8 " && bytes.length >= 30) { width = bytes[26] | (bytes[27] << 8); height = bytes[28] | (bytes[29] << 8); }
  else if (chunk === "VP8L" && bytes.length >= 25) { const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24); width = (bits & 0x3fff) + 1; height = ((bits >> 14) & 0x3fff) + 1; }
  if (!width || !height) throw new Error("webp_dimensions_unreadable");
  return { mime: "image/webp", width, height, byteSize: bytes.length, extension: "webp" };
}

function response(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers }); }
function string(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function nullableString(value: unknown) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function integer(value: unknown) { return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : 0; }
function isObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function ascii(bytes: Uint8Array, start: number, length: number) { return String.fromCharCode(...bytes.slice(start, start + length)); }
function read24(bytes: Uint8Array, start: number) { return bytes[start] | (bytes[start + 1] << 8) | (bytes[start + 2] << 16); }
function numericAttribute(svg: string, name: string) { const match = svg.match(new RegExp(`${name}\\s*=\\s*["']([\\d.]+)(?:px)?["']`, "i")); return match ? Number(match[1]) : undefined; }
