import { getSupabaseClient } from "./client";

export type PostalFriendCode = { code: string; createdAt: string; rotatedAt: string };
export type PostalFriend = { id: string; profileId: string; displayName: string; city: string | null; state: string | null; country: string | null; friendshipLevel: number; exchangeCount: number };
export type FriendshipRequest = { id: string; displayName: string; createdAt: string };
export type PostalConnections = { accepted: PostalFriend[]; incoming: FriendshipRequest[]; outgoing: FriendshipRequest[] };
export type FriendRequestOutcome = "sent" | "alreadyPending" | "alreadyFriends" | "receivedPending" | "unavailable";

function clientOrThrow() { const client = getSupabaseClient(); if (!client) throw new Error("Supabase unavailable"); return client; }
function asRecord(value: unknown): Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function asString(value: unknown) { return typeof value === "string" ? value : ""; }

function mapCode(row: unknown): PostalFriendCode {
  const value = asRecord(row);
  return { code: asString(value.code), createdAt: asString(value.created_at), rotatedAt: asString(value.rotated_at) };
}
function mapRequest(row: unknown): FriendshipRequest { const value = asRecord(row); return { id: asString(value.id), displayName: asString(value.displayName), createdAt: asString(value.createdAt) }; }
function mapFriend(row: unknown): PostalFriend { const value = asRecord(row); return { id: asString(value.id), profileId: asString(value.profileId), displayName: asString(value.displayName), city: typeof value.city === "string" ? value.city : null, state: typeof value.state === "string" ? value.state : null, country: typeof value.country === "string" ? value.country : null, friendshipLevel: typeof value.friendshipLevel === "number" ? value.friendshipLevel : 1, exchangeCount: typeof value.exchangeCount === "number" ? value.exchangeCount : 0 }; }

export async function getPostalFriendCode() {
  const { data, error } = await (clientOrThrow() as any).rpc("get_my_postal_friend_code");
  if (error || !Array.isArray(data) || !data[0]) throw error ?? new Error("Postal code unavailable");
  return mapCode(data[0]);
}
export async function regeneratePostalFriendCode() {
  const { data, error } = await (clientOrThrow() as any).rpc("regenerate_my_postal_friend_code");
  if (error || !Array.isArray(data) || !data[0]) throw error ?? new Error("Postal code unavailable");
  return mapCode(data[0]);
}
export async function listPostalConnections(): Promise<PostalConnections> {
  const { data, error } = await (clientOrThrow() as any).rpc("list_my_postal_connections");
  if (error) throw error;
  const value = asRecord(data);
  return { accepted: Array.isArray(value.accepted) ? value.accepted.map(mapFriend).filter((friend) => friend.id && friend.profileId) : [], incoming: Array.isArray(value.incoming) ? value.incoming.map(mapRequest).filter((request) => request.id) : [], outgoing: Array.isArray(value.outgoing) ? value.outgoing.map(mapRequest).filter((request) => request.id) : [] };
}
export async function requestPostalFriendship(code: string): Promise<FriendRequestOutcome> {
  const { data, error } = await (clientOrThrow() as any).rpc("request_friendship_by_postal_code", { submitted_code: code });
  if (error) throw error;
  const outcome = Array.isArray(data) ? asString(asRecord(data[0]).outcome) : "";
  return ["sent", "alreadyPending", "alreadyFriends", "receivedPending", "unavailable"].includes(outcome) ? outcome as FriendRequestOutcome : "unavailable";
}
export async function respondToPostalFriendRequest(id: string, accept: boolean) {
  const { data, error } = await (clientOrThrow() as any).rpc("respond_to_postal_friend_request", { friendship_id: id, should_accept: accept });
  if (error) throw error;
  const row = Array.isArray(data) ? asRecord(data[0]) : {};
  return { profileId: asString(row.profile_id), accepted: row.accepted === true };
}
