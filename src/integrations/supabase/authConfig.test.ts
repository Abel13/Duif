import { describe, expect, it } from "vitest";

import supabaseConfig from "../../../supabase/config.toml?raw";

describe("local Supabase auth policy", () => {
  it("requires confirmed email and a strong password", () => {
    expect(supabaseConfig).toContain('minimum_password_length = 8');
    expect(supabaseConfig).toContain('password_requirements = "letters_digits"');
    expect(supabaseConfig).toContain('enable_confirmations = true');
  });

  it("allows local callback routes", () => {
    expect(supabaseConfig).toContain('http://127.0.0.1:5173/**');
    expect(supabaseConfig).toContain('http://localhost:5173/**');
  });
});
