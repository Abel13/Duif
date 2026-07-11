import { describe, expect, it } from "vitest";

import { nuvemDelivery } from "./mockData";
import {
  createRouteRewardDiscoveries,
  createDeliveryRouteGeoJson,
  createMapPlaceLabelsGeoJson,
  createRouteRewardsGeoJson,
  getDistanceFromPointToRouteKm,
  getEligibleRouteRewards,
  getPetMapPosition,
  getRouteRewardDiscoveries,
  getRouteRewardProgress,
  interpolateCoordinates,
  type RouteRewardPoint,
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

  it("calculates distance from a point to the route", () => {
    expect(
      getDistanceFromPointToRouteKm(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 10 },
        { latitude: 0, longitude: 5 },
      ),
    ).toBeCloseTo(0, 4);

    expect(
      getDistanceFromPointToRouteKm(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 10 },
        { latitude: 1, longitude: 5 },
      ),
    ).toBeCloseTo(111.19, 1);
  });

  it("keeps rewards inside the eligibility radius", () => {
    const rewardPoint = createTestRewardPoint({
      coordinates: { latitude: 0.25, longitude: 5 },
      eligibilityRadiusKm: 40,
    });
    const delivery = {
      ...nuvemDelivery,
      origin: { ...nuvemDelivery.origin, latitude: 0, longitude: 0 },
      destination: { ...nuvemDelivery.destination, latitude: 0, longitude: 10 },
    };

    const rewards = getEligibleRouteRewards(delivery, [rewardPoint]);

    expect(rewards).toHaveLength(1);
    expect(rewards[0]?.routeProgress).toBeCloseTo(0.5, 2);
  });

  it("ignores rewards outside the eligibility radius", () => {
    const rewardPoint = createTestRewardPoint({
      coordinates: { latitude: 2, longitude: 5 },
      eligibilityRadiusKm: 40,
    });
    const delivery = {
      ...nuvemDelivery,
      origin: { ...nuvemDelivery.origin, latitude: 0, longitude: 0 },
      destination: { ...nuvemDelivery.destination, latitude: 0, longitude: 10 },
    };

    expect(getEligibleRouteRewards(delivery, [rewardPoint])).toHaveLength(0);
  });

  it("calculates reward progress on the route", () => {
    const rewardPoint = createTestRewardPoint({
      coordinates: { latitude: 0, longitude: 7.5 },
    });

    expect(
      getRouteRewardProgress(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 10 },
        rewardPoint,
      ),
    ).toBeCloseTo(0.75, 2);
  });

  it("marks rewards as undiscovered before their route progress", () => {
    const rewardPoint = createTestRewardPoint({
      coordinates: { latitude: 0, longitude: 5 },
    });
    const delivery = {
      ...nuvemDelivery,
      origin: { ...nuvemDelivery.origin, latitude: 0, longitude: 0 },
      destination: { ...nuvemDelivery.destination, latitude: 0, longitude: 10 },
    };
    const rewards = createRouteRewardDiscoveries(
      delivery,
      new Date("2026-07-08T13:00:00.000Z"),
      [rewardPoint],
    );

    expect(rewards.filter((reward) => reward.discovered)).toHaveLength(0);
  });

  it("marks rewards as discovered after the pet passes their route progress", () => {
    const rewardPoint = createTestRewardPoint({
      coordinates: { latitude: 0, longitude: 5 },
    });
    const delivery = {
      ...nuvemDelivery,
      origin: { ...nuvemDelivery.origin, latitude: 0, longitude: 0 },
      destination: { ...nuvemDelivery.destination, latitude: 0, longitude: 10 },
    };
    const rewards = createRouteRewardDiscoveries(
      delivery,
      new Date("2026-07-08T16:00:00.000Z"),
      [rewardPoint],
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
    expect(rewardGeoJson.features.length).toBeGreaterThan(3);
    expect(rewardGeoJson.features[0]?.properties.discovered).toBe(true);
  });

  it("creates place label GeoJSON collections", () => {
    const labelGeoJson = createMapPlaceLabelsGeoJson([
      {
        coordinates: nuvemDelivery.origin,
        id: "origin",
        kind: "origin",
        label: "São Paulo",
      },
      {
        coordinates: nuvemDelivery.destination,
        id: "destination",
        kind: "destination",
        label: "Lisboa",
      },
    ]);

    expect(labelGeoJson.features).toHaveLength(2);
    expect(labelGeoJson.features[0]?.properties.label).toBe("São Paulo");
    expect(labelGeoJson.features[1]?.geometry.coordinates).toEqual([-9.1393, 38.7223]);
  });
});

function createTestRewardPoint(
  overrides: Partial<RouteRewardPoint> = {},
): RouteRewardPoint {
  return {
    coordinates: { latitude: 0, longitude: 5 },
    descriptionKey: "map.rewards.rioPostcard.description",
    eligibilityRadiusKm: 80,
    id: "route-reward-test",
    kind: "badge",
    rarity: "common",
    regionKind: "city",
    regionLabel: "Test City",
    titleKey: "map.rewards.rioPostcard.name",
    ...overrides,
  };
}
