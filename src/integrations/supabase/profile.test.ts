import { describe, expect, it } from "vitest";

import type { AuthProfile } from "./profile";
import { getProfileDisplayLabel } from "./profile";

const profile: AuthProfile = {
  auth_user_id: "00000000-0000-4000-8000-000000000999",
  created_at: "2026-07-10T11:00:00.000Z",
  display_name: "Abel",
  home_label_key: "locations.saoPaulo",
  home_latitude: -23.5505,
  home_longitude: -46.6333,
  id: "00000000-0000-4000-8000-000000000001",
  mock_key: "player-current",
  postal_base_city: "Sao Paulo",
  postal_base_country: "Brasil",
  postal_base_neighborhood: "Centro Postal",
  postal_base_state: "SP",
  postal_base_street: "Rua das Cartas",
  updated_at: "2026-07-10T11:00:00.000Z",
};

describe("profile helpers", () => {
  it("returns the profile display label", () => {
    expect(getProfileDisplayLabel(profile)).toBe("Abel");
  });

  it("returns an empty label without a profile", () => {
    expect(getProfileDisplayLabel(null)).toBe("");
  });
});
