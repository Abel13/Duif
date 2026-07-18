import { describe, expect, it } from "vitest";

import { nuvemDelivery } from "./mockData";
import {
  createRouteRewardDiscoveries,
  createDeliveryRouteGeoJson,
  createMapPlaceLabelsGeoJson,
  createRouteRewardsGeoJson,
  createTravelProgressGeoJson,
  getDistanceFromPointToRouteKm,
  getEligibleRouteRewards,
  getCrossedRouteRewardIds,
  getMapFocusCoordinate,
  getMapJourneyPhase,
  getPetMapPosition,
  getRouteRewardDiscoveries,
  getRouteRewardProgress,
  getRouteDiscoveryVisualState,
  interpolateCoordinates,
  type RouteRewardPoint,
} from "./mapTravel";

describe("map travel helpers", () => {
  it.each([
    ["outbound", false, "traveling"],
    ["returned", false, "returned"],
    ["completed", false, "completed"],
    ["returned", true, "completed"],
    ["unknown", false, "traveling"],
    [undefined, false, "traveling"],
  ])("resolves map journey phase for %s", (status, isCollected, expected) => {
    expect(getMapJourneyPhase(status, isCollected)).toBe(expected);
  });

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
      new Date("2026-07-18T15:00:00.000Z"),
    );

    expect(position.leg).toBe("outbound");
    expect(position.legProgress).toBe(0.5);
    expect(position.outboundProgress).toBe(0.5);
    expect(position.coordinates.latitude).toBeCloseTo(-23.36, 2);
    expect(position.coordinates.longitude).toBeCloseTo(-51.55, 2);
  });

  it("calculates pet position during return travel", () => {
    const position = getPetMapPosition(
      nuvemDelivery,
      new Date("2026-07-18T21:30:00.000Z"),
    );

    expect(position.leg).toBe("returning");
    expect(position.legProgress).toBe(0.5);
    expect(position.outboundProgress).toBe(1);
    expect(position.coordinates.latitude).toBeCloseTo(-23.36, 2);
    expect(position.coordinates.longitude).toBeCloseTo(-51.55, 2);
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
      new Date("2026-07-18T13:00:00.000Z"),
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
      new Date("2026-07-18T16:00:00.000Z"),
      [rewardPoint],
    );

    expect(rewards.every((reward) => reward.discovered)).toBe(true);
  });

  it("creates route and reward GeoJSON collections", () => {
    const rewards = getRouteRewardDiscoveries(nuvemDelivery, new Date("2026-07-18T18:00:00.000Z"));
    const routeGeoJson = createDeliveryRouteGeoJson(nuvemDelivery);
    const rewardGeoJson = createRouteRewardsGeoJson(rewards);

    expect(routeGeoJson.features[0]?.geometry.coordinates).toEqual([
      [-51.1696, -23.3045],
      [-51.9333, -23.4205],
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
        label: "Londrina",
      },
      {
        coordinates: nuvemDelivery.destination,
        id: "destination",
        kind: "destination",
        label: "Maringá",
      },
    ]);

    expect(labelGeoJson.features).toHaveLength(2);
    expect(labelGeoJson.features[0]?.properties.label).toBe("Londrina");
    expect(labelGeoJson.features[1]?.geometry.coordinates).toEqual([-51.9333, -23.4205]);
  });

  it("resolves guided camera coordinates for every point target", () => {
    const rewards = getRouteRewardDiscoveries(
      nuvemDelivery,
      new Date("2026-07-18T18:00:00.000Z"),
    );
    const mascotPosition = { latitude: 10, longitude: -20 };

    expect(getMapFocusCoordinate({ kind: "mascot" }, nuvemDelivery, mascotPosition, rewards))
      .toEqual(mascotPosition);
    expect(getMapFocusCoordinate({ kind: "origin" }, nuvemDelivery, mascotPosition, rewards))
      .toEqual(nuvemDelivery.origin);
    expect(getMapFocusCoordinate({ kind: "destination" }, nuvemDelivery, mascotPosition, rewards))
      .toEqual(nuvemDelivery.destination);
    expect(getMapFocusCoordinate(
      { kind: "reward", rewardId: rewards[0]!.id },
      nuvemDelivery,
      mascotPosition,
      rewards,
    )).toEqual(rewards[0]!.coordinates);
    expect(getMapFocusCoordinate({ kind: "overview" }, nuvemDelivery, mascotPosition, rewards))
      .toBeUndefined();
  });

  it("ignores an unknown reward camera target", () => {
    expect(getMapFocusCoordinate(
      { kind: "reward", rewardId: "missing-reward" },
      nuvemDelivery,
      nuvemDelivery.origin,
      [],
    )).toBeUndefined();
  });

  it.each([
    ["preparing", 0, 0, 0],
    ["outbound", 0.4, 1, 0],
    ["delivered", 1, 1, 0],
    ["returning", 0.35, 1, 1],
    ["returned", 1, 1, 1],
    ["completed", 1, 1, 1],
  ] as const)(
    "creates outbound and return progress for the %s state",
    (leg, legProgress, outboundFeatures, returnFeatures) => {
      const progress = createTravelProgressGeoJson(nuvemDelivery, {
        coordinates: nuvemDelivery.origin,
        leg,
        legProgress,
        outboundProgress: leg === "preparing" ? 0 : 1,
      });

      expect(progress.outbound.features).toHaveLength(outboundFeatures);
      expect(progress.returning.features).toHaveLength(returnFeatures);
    },
  );

  it("clamps progress geometry and falls back safely for invalid timestamps", () => {
    const progress = createTravelProgressGeoJson(nuvemDelivery, {
      coordinates: nuvemDelivery.destination,
      leg: "outbound",
      legProgress: 4,
      outboundProgress: 4,
    });
    const invalidDelivery = {
      ...nuvemDelivery,
      outboundArrivalAt: "invalid",
      outboundStartAt: "invalid",
    };

    expect(progress.outbound.features[0]?.geometry.coordinates[1]?.[0])
      .toBeCloseTo(nuvemDelivery.destination.longitude, 6);
    expect(progress.outbound.features[0]?.geometry.coordinates[1]?.[1])
      .toBeCloseTo(nuvemDelivery.destination.latitude, 6);
    expect(getPetMapPosition(invalidDelivery, new Date("2026-07-18T15:00:00.000Z"))).toMatchObject({
      coordinates: invalidDelivery.origin,
      leg: "preparing",
      legProgress: 0,
    });
  });

  it("detects rewards exactly when progress crosses their thresholds", () => {
    const rewards = [
      { ...getEligibleRouteRewards(nuvemDelivery)[0]!, id: "first", routeProgress: 0.25 },
      { ...getEligibleRouteRewards(nuvemDelivery)[0]!, id: "second", routeProgress: 0.5 },
    ];

    expect(getCrossedRouteRewardIds(rewards, 0.1, 0.25)).toEqual(["first"]);
    expect(getCrossedRouteRewardIds(rewards, 0.25, 0.5)).toEqual(["second"]);
    expect(getCrossedRouteRewardIds(rewards, 0.1, 0.6)).toEqual(["first", "second"]);
  });

  it("does not repeat known rewards or react to invalid and regressive progress", () => {
    const reward = { ...getEligibleRouteRewards(nuvemDelivery)[0]!, routeProgress: 0.4 };

    expect(getCrossedRouteRewardIds([reward], 0.2, 0.8, new Set([reward.id]))).toEqual([]);
    expect(getCrossedRouteRewardIds([reward], 0.8, 0.2)).toEqual([]);
    expect(getCrossedRouteRewardIds([reward], Number.NaN, 0.8)).toEqual([]);
    expect(getCrossedRouteRewardIds([reward], 0.4, 0.4)).toEqual([]);
  });

  it("maps future, new, and carried discovery states", () => {
    const reward = getEligibleRouteRewards(nuvemDelivery)[0]!;

    expect(getRouteDiscoveryVisualState(reward, new Set())).toBe("future");
    expect(getRouteDiscoveryVisualState(reward, new Set([reward.id]))).toBe("new");
    expect(getRouteDiscoveryVisualState({ ...reward, discovered: true }, new Set())).toBe("carried");
  });
});

function createTestRewardPoint(
  overrides: Partial<RouteRewardPoint> = {},
): RouteRewardPoint {
  return {
    coordinates: { latitude: 0, longitude: 5 },
    descriptionKey: "map.rewards.londrinaPostcard.description",
    eligibilityRadiusKm: 80,
    id: "route-reward-test",
    kind: "badge",
    rarity: "common",
    regionKind: "city",
    regionLabel: "Test City",
    titleKey: "map.rewards.londrinaPostcard.name",
    ...overrides,
  };
}
