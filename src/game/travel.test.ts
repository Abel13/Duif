import { describe, expect, it } from "vitest";

import type { Delivery } from "./types";
import {
  clampProgress,
  DEFAULT_GAME_SPEED_MULTIPLIER,
  estimateTravelDurationHours,
  formatRemainingTime,
  getDeliveryStatus,
  getTravelProgress,
  haversineDistanceKm,
} from "./travel";

const saoPaulo = {
  latitude: -23.5505,
  longitude: -46.6333,
  labelKey: "locations.saoPaulo",
} as const;

const lisbon = {
  latitude: 38.7223,
  longitude: -9.1393,
  labelKey: "locations.lisbon",
} as const;

const baseDelivery: Delivery = {
  id: "delivery-test",
  senderId: "sender-test",
  receiverId: "receiver-test",
  mascotId: "mascot-test",
  origin: saoPaulo,
  destination: lisbon,
  distanceKm: 7946,
  animalSpeedKmh: 62,
  outboundStartAt: "2026-07-08T12:00:00.000Z",
  outboundArrivalAt: "2026-07-08T18:00:00.000Z",
  returnStartAt: "2026-07-08T18:30:00.000Z",
  returnArrivalAt: "2026-07-09T00:30:00.000Z",
  status: "outbound",
  rewardSeed: "test-seed",
};

describe("haversineDistanceKm", () => {
  it("calculates the distance between Sao Paulo and Lisbon", () => {
    expect(haversineDistanceKm(saoPaulo, lisbon)).toBeCloseTo(7949.03, 1);
  });

  it("returns zero for equal coordinates", () => {
    expect(haversineDistanceKm(saoPaulo, saoPaulo)).toBe(0);
  });
});

describe("estimateTravelDurationHours", () => {
  it("calculates duration with the default game speed multiplier", () => {
    expect(DEFAULT_GAME_SPEED_MULTIPLIER).toBe(1);
    expect(estimateTravelDurationHours(120, 60)).toBe(2);
  });

  it("applies a custom game speed multiplier", () => {
    expect(estimateTravelDurationHours(120, 60, 2)).toBe(1);
  });

  it("returns zero for invalid values", () => {
    expect(estimateTravelDurationHours(120, 0)).toBe(0);
    expect(estimateTravelDurationHours(-120, 60)).toBe(0);
    expect(estimateTravelDurationHours(120, 60, Number.NaN)).toBe(0);
  });
});

describe("clampProgress", () => {
  it("keeps progress between zero and one", () => {
    expect(clampProgress(-0.25)).toBe(0);
    expect(clampProgress(0.5)).toBe(0.5);
    expect(clampProgress(1.25)).toBe(1);
    expect(clampProgress(Number.NaN)).toBe(0);
  });
});

describe("getTravelProgress", () => {
  it("returns zero before the trip starts", () => {
    expect(getTravelProgress(baseDelivery, new Date("2026-07-08T11:00:00.000Z"))).toBe(0);
  });

  it("calculates progress across outbound and return timestamps", () => {
    expect(getTravelProgress(baseDelivery, new Date("2026-07-08T18:15:00.000Z"))).toBeCloseTo(0.5);
  });

  it("returns one after the trip ends", () => {
    expect(getTravelProgress(baseDelivery, new Date("2026-07-09T01:00:00.000Z"))).toBe(1);
  });

  it("returns zero for invalid dates", () => {
    expect(
      getTravelProgress(
        {
          ...baseDelivery,
          outboundStartAt: "not-a-date",
        },
        new Date("2026-07-08T18:15:00.000Z"),
      ),
    ).toBe(0);
  });
});

describe("getDeliveryStatus", () => {
  it("calculates preparing before outbound start", () => {
    expect(getDeliveryStatus(baseDelivery, new Date("2026-07-08T11:59:00.000Z"))).toBe("preparing");
  });

  it("calculates outbound before outbound arrival", () => {
    expect(getDeliveryStatus(baseDelivery, new Date("2026-07-08T15:00:00.000Z"))).toBe("outbound");
  });

  it("calculates delivered between outbound arrival and return start", () => {
    expect(getDeliveryStatus(baseDelivery, new Date("2026-07-08T18:15:00.000Z"))).toBe("delivered");
  });

  it("calculates returning before return arrival", () => {
    expect(getDeliveryStatus(baseDelivery, new Date("2026-07-08T20:00:00.000Z"))).toBe("returning");
  });

  it("calculates returned after return arrival", () => {
    expect(getDeliveryStatus(baseDelivery, new Date("2026-07-09T00:31:00.000Z"))).toBe("returned");
  });

  it("preserves completed status", () => {
    expect(
      getDeliveryStatus(
        {
          ...baseDelivery,
          status: "completed",
        },
        new Date("2026-07-08T15:00:00.000Z"),
      ),
    ).toBe("completed");
  });

  it("keeps delivered after outbound arrival when there is no return route", () => {
    const oneWayDelivery = {
      ...baseDelivery,
      returnStartAt: undefined,
      returnArrivalAt: undefined,
    };

    expect(getDeliveryStatus(oneWayDelivery, new Date("2026-07-09T00:31:00.000Z"))).toBe("delivered");
  });
});

describe("formatRemainingTime", () => {
  it("formats minutes", () => {
    expect(formatRemainingTime(baseDelivery, new Date("2026-07-08T17:15:00.000Z"))).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatRemainingTime(baseDelivery, new Date("2026-07-08T15:45:00.000Z"))).toBe("2h 15m");
  });

  it("formats days and hours", () => {
    expect(
      formatRemainingTime(
        {
          ...baseDelivery,
          outboundArrivalAt: "2026-07-09T18:00:00.000Z",
          returnStartAt: undefined,
          returnArrivalAt: undefined,
        },
        new Date("2026-07-08T15:00:00.000Z"),
      ),
    ).toBe("1d 3h");
  });

  it("returns zero when the route has no remaining target", () => {
    expect(formatRemainingTime(baseDelivery, new Date("2026-07-09T00:31:00.000Z"))).toBe("0m");
  });
});
