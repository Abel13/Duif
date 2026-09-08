import { getSupabaseClient } from "./client";

export type PushPreferences = {
  enabled: boolean;
  correspondenceArrived: boolean;
  returnPrepRemaining: boolean;
  returnDeparted: boolean;
  readyForCollection: boolean;
  locale: "pt-BR" | "en-US";
};

export type PushSupportState =
  | "unsupported"
  | "missingVapid"
  | "denied"
  | "default"
  | "granted";

function readVapidPublicKey() {
  const value = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  return typeof value === "string" ? value.trim() : "";
}

export function getPushSupportState(): PushSupportState {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  if (!readVapidPublicKey()) return "missingVapid";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "granted") return "granted";
  return "default";
}

export function isPushOptInAvailable() {
  const state = getPushSupportState();
  return state === "default" || state === "granted";
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

function unpackSubscription(subscription: PushSubscription) {
  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    throw new Error("Invalid push subscription");
  }
  return { endpoint, p256dh, auth };
}

export async function fetchPushPreferences(): Promise<PushPreferences> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const { data, error } = await supabase.rpc("get_push_preferences");
  if (error || !data) throw error ?? new Error("Push preferences unavailable");
  const row = data as {
    enabled: boolean;
    correspondence_arrived: boolean;
    return_prep_remaining: boolean;
    return_departed: boolean;
    ready_for_collection: boolean;
    locale: string;
  };
  return {
    enabled: Boolean(row.enabled),
    correspondenceArrived: Boolean(row.correspondence_arrived),
    returnPrepRemaining: Boolean(row.return_prep_remaining),
    returnDeparted: Boolean(row.return_departed),
    readyForCollection: Boolean(row.ready_for_collection),
    locale: row.locale === "en-US" ? "en-US" : "pt-BR",
  };
}

export async function savePushPreferences(preferences: PushPreferences): Promise<PushPreferences> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const { data, error } = await supabase.rpc("upsert_push_preferences", {
    master_enabled: preferences.enabled,
    allow_correspondence_arrived: preferences.correspondenceArrived,
    allow_return_prep_remaining: preferences.returnPrepRemaining,
    allow_return_departed: preferences.returnDeparted,
    allow_ready_for_collection: preferences.readyForCollection,
    preferred_locale: preferences.locale,
  });
  if (error || !data) throw error ?? new Error("Push preferences could not be saved");
  return fetchPushPreferences();
}

export async function enablePushNotifications(locale: "pt-BR" | "en-US") {
  const support = getPushSupportState();
  if (support === "unsupported" || support === "missingVapid") {
    throw new Error("Push unsupported");
  }
  if (support === "denied") {
    throw new Error("Push permission denied");
  }

  const permission = Notification.permission === "granted"
    ? "granted"
    : await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Push permission denied");
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(readVapidPublicKey()),
  });

  const packed = unpackSubscription(subscription);
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const { error } = await supabase.rpc("register_push_subscription", {
    subscription_endpoint: packed.endpoint,
    subscription_p256dh: packed.p256dh,
    subscription_auth: packed.auth,
    subscription_user_agent: navigator.userAgent,
    preferred_locale: locale,
  });
  if (error) throw error;
  return fetchPushPreferences();
}

export async function disablePushNotifications() {
  const current = await fetchPushPreferences().catch((): PushPreferences => ({
    enabled: false,
    correspondenceArrived: true,
    returnPrepRemaining: true,
    returnDeparted: true,
    readyForCollection: true,
    locale: "pt-BR",
  }));
  const registration = "serviceWorker" in navigator
    ? await navigator.serviceWorker.getRegistration()
    : undefined;
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe().catch(() => undefined);
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.rpc("revoke_push_subscription", {
        subscription_endpoint: endpoint,
      }).then(() => undefined, () => undefined);
    }
  }
  return savePushPreferences({ ...current, enabled: false });
}
