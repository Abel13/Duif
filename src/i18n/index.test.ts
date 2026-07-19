import { describe, expect, it } from "vitest";

import { resolveInitialLocale } from "./index";

describe("resolveInitialLocale", () => {
  it("uses the saved supported locale", () => {
    expect(resolveInitialLocale({ getItem: () => "en-US" })).toBe("en-US");
  });

  it("falls back to Brazilian Portuguese for missing or invalid values", () => {
    expect(resolveInitialLocale()).toBe("pt-BR");
    expect(resolveInitialLocale({ getItem: () => "fr-FR" })).toBe("pt-BR");
  });
});
