import { getSupabaseClient } from "./client";

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const cachedTimeZones = new Map<string, string>();

export function getBrowserTimeZone() {
  return browserTimeZone;
}

/**
 * The RPC validates delivery ownership and only returns an IANA name. It never
 * exposes timezone boundary geometry to the browser.
 */
export async function resolveDeliveryVisualTimeZone(deliveryId: string, latitude: number, longitude: number) {
  const cacheKey = `${deliveryId}:${latitude.toFixed(5)}:${longitude.toFixed(5)}`;
  const cached = cachedTimeZones.get(cacheKey);
  if (cached) return cached;
  const supabase = getSupabaseClient();
  if (!supabase) return browserTimeZone;
  const { data, error } = await supabase.rpc("resolve_delivery_visual_timezone", {
    delivery_id: deliveryId,
    latitude,
    longitude,
  });
  if (error || typeof data !== "string" || !data) return browserTimeZone;
  cachedTimeZones.set(cacheKey, data);
  return data;
}
