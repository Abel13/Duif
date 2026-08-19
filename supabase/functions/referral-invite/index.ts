import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Content-Type": "application/json" };

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply({ error: "method_not_allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const secret = Deno.env.get("REFERRAL_INVITE_SIGNING_SECRET") ?? "";
  if (!url || !anon || secret.length < 32) return reply({ error: "service_unavailable" }, 503);
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = typeof payload?.action === "string" ? payload.action : "";
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const client = createClient(url, anon, token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined);
  try {
    if (action === "resolve") return await resolve(client, secret, payload ?? {});
    if (!token) return reply({ error: "unauthorized" }, 401);
    const { data: identity } = await client.auth.getUser(token);
    if (!identity.user) return reply({ error: "unauthorized" }, 401);
    if (action === "issue" || action === "rotate") return await issue(client, secret, action === "rotate");
    if (action === "capture") return await capture(client, payload ?? {});
    return reply({ error: "invalid_action" }, 400);
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "referral_unavailable" }, 400);
  }
});

async function issue(client: ReturnType<typeof createClient>, secret: string, rotate: boolean) {
  const { data, error } = await client.rpc(rotate ? "rotate_my_referral_invitation" : "ensure_my_referral_invitation");
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row || typeof row.link_id !== "string" || typeof row.version !== "number") throw error ?? new Error("invitation_unavailable");
  const invitationToken = await sign(`${row.link_id}.${row.version}`, secret);
  const digest = await sha256(invitationToken);
  const { error: storeError } = await client.rpc("store_my_referral_invitation_digest", { link_id: row.link_id, link_version: row.version, digest_value: digest });
  if (storeError) throw storeError;
  return reply({ token: invitationToken });
}

async function resolve(client: ReturnType<typeof createClient>, secret: string, payload: Record<string, unknown>) {
  const invitationToken = text(payload.token);
  if (!await verify(invitationToken, secret)) return reply({ valid: false });
  const { data, error } = await client.rpc("resolve_referral_invitation", { invitation_token: invitationToken });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row || typeof row.inviter_name !== "string") return reply({ valid: false });
  return reply({ valid: true, inviterName: row.inviter_name });
}

async function capture(client: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const invitationToken = text(payload.token);
  if (!invitationToken) return reply({ outcome: "invalid" });
  const { data, error } = await client.rpc("capture_referral_invitation", { invitation_token: invitationToken });
  if (error) throw error;
  return reply({ outcome: typeof data === "string" ? data : "invalid" });
}

async function sign(payload: string, secret: string) {
  const signature = await crypto.subtle.sign("HMAC", await key(secret), new TextEncoder().encode(payload));
  return `${base64url(new TextEncoder().encode(payload))}.${base64url(new Uint8Array(signature))}`;
}
async function verify(token: string, secret: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || token.length > 512) return false;
  return crypto.subtle.verify("HMAC", await key(secret), fromBase64url(signature), fromBase64url(encoded));
}
async function key(secret: string) { return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]); }
async function sha256(value: string) { const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))); return [...bytes].map((part) => part.toString(16).padStart(2, "0")).join(""); }
function base64url(value: Uint8Array) { return btoa(String.fromCharCode(...value)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, ""); }
function fromBase64url(value: string) { const base64 = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4); return Uint8Array.from(atob(base64), (part) => part.charCodeAt(0)); }
function text(value: unknown) { return typeof value === "string" && value.length <= 512 ? value : ""; }
function reply(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers }); }
