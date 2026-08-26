import { getSupabaseClient } from "./client";

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const cachedTimeZones = new Map<string, string>();
const persistedDeliveryIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function getBrowserTimeZone() {
  return browserTimeZone;
}

export function isPersistedDeliveryId(deliveryId: string) {
  return persistedDeliveryIdPattern.test(deliveryId);
}

/**
 * The RPC validates delivery ownership and only returns an IANA name. It never
 * exposes timezone boundary geometry to the browser.
 */
export async function resolveDeliveryVisualTimeZone(deliveryId: string, latitude: number, longitude: number) {
  if (!isPersistedDeliveryId(deliveryId)) return browserTimeZone;
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
