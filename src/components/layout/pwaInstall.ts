import { sanitizeIntendedRoute } from "../../integrations/supabase/authContracts";

export type PwaInstallGateState =
  | "bypass"
  | "installed"
  | "promptAvailable"
  | "iosInstructions"
  | "manualInstructions"
  | "unsupportedBrowser"
  | "installedInBrowser";

export type PwaDeviceSnapshot = {
  coarsePointer: boolean;
  noHover: boolean;
  maxTouchPoints: number;
  platform: string;
  userAgent: string;
};

type StoredDestination = { path: string; savedAt: number };

export const PWA_DESTINATION_TTL_MS = 24 * 60 * 60 * 1000;
export const PWA_DESTINATION_STORAGE_KEY = "duif.pwa.intendedRoute";

const callbackPaths = new Set(["/auth/callback", "/auth/reset-password"]);
const embeddedBrowserPattern = /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|Twitter|GSA\/|; wv\)/i;

export function isPwaGateEnabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function isPwaRouteException(pathname: string) {
  return callbackPaths.has(pathname);
}

export function isMobileOrTablet(snapshot: PwaDeviceSnapshot) {
  const ipadDesktopMode = snapshot.platform === "MacIntel" && snapshot.maxTouchPoints > 1;
  return (snapshot.coarsePointer && snapshot.noHover) || ipadDesktopMode;
}

export function isIosDevice(snapshot: PwaDeviceSnapshot) {
  return /iPad|iPhone|iPod/.test(snapshot.userAgent)
    || (snapshot.platform === "MacIntel" && snapshot.maxTouchPoints > 1);
}

export function isEmbeddedBrowser(userAgent: string) {
  return embeddedBrowserPattern.test(userAgent);
}

export function resolvePwaInstallGateState({
  enabled,
  eligibleDevice,
  installed,
  routeException,
  promptAvailable,
  ios,
  embeddedBrowser,
  installCompletedInBrowser,
}: {
  enabled: boolean;
  eligibleDevice: boolean;
  installed: boolean;
  routeException: boolean;
  promptAvailable: boolean;
  ios: boolean;
  embeddedBrowser: boolean;
  installCompletedInBrowser: boolean;
}): PwaInstallGateState {
  if (!enabled || !eligibleDevice || routeException) return "bypass";
  if (installed) return "installed";
  if (installCompletedInBrowser) return "installedInBrowser";
  if (embeddedBrowser) return "unsupportedBrowser";
  if (promptAvailable) return "promptAvailable";
  return ios ? "iosInstructions" : "manualInstructions";
}

export function sanitizePwaDestination(candidate: string) {
  const sanitized = sanitizeIntendedRoute(candidate);
  return sanitized.startsWith("/auth") ? "/" : sanitized;
}

export function storePwaDestination(storage: Pick<Storage, "setItem">, candidate: string, now = Date.now()) {
  storage.setItem(PWA_DESTINATION_STORAGE_KEY, JSON.stringify({
    path: sanitizePwaDestination(candidate),
    savedAt: now,
  } satisfies StoredDestination));
}

export function consumePwaDestination(
  storage: Pick<Storage, "getItem" | "removeItem">,
  now = Date.now(),
) {
  const serialized = storage.getItem(PWA_DESTINATION_STORAGE_KEY);
  storage.removeItem(PWA_DESTINATION_STORAGE_KEY);
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized) as Partial<StoredDestination>;
    if (typeof parsed.path !== "string" || typeof parsed.savedAt !== "number") return null;
    if (now - parsed.savedAt > PWA_DESTINATION_TTL_MS || parsed.savedAt > now) return null;
    return sanitizePwaDestination(parsed.path);
  } catch {
    return null;
  }
}
