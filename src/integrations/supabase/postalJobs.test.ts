import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSupabaseClient } from "./client";
import { acceptPostalJobOffer, dispatchPostalJob, fetchPostalJobOffer, replacePostalJobOffer } from "./postalJobs";

vi.mock("./client", () => ({ getSupabaseClient: vi.fn() }));

const getSupabaseClientMock = vi.mocked(getSupabaseClient);
const offer = {
  offer: { id: "offer-1", status: "offered" },
  template: { title_key: "postalJobs.templates.farol.title", description_key: "postalJobs.templates.farol.description", cargo_slots: 1, seed_reward: 20, mascot_xp: 30, min_distance_km: 5, max_distance_km: 15 },
  replacementsRemaining: 3,
};

function configuredClient(responses: Record<string, { data: unknown; error: unknown }>) {
  const client = {
    marker: "bound-client",
    rpc: vi.fn(function (this: { marker: string }, name: string) {
      if (this.marker !== "bound-client") throw new Error("RPC context was lost");
      return Promise.resolve(responses[name] ?? { data: null, error: null });
    }),
  };
  getSupabaseClientMock.mockReturnValue(client as never);
  return client;
}

describe("postal jobs Supabase adapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getSupabaseClientMock.mockReset();
  });

  it("preserves the client context for all job RPCs", async () => {
    const client = configuredClient({
      postal_job_offer_payload: { data: offer, error: null },
      replace_postal_job_offer: { data: offer, error: null },
      accept_postal_job_offer: { data: { id: "offer-1", status: "accepted" }, error: null },
      dispatch_postal_job: { data: { id: "delivery-1" }, error: null },
    });

    await expect(fetchPostalJobOffer("mascot-1")).resolves.toEqual(offer);
    await expect(replacePostalJobOffer("mascot-1")).resolves.toEqual(offer);
    await expect(acceptPostalJobOffer("offer-1")).resolves.toMatchObject({ status: "accepted" });
    await expect(dispatchPostalJob("offer-1")).resolves.toEqual({ id: "delivery-1" });

    expect(client.rpc).toHaveBeenNthCalledWith(1, "postal_job_offer_payload", { target_mascot_id: "mascot-1" });
    expect(client.rpc).toHaveBeenNthCalledWith(2, "replace_postal_job_offer", { target_mascot_id: "mascot-1" });
    expect(client.rpc).toHaveBeenNthCalledWith(3, "accept_postal_job_offer", { target_offer_id: "offer-1" });
    expect(client.rpc).toHaveBeenNthCalledWith(4, "dispatch_postal_job", { target_offer_id: "offer-1" });
  });

  it("rejects invalid offer payloads", async () => {
    configuredClient({ postal_job_offer_payload: { data: {}, error: null } });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(fetchPostalJobOffer("mascot-1")).rejects.toThrow("Invalid postal job offer");
  });

  it("reports only safe error metadata and preserves the Supabase error", async () => {
    const failure = { code: "22023", status: 400, message: "private detail" };
    configuredClient({ postal_job_offer_payload: { data: null, error: failure } });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(fetchPostalJobOffer("mascot-1")).rejects.toBe(failure);
    expect(consoleError).toHaveBeenCalledWith("[postal-jobs] fetchOffer failed", { code: "22023", status: 400 });
  });

  it("fails before the request when Supabase is not configured", async () => {
    getSupabaseClientMock.mockReturnValue(null);
    await expect(fetchPostalJobOffer("mascot-1")).rejects.toThrow("Supabase is not configured");
  });
});
