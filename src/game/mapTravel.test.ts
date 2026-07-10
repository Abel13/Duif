import { describe, expect, it } from "vitest";

import { nuvemDelivery } from "./mockData";
import {
  createDeliveryRouteGeoJson,
  createRouteRewardsGeoJson,
  getPetMapPosition,
  getRouteRewardDiscoveries,
  interpolateCoordinates,
} from "./mapTravel";

describe("map travel helpers", () => {
  it("interpolates coordinates between origin and destination", () => {
    expect(
      interpolateCoordinates(
        { latitude: 0, longitude: 0 },
        { latitude: 10, longitude: 20 },
        0.5,
      ),
    ).toEqual({
      latitude: 5,
      longitude: 10,
    });
  });

  it("clamps interpolation progress", () => {
    expect(
      interpolateCoordinates(
        { latitude: 0, longitude: 0 },
        { latitude: 10, longitude: 20 },
        2,
      ),
    ).toEqual({
      latitude: 10,
      longitude: 20,
    });
  });

  it("calculates pet position during outbound travel", () => {
    const position = getPetMapPosition(
      nuvemDelivery,
      new Date("2026-07-08T15:00:00.000Z"),
    );

    expect(position.leg).toBe("outbound");
    expect(position.legProgress).toBe(0.5);
    expect(position.outboundProgress).toBe(0.5);
    expect(position.coordinates.latitude).toBeCloseTo(7.59, 2);
    expect(position.coordinates.longitude).toBeCloseTo(-27.89, 2);
  });

  it("calculates pet position during return travel", () => {
    const position = getPetMapPosition(
      nuvemDelivery,
      new Date("2026-07-08T21:30:00.000Z"),
    );

    expect(position.leg).toBe("returning");
    expect(position.legProgress).toBe(0.5);
    expect(position.outboundProgress).toBe(1);
    expect(position.coordinates.latitude).toBeCloseTo(7.59, 2);
    expect(position.coordinates.longitude).toBeCloseTo(-27.89, 2);
  });

  it("marks rewards as undiscovered before their route progress", () => {
    const rewards = getRouteRewardDiscoveries(
      nuvemDelivery,
      new Date("2026-07-08T12:20:00.000Z"),
    );

    expect(rewards.filter((reward) => reward.discovered)).toHaveLength(0);
  });

  it("marks rewards as discovered after the pet passes their route progress", () => {
    const rewards = getRouteRewardDiscoveries(
      nuvemDelivery,
      new Date("2026-07-08T18:00:00.000Z"),
    );

    expect(rewards.every((reward) => reward.discovered)).toBe(true);
  });

  it("creates route and reward GeoJSON collections", () => {
    const rewards = getRouteRewardDiscoveries(nuvemDelivery, new Date("2026-07-08T18:00:00.000Z"));
    const routeGeoJson = createDeliveryRouteGeoJson(nuvemDelivery);
    const rewardGeoJson = createRouteRewardsGeoJson(rewards);

    expect(routeGeoJson.features[0]?.geometry.coordinates).toEqual([
      [-46.6333, -23.5505],
      [-9.1393, 38.7223],
    ]);
    expect(rewardGeoJson.features).toHaveLength(3);
    expect(rewardGeoJson.features[0]?.properties.discovered).toBe(true);
  });
});
