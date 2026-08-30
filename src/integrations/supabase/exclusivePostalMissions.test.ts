import { describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("./client", () => ({ getSupabaseClient: () => ({ rpc }) }));

import { fetchExclusivePostalMissions } from "./exclusivePostalMissions";

describe("exclusive postal missions adapter", () => {
  it("maps the sanitized mission payload", async () => {
    rpc.mockResolvedValueOnce({ data: [{ id: "mission-1", mascot_id: "mascot-1", mascot_name: "Nuvem", status: "offered", expires_at: "2026-09-01T03:10:00Z", destination_name: "Santos", destination_country_code: "BR", distance_km: 72, cargo_slots: 2, seed_reward: 20, mascot_xp: 30, copy: { "pt-BR": { title: "Rota", story: "Uma história." }, "en-US": { title: "Route", story: "A story." } } }], error: null });
    await expect(fetchExclusivePostalMissions()).resolves.toMatchObject([{ mascotId: "mascot-1", distanceKm: 72 }]);
    expect(rpc).toHaveBeenCalledWith("list_exclusive_postal_missions");
  });
});
