import { getSupabaseClient } from "./client";

export const referralTokenStorageKey = "duif.referral.invitationToken";
export type ReferralProgress = { hasInvitation: boolean; qualifiedCount: number; targetCount: number; owlStatus: "locked" | "pending" | "claimed"; owlMascotId: string | null };

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
  const { data, error } = await (clientOrThrow() as any).rpc("get_my_referral_progress");
  if (error) throw error;
  const value = record(data);
  const owlStatus = value.owlStatus === "pending" || value.owlStatus === "claimed" ? value.owlStatus : "locked";
  return { hasInvitation: value.hasInvitation === true, qualifiedCount: typeof value.qualifiedCount === "number" ? value.qualifiedCount : 0, targetCount: typeof value.targetCount === "number" ? value.targetCount : 5, owlStatus, owlMascotId: typeof value.owlMascotId === "string" ? value.owlMascotId : null };
}
export async function claimReferralOwl(name: string) {
  const { data, error } = await (clientOrThrow() as any).rpc("claim_referral_owl", { requested_name: name });
  if (error) throw error;
  return data;
}
