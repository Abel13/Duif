import { describe, expect, it } from "vitest";

import {
  maskEmail,
  meetsPasswordPolicy,
  parsePkceCallbackUrl,
  resolveAuthJourneyState,
  resolveSignUpResponse,
  sanitizeIntendedRoute,
} from "./authContracts";

describe("auth contracts", () => {
  it("requires eight characters with letters and numbers", () => {
    expect(meetsPasswordPolicy("postal12")).toBe(true);
    expect(meetsPasswordPolicy("postalxx")).toBe(false);
    expect(meetsPasswordPolicy("12345678")).toBe(false);
    expect(meetsPasswordPolicy("mail1")).toBe(false);
  });

  it("resolves the guarded account journey without flashing private content", () => {
    const base = { isConfigured: true, isLoading: false, isServiceAvailable: true, hasPendingVerification: false, hasProfile: false, hasSession: false, onboardingStage: null };
    expect(resolveAuthJourneyState({ ...base, isLoading: true })).toBe("loading");
    expect(resolveAuthJourneyState({ ...base, hasPendingVerification: true })).toBe("verificationPending");
    expect(resolveAuthJourneyState({ ...base, hasSession: true })).toBe("onboardingRequired");
    expect(resolveAuthJourneyState({ ...base, hasSession: true, onboardingStage: "tutorial" })).toBe("tutorialActive");
    expect(resolveAuthJourneyState({ ...base, hasSession: true, onboardingStage: "nestSetup" })).toBe("nestSetupRequired");
    expect(resolveAuthJourneyState({ ...base, hasSession: true, hasProfile: true, onboardingStage: "completed" })).toBe("ready");
    expect(resolveAuthJourneyState({ ...base, hasSession: true, hasProfile: false, onboardingStage: "completed" })).toBe("onboardingRequired");
  });

  it("accepts only internal non-auth intended routes", () => {
    expect(sanitizeIntendedRoute("/map?deliveryId=one#pet")).toBe("/map?deliveryId=one#pet");
    expect(sanitizeIntendedRoute("https://evil.test/map")).toBe("/");
    expect(sanitizeIntendedRoute("//evil.test/map")).toBe("/");
    expect(sanitizeIntendedRoute("/auth/callback")).toBe("/");
  });

  it("accepts a PKCE callback and restores only a safe intended route", () => {
    expect(parsePkceCallbackUrl("https://duif.test/auth/callback?code=postal-code&next=%2Fmap%3FdeliveryId%3Done"))
      .toEqual({ code: "postal-code", next: "/map?deliveryId=one" });
    expect(parsePkceCallbackUrl("https://duif.test/auth/callback?code=postal-code&next=https%3A%2F%2Fevil.test"))
      .toEqual({ code: "postal-code", next: "/" });
  });

  it("rejects missing codes, expired-style callbacks, and legacy token fragments", () => {
    expect(parsePkceCallbackUrl("https://duif.test/auth/callback?next=%2Fmap")).toBeNull();
    expect(parsePkceCallbackUrl("not a url")).toBeNull();
    expect(parsePkceCallbackUrl("https://duif.test/auth/callback?code=postal-code#access_token=secret&refresh_token=secret"))
      .toBeNull();
  });

  it("masks the local portion of an email", () => {
    expect(maskEmail("abel@example.com")).toBe("ab••@example.com");
  });

  it("opens verification only for accepted or privacy-preserving signup responses", () => {
    expect(resolveSignUpResponse({ error: null, hasUser: true })).toEqual({ ok: true });
    expect(resolveSignUpResponse({ error: { code: "user_already_exists" }, hasUser: false })).toEqual({ ok: true });
    expect(resolveSignUpResponse({ error: { code: "email_exists" }, hasUser: false })).toEqual({ ok: true });
    expect(resolveSignUpResponse({ error: { code: "signup_disabled" }, hasUser: false })).toEqual({ ok: false, code: "requestFailed" });
    expect(resolveSignUpResponse({ error: null, hasUser: false })).toEqual({ ok: false, code: "requestFailed" });
  });
});
