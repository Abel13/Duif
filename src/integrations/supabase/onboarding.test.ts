import { describe, expect, it } from "vitest";

import {
  isValidMascotName,
  isValidPlayerDisplayName,
  limitPlayerNameInput,
  normalizeMascotName,
  normalizePlayerDisplayName,
  onboardingIntroIndex,
} from "./onboarding";

describe("account onboarding contracts", () => {
  it("normalizes and validates literal mascot names", () => {
    expect(normalizeMascotName("  Ce\u0301u   Azul ")).toBe("Céu Azul");
    expect(isValidMascotName("Céu Azul")).toBe(true);
    expect(isValidMascotName("A")).toBe(false);
    expect(isValidMascotName("Ave\u0000Postal")).toBe(false);
  });

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

  it("limits typed names to 24 Unicode code points", () => {
    expect(limitPlayerNameInput(`${"Á".repeat(23)}🐦postal`)).toBe(`${"Á".repeat(23)}🐦`);
  });

  it("maps persisted stages to the first incomplete visible step", () => {
    expect(onboardingIntroIndex("welcome")).toBe(0);
    expect(onboardingIntroIndex("returnCollection")).toBe(3);
    expect(onboardingIntroIndex("displayName")).toBe(4);
    expect(onboardingIntroIndex("mascotChoice")).toBe(5);
    expect(onboardingIntroIndex("completed")).toBe(5);
  });
});
