import { describe, expect, it } from "vitest";

import { maskEmail, meetsPasswordPolicy, resolveAuthJourneyState, sanitizeIntendedRoute } from "./authContracts";

describe("auth contracts", () => {
  it("requires eight characters with letters and numbers", () => {
    expect(meetsPasswordPolicy("postal12")).toBe(true);
    expect(meetsPasswordPolicy("postalxx")).toBe(false);
    expect(meetsPasswordPolicy("12345678")).toBe(false);
    expect(meetsPasswordPolicy("mail1")).toBe(false);
  });

  it("resolves the guarded account journey without flashing private content", () => {
    expect(resolveAuthJourneyState({ isConfigured: true, isLoading: true, isServiceAvailable: true, hasPendingVerification: false, hasProfile: false, hasSession: false })).toBe("loading");
    expect(resolveAuthJourneyState({ isConfigured: true, isLoading: false, isServiceAvailable: true, hasPendingVerification: true, hasProfile: false, hasSession: false })).toBe("verificationPending");
    expect(resolveAuthJourneyState({ isConfigured: true, isLoading: false, isServiceAvailable: true, hasPendingVerification: false, hasProfile: false, hasSession: true })).toBe("onboardingRequired");
  });

  it("accepts only internal non-auth intended routes", () => {
    expect(sanitizeIntendedRoute("/map?deliveryId=one#pet")).toBe("/map?deliveryId=one#pet");
    expect(sanitizeIntendedRoute("https://evil.test/map")).toBe("/");
    expect(sanitizeIntendedRoute("//evil.test/map")).toBe("/");
    expect(sanitizeIntendedRoute("/auth/callback")).toBe("/");
  });

  it("masks the local portion of an email", () => {
    expect(maskEmail("abel@example.com")).toBe("ab••@example.com");
  });
});
