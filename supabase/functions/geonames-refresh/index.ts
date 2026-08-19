import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const headers = { "Content-Type": "application/json" };
const citiesUrl = "https://download.geonames.org/export/dump/cities15000.zip";
const admin1Url = "https://download.geonames.org/export/dump/admin1CodesASCII.txt";

Deno.serve(async (request) => {
  if (request.method !== "POST") return respond({ error: "method_not_allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL") ?? ""; const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? ""; const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!url || !anon || !service || !token) return respond({ error: "unauthorized" }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: identity } = await userClient.auth.getUser(token); const user = identity.user;
  if (!user || user.app_metadata?.duif_role !== "admin") return respond({ error: "forbidden" }, 403);
  const admin = createClient(url, service);
  const { data: job, error: startError } = await admin.rpc("admin_begin_geonames_refresh", { actor_id: user.id });
  if (startError || !job?.id) return respond({ error: "refresh_unavailable" }, 409);
  try {
    await awaitResult(admin.from("geonames_refresh_jobs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", job.id), "job_update_failed");
    const [archiveResponse, admin1Response] = await Promise.all([fetch(citiesUrl), fetch(admin1Url)]);
    if (!archiveResponse.ok || !admin1Response.ok) throw new Error("download_failed");
    const archiveBytes = new Uint8Array(await archiveResponse.arrayBuffer()); const admin1Text = await admin1Response.text();
    if (archiveBytes.byteLength < 1024 || admin1Text.length < 1024) throw new Error("invalid_geonames_archive");
    const zip = await JSZip.loadAsync(archiveBytes, { checkCRC32: true }); const cityFile = zip.file("cities15000.txt");
    const citiesText = cityFile ? await cityFile.async("string") : "";
    const cities = citiesText.trim().split("\n").map(parseCity).filter(Boolean);
    const regions = admin1Text.trim().split("\n").map(parseRegion).filter(Boolean);
    if (cities.length < 1000 || regions.length < 100) throw new Error("invalid_geonames_dataset");
    const sourceSha = await sha256(archiveBytes); const adminSha = await sha256(new TextEncoder().encode(admin1Text));
    const sourceDate = new Date().toISOString().slice(0, 10);
    for (const batch of chunks(regions, 500)) await awaitResult(admin.from("geonames_refresh_region_staging").insert(batch.map((row) => ({ ...row, job_id: job.id }))), "stage_regions_failed");
    for (const batch of chunks(cities, 500)) await awaitResult(admin.from("geonames_refresh_city_staging").insert(batch.map((row) => ({ ...row, job_id: job.id }))), "stage_cities_failed");
    const { data: result, error: finalizeError } = await admin.rpc("admin_finalize_geonames_refresh", { refresh_job_id: job.id, actor_id: user.id, imported_source_date: sourceDate, imported_source_sha256: sourceSha, imported_admin1_sha256: adminSha });
    if (finalizeError || !result) throw new Error("finalize_refresh_failed");
    return respond({ jobId: job.id, ...result });
  } catch (error) {
    const code = error instanceof Error && /^[a-z0-9_]+$/.test(error.message) ? error.message : "refresh_failed";
    await admin.from("geonames_refresh_city_staging").delete().eq("job_id", job.id);
    await admin.from("geonames_refresh_region_staging").delete().eq("job_id", job.id);
    await admin.from("geonames_refresh_jobs").update({ status: "failed", safe_error_code: code, completed_at: new Date().toISOString() }).eq("id", job.id);
    return respond({ error: code }, 400);
  }
});

function parseCity(line: string) { const v = line.split("\t"); const geonameId = Number(v[0]); const latitude = Number(v[4]); const longitude = Number(v[5]); if (v.length < 19 || v[6] !== "P" || !Number.isSafeInteger(geonameId) || !v[1] || !/^[A-Z]{2}$/.test(v[8] ?? "") || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null; return { geoname_id: geonameId, name: v[1], ascii_name: v[2] || v[1], alternate_names: v[3] || "", latitude, longitude, country_code: v[8], admin1_code: v[10] || null, population: Math.max(0, Number(v[14]) || 0), search_text: `${v[1]} ${v[2]} ${v[3]}`.toLowerCase() }; }
function parseRegion(line: string) { const v = line.split("\t"); const [country_code, admin1_code] = (v[0] ?? "").split("."); return /^[A-Z]{2}$/.test(country_code ?? "") && admin1_code && v[1] ? { country_code, admin1_code, name: v[1], ascii_name: v[2] || v[1], geoname_id: Number(v[3]) || null } : null; }
function chunks<T>(items: T[], size: number) { return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size)); }
async function awaitResult(request: PromiseLike<{ error: unknown }>, fallback: string) { const { error } = await request; if (error) throw new Error(fallback); }
async function sha256(value: Uint8Array) { const hash = await crypto.subtle.digest("SHA-256", value); return [...new Uint8Array(hash)].map((part) => part.toString(16).padStart(2, "0")).join(""); }
function respond(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers }); }
