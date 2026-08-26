import { describe, expect, it } from "vitest";

import type { PostalJobOffer } from "../../integrations/supabase/postalJobs";
import { initialPostalJobOfferStates, markPostalJobOfferFailed, markPostalJobOfferLoading, markPostalJobOfferReady } from "./postalJobOfferState";

const offer: PostalJobOffer = {
  offer: { id: "offer-1", status: "offered" },
  template: { title_key: "postalJobs.templates.farol.title", description_key: "postalJobs.templates.farol.description", cargo_slots: 1, seed_reward: 20, mascot_xp: 30, min_distance_km: 5, max_distance_km: 15 },
  replacementsRemaining: 3,
};

describe("postal job offer loading state", () => {
  it("keeps a successful mascot visible when another mascot fails", () => {
    const initial = initialPostalJobOfferStates(["pipoca", "nuvem"]);
    const withOffer = markPostalJobOfferReady(initial, "pipoca", offer);
    const withFailure = markPostalJobOfferFailed(withOffer, "nuvem");

    expect(withFailure.pipoca).toEqual({ status: "ready", offer });
    expect(withFailure.nuvem).toEqual({ status: "error" });
  });

  it("supports retrying only the failed mascot", () => {
    const failed = markPostalJobOfferFailed(initialPostalJobOfferStates(["pipoca", "nuvem"]), "nuvem");
    const retrying = markPostalJobOfferLoading(failed, "nuvem");
    const recovered = markPostalJobOfferReady(retrying, "nuvem", offer);

    expect(retrying.pipoca).toEqual({ status: "loading" });
    expect(recovered.nuvem).toEqual({ status: "ready", offer });
  });
});
