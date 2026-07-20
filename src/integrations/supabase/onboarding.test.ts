import { describe, expect, it } from "vitest";

import {
  isValidPlayerDisplayName,
  normalizePlayerDisplayName,
  onboardingIntroIndex,
} from "./onboarding";

describe("account onboarding contracts", () => {
  it("normalizes Unicode and surrounding or repeated whitespace", () => {
    expect(normalizePlayerDisplayName("  Jose\u0301   da  Silva  ")).toBe("José da Silva");
  });

  it("accepts non-unique Unicode names from 2 through 24 code points", () => {
    expect(isValidPlayerDisplayName("Li")).toBe(true);
    expect(isValidPlayerDisplayName("Á".repeat(24))).toBe(true);
    expect(isValidPlayerDisplayName("A")).toBe(false);
    expect(isValidPlayerDisplayName("A".repeat(25))).toBe(false);
    expect(isValidPlayerDisplayName("Ana\u0007")).toBe(false);
  });

  it("maps persisted stages to the first incomplete visible step", () => {
    expect(onboardingIntroIndex("welcome")).toBe(0);
    expect(onboardingIntroIndex("returnCollection")).toBe(3);
    expect(onboardingIntroIndex("displayName")).toBe(4);
    expect(onboardingIntroIndex("mascotChoice")).toBe(5);
    expect(onboardingIntroIndex("completed")).toBe(5);
  });
});
