import { describe, expect, it } from "vitest";

import {
  consumePwaDestination,
  isEmbeddedBrowser,
  isIosDevice,
  isMobileOrTablet,
  isPwaGateEnabled,
  isPwaRouteException,
  PWA_DESTINATION_STORAGE_KEY,
  PWA_DESTINATION_TTL_MS,
  resolvePwaInstallGateState,
  storePwaDestination,
  type PwaDeviceSnapshot,
} from "./pwaInstall";

const phone: PwaDeviceSnapshot = {
  coarsePointer: true,
  noHover: true,
  maxTouchPoints: 5,
  platform: "iPhone",
  userAgent: "Mozilla/5.0 (iPhone)",
};

const desktop: PwaDeviceSnapshot = {
  coarsePointer: false,
  noHover: false,
  maxTouchPoints: 0,
  platform: "MacIntel",
  userAgent: "Mozilla/5.0 (Macintosh)",
};

function resolve(overrides: Partial<Parameters<typeof resolvePwaInstallGateState>[0]> = {}) {
  return resolvePwaInstallGateState({
    enabled: true,
    eligibleDevice: true,
    installed: false,
    routeException: false,
    promptAvailable: false,
    ios: false,
    embeddedBrowser: false,
    installCompletedInBrowser: false,
    ...overrides,
  });
}

function memoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: (key: string) => key === PWA_DESTINATION_STORAGE_KEY ? value : null,
    setItem: (key: string, next: string) => { if (key === PWA_DESTINATION_STORAGE_KEY) value = next; },
    removeItem: (key: string) => { if (key === PWA_DESTINATION_STORAGE_KEY) value = null; },
    value: () => value,
  };
}

describe("PWA installation gate contracts", () => {
  it("enables the gate only for an explicit true value", () => {
    expect(isPwaGateEnabled("true")).toBe(true);
    expect(isPwaGateEnabled(" TRUE ")).toBe(true);
    expect(isPwaGateEnabled("false")).toBe(false);
    expect(isPwaGateEnabled(undefined)).toBe(false);
  });

  it("distinguishes phones, tablets, iPad desktop mode, desktop and hybrid notebooks", () => {
    expect(isMobileOrTablet(phone)).toBe(true);
    expect(isMobileOrTablet({ ...phone, platform: "Linux armv8l" })).toBe(true);
    expect(isMobileOrTablet({ ...desktop, maxTouchPoints: 5 })).toBe(true);
    expect(isIosDevice({ ...desktop, maxTouchPoints: 5 })).toBe(true);
    expect(isMobileOrTablet(desktop)).toBe(false);
    expect(isMobileOrTablet({ ...desktop, maxTouchPoints: 10 })).toBe(true);
    expect(isMobileOrTablet({ ...desktop, platform: "Win32", maxTouchPoints: 10 })).toBe(false);
  });

  it("bypasses desktop, disabled environments, installed mode and callback routes", () => {
    expect(resolve({ enabled: false })).toBe("bypass");
    expect(resolve({ eligibleDevice: false })).toBe("bypass");
    expect(resolve({ routeException: true })).toBe("bypass");
    expect(resolve({ installed: true })).toBe("installed");
    expect(isPwaRouteException("/auth/callback")).toBe(true);
    expect(isPwaRouteException("/auth/reset-password")).toBe(true);
    expect(isPwaRouteException("/auth")).toBe(false);
  });

  it("resolves direct, iOS, manual, embedded and post-install states", () => {
    expect(resolve({ promptAvailable: true })).toBe("promptAvailable");
    expect(resolve({ ios: true })).toBe("iosInstructions");
    expect(resolve()).toBe("manualInstructions");
    expect(resolve({ embeddedBrowser: true, promptAvailable: true })).toBe("unsupportedBrowser");
    expect(resolve({ installCompletedInBrowser: true })).toBe("installedInBrowser");
    expect(isEmbeddedBrowser("Instagram 300.0 (iPhone)")).toBe(true);
    expect(isEmbeddedBrowser("Mozilla/5.0 (Linux; Android 14; wv) Chrome/123")).toBe(true);
    expect(isEmbeddedBrowser("GSA/320.0 iPhone")).toBe(true);
    expect(isEmbeddedBrowser("Mobile Safari")).toBe(false);
  });

  it("stores a sanitized destination and consumes it only once", () => {
    const storage = memoryStorage();
    storePwaDestination(storage, "/map?deliveryId=abc#pet", 1_000);
    expect(consumePwaDestination(storage, 2_000)).toBe("/map?deliveryId=abc#pet");
    expect(consumePwaDestination(storage, 2_000)).toBeNull();

    storePwaDestination(storage, "https://evil.example/steal", 2_000);
    expect(consumePwaDestination(storage, 2_001)).toBe("/");
    storePwaDestination(storage, "/auth?mode=signup", 2_000);
    expect(consumePwaDestination(storage, 2_001)).toBe("/");
  });

  it("rejects expired, future and malformed destinations", () => {
    const expired = memoryStorage(JSON.stringify({ path: "/map", savedAt: 1_000 }));
    expect(consumePwaDestination(expired, 1_000 + PWA_DESTINATION_TTL_MS + 1)).toBeNull();
    const future = memoryStorage(JSON.stringify({ path: "/map", savedAt: 2_000 }));
    expect(consumePwaDestination(future, 1_000)).toBeNull();
    const malformed = memoryStorage("not-json");
    expect(consumePwaDestination(malformed, 1_000)).toBeNull();
  });
});
