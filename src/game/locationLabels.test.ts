import { describe, expect, it } from "vitest";

import { formatPostalLocationLabel, resolveDeliveryPlaceLabel } from "./locationLabels";
import type { Delivery } from "./types";

const delivery: Delivery = {
  id: "delivery-1", senderId: "sender", receiverId: "receiver", mascotId: "mascot",
  origin: { latitude: 0, longitude: 0, labelKey: "locations.londrina" },
  destination: { latitude: 1, longitude: 1, labelKey: "locations.maringa" },
  distanceKm: 10, animalSpeedKmh: 20, outboundStartAt: "2026-01-01T00:00:00.000Z",
  outboundArrivalAt: "2026-01-01T01:00:00.000Z", status: "outbound", rewardSeed: "seed",
};

describe("postal location labels", () => {
  it("formats city, state and country without broken separators", () => {
    expect(formatPostalLocationLabel({ city: "Londrina", state: "PR", country: "BR" })).toBe("Londrina, PR • BR");
    expect(formatPostalLocationLabel({ city: "Londrina", country: "BR" })).toBe("Londrina • BR");
    expect(formatPostalLocationLabel({ country: "BR" })).toBe("BR");
    expect(formatPostalLocationLabel({})).toBe("");
  });

  it("uses the immutable delivery snapshot before the legacy translation key", () => {
    const translated = (key: string) => `translated:${key}`;
    expect(resolveDeliveryPlaceLabel({ ...delivery, originPlaceLabel: "Londrina, PR • BR" }, "origin", translated)).toBe("Londrina, PR • BR");
    expect(resolveDeliveryPlaceLabel(delivery, "destination", translated)).toBe("translated:locations.maringa");
  });
});
