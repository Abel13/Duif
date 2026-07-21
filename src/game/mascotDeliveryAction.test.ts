import { describe, expect, it } from "vitest";

import { resolveMascotDeliveryAction, resolveRequestedTravelMascotId } from "./mascotDeliveryAction";
import type { Delivery, Mascot } from "./types";

const delivery: Delivery = {
  id: "delivery-1",
  senderId: "player-1",
  receiverId: "player-2",
  mascotId: "mascot-1",
  origin: { latitude: 0, longitude: 0, labelKey: "tutorial.locations.nest" },
  destination: { latitude: 1, longitude: 1, labelKey: "mascot.destination" },
  distanceKm: 10,
  animalSpeedKmh: 10,
  outboundStartAt: "2026-07-21T10:00:00.000Z",
  outboundArrivalAt: "2026-07-21T11:00:00.000Z",
  returnStartAt: "2026-07-21T11:30:00.000Z",
  returnArrivalAt: "2026-07-21T12:30:00.000Z",
  rewardSeed: "delivery-1",
  status: "preparing",
};

function mascot(id: string, currentDelivery?: Delivery): Mascot {
  return {
    id,
    name: id,
    speciesKey: "species.carrierPigeon",
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    attributes: { speed: 1, stamina: 1, orientation: 1, luck: 1 },
    trait: { id: "trait", nameKey: "traits.steadyRoute.name", descriptionKey: "traits.steadyRoute.description", effect: "rareFind" },
    equipment: [],
    skills: [],
    appearance: { primaryColor: "#000", accentColor: "#fff", portraitPlaceholderKey: "appearance.nuvemPortrait" },
    currentDelivery,
  };
}

describe("resolveMascotDeliveryAction", () => {
  it("sends when the mascot is available or its delivery is completed", () => {
    expect(resolveMascotDeliveryAction(undefined)).toBe("send");
    expect(resolveMascotDeliveryAction({ ...delivery, status: "completed" })).toBe("send");
  });

  it("views an active trip and collects a returned delivery", () => {
    expect(resolveMascotDeliveryAction(delivery, new Date("2026-07-21T10:30:00.000Z"))).toBe("viewTrip");
    expect(resolveMascotDeliveryAction(delivery, new Date("2026-07-21T12:30:00.000Z"))).toBe("collect");
  });
});

describe("resolveRequestedTravelMascotId", () => {
  const activeMascot = mascot("mascot-active", { ...delivery, mascotId: "mascot-active" });
  const idleMascot = mascot("mascot-idle");

  it("accepts only an owned mascot with an active delivery", () => {
    const mascots = [activeMascot, idleMascot];
    const now = new Date("2026-07-21T10:30:00.000Z");

    expect(resolveRequestedTravelMascotId(mascots, "mascot-active", now)).toBe("mascot-active");
    expect(resolveRequestedTravelMascotId(mascots, "mascot-idle", now)).toBeUndefined();
    expect(resolveRequestedTravelMascotId(mascots, "unknown", now)).toBeUndefined();
  });
});
