import { getSupabaseClient } from "./client";

export const referralTokenStorageKey = "duif.referral.invitationToken";
export const referralInvitationLifetimeMs = 7 * 24 * 60 * 60 * 1000;
export type ReferralProgress = { hasInvitation: boolean; qualifiedCount: number; targetCount: number; owlStatus: "locked" | "pending" | "claimed"; owlMascotId: string | null };
type ReferralInvitationStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type StoredReferralInvitation = { token: string; expiresAt: number };

function parseStoredInvitation(value: string | null, now: number): StoredReferralInvitation | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredReferralInvitation>;
    if (typeof parsed.token === "string" && parsed.token.length >= 40 && typeof parsed.expiresAt === "number" && parsed.expiresAt > now) {
      return { token: parsed.token, expiresAt: parsed.expiresAt };
    }
  } catch { /* A plain token is the legacy session format. */ }
  return null;
}

export function storeReferralInvitation(token: string, storage: ReferralInvitationStorage = window.localStorage, now = Date.now()) {
  storage.setItem(referralTokenStorageKey, JSON.stringify({ token, expiresAt: now + referralInvitationLifetimeMs }));
}

export function clearStoredReferralInvitation(
  localStorage: ReferralInvitationStorage = window.localStorage,
  sessionStorage: ReferralInvitationStorage = window.sessionStorage,
) {
  localStorage.removeItem(referralTokenStorageKey);
  sessionStorage.removeItem(referralTokenStorageKey);
}

export function getStoredReferralInvitation(
  localStorage: ReferralInvitationStorage = window.localStorage,
  sessionStorage: ReferralInvitationStorage = window.sessionStorage,
  now = Date.now(),
) {
  const current = parseStoredInvitation(localStorage.getItem(referralTokenStorageKey), now);
  if (current) return current.token;
  localStorage.removeItem(referralTokenStorageKey);
  const legacy = sessionStorage.getItem(referralTokenStorageKey);
  if (legacy && legacy.length >= 40) {
    storeReferralInvitation(legacy, localStorage, now);
    sessionStorage.removeItem(referralTokenStorageKey);
    return legacy;
  }
  sessionStorage.removeItem(referralTokenStorageKey);
  return null;
}

function clientOrThrow() { const client = getSupabaseClient(); if (!client) throw new Error("Supabase unavailable"); return client; }
function record(value: unknown): Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}; }

async function invoke(action: string, body: Record<string, unknown> = {}) {
  const { data, error } = await clientOrThrow().functions.invoke("referral-invite", { body: { action, ...body } });
  if (error) throw error;
  return record(data);
}

export async function getMyReferralInvitation(rotate = false) {
  const data = await invoke(rotate ? "rotate" : "issue");
  if (typeof data.token !== "string") throw new Error("Invitation unavailable");
  return data.token;
}
export async function resolveReferralInvitation(token: string) {
  const data = await invoke("resolve", { token });
  return { valid: data.valid === true, inviterName: typeof data.inviterName === "string" ? data.inviterName : "" };
}
export async function captureReferralInvitation(token: string) {
  const data = await invoke("capture", { token });
  return typeof data.outcome === "string" ? data.outcome : "invalid";
}
export async function getReferralProgress(): Promise<ReferralProgress> {
  const { data, error } = await clientOrThrow().rpc("get_my_referral_progress");
  if (error) throw error;
  const value = record(data);
  const owlStatus = value.owlStatus === "pending" || value.owlStatus === "claimed" ? value.owlStatus : "locked";
  return { hasInvitation: value.hasInvitation === true, qualifiedCount: typeof value.qualifiedCount === "number" ? value.qualifiedCount : 0, targetCount: typeof value.targetCount === "number" ? value.targetCount : 5, owlStatus, owlMascotId: typeof value.owlMascotId === "string" ? value.owlMascotId : null };
}
export async function claimReferralOwl(name: string) {
  const { data, error } = await clientOrThrow().rpc("claim_referral_owl", { requested_name: name });
  if (error) throw error;
  return data;
}
