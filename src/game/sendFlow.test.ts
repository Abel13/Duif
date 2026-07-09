import { describe, expect, it } from "vitest";

import { createMockDeliveryFromSelection, estimateMascotSpeedKmh } from "./sendFlow";
import { starterMascots } from "./mockData";

describe("estimateMascotSpeedKmh", () => {
  it("derives a stable travel speed from mascot attributes", () => {
    const nuvem = starterMascots.find((mascot) => mascot.id === "mascot-nuvem");

    expect(nuvem).toBeDefined();
    expect(estimateMascotSpeedKmh(nuvem!)).toBe(72);
  });
});

describe("createMockDeliveryFromSelection", () => {
  it("creates a delivery from a complete send flow selection", () => {
    const result = createMockDeliveryFromSelection(
      {
        friendId: "friend-curitiba",
        mascotId: "mascot-pipoca",
        correspondenceId: "correspondence-postcard",
      },
      new Date("2026-07-08T12:00:00.000Z"),
    );

    expect(result).toBeDefined();
    expect(result?.delivery.status).toBe("outbound");
    expect(result?.delivery.senderId).toBe("player-current");
    expect(result?.delivery.receiverId).toBe("friend-curitiba");
    expect(result?.delivery.mascotId).toBe("mascot-pipoca");
    expect(result?.delivery.distanceKm).toBeGreaterThan(300);
    expect(result?.delivery.outboundStartAt).toBe("2026-07-08T12:00:00.000Z");
    expect(result?.delivery.rewardSeed).toBe(
      "mascot-pipoca-friend-curitiba-correspondence-postcard",
    );
  });

  it("returns undefined when the selection is incomplete", () => {
    expect(
      createMockDeliveryFromSelection({
        friendId: "friend-curitiba",
        mascotId: "mascot-pipoca",
      }),
    ).toBeUndefined();
  });
});
