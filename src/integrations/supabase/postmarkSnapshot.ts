import type { PostmarkColorId, PostmarkModelId } from "../../game";
import { getSupabaseClient } from "./client";

export type AuthoritativePostmark = {
  city: string;
  color: PostmarkColorId;
  country: string;
  date: string;
  dateSource?: "origin-local-v1" | "utc-fallback-v1";
  model: PostmarkModelId;
  stampedAt?: string;
  timeZone?: string;
};

const models: PostmarkModelId[] = ["classic", "route", "wing"];
const colors: PostmarkColorId[] = ["brown", "blue", "red", "green", "gold", "plum", "charcoal", "teal"];

export function mapAuthoritativePostmark(value: unknown): AuthoritativePostmark | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const item = value as Record<string, unknown>;
  if (typeof item.city !== "string" || typeof item.country !== "string" || typeof item.date !== "string") return undefined;
  return {
    city: item.city,
    color: colors.includes(item.color as PostmarkColorId) ? item.color as PostmarkColorId : "brown",
    country: item.country,
    date: item.date,
    dateSource: item.dateSource === "origin-local-v1" || item.dateSource === "utc-fallback-v1" ? item.dateSource : undefined,
    model: models.includes(item.model as PostmarkModelId) ? item.model as PostmarkModelId : "classic",
    stampedAt: typeof item.stampedAt === "string" ? item.stampedAt : undefined,
    timeZone: typeof item.timeZone === "string" ? item.timeZone : undefined,
  };
}

export async function previewOriginPostmark(returnDeliveryId?: string): Promise<AuthoritativePostmark | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) return undefined;
  const { data, error } = await supabase.rpc("preview_origin_postmark", { target_delivery_id:returnDeliveryId??undefined });
  if (error) throw error;
  return mapAuthoritativePostmark(data);
}

export async function fetchDeliveryPostmarkSnapshot(deliveryId: string): Promise<AuthoritativePostmark | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) return undefined;
  const { data, error } = await supabase.rpc("get_delivery_postmark_snapshot", { target_delivery_id: deliveryId });
  if (error) throw error;
  return mapAuthoritativePostmark(data);
}
