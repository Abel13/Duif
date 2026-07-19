import { describe, expect, it } from "vitest";

import { supabaseAuthOptions } from "./client";

describe("Supabase client authentication", () => {
  it("uses only the manually exchanged PKCE callback flow", () => {
    expect(supabaseAuthOptions).toEqual({
      detectSessionInUrl: false,
      flowType: "pkce",
    });
  });
});
