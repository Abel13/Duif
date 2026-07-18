import { describe, expect, it } from "vitest";

import { nuvemDelivery } from "./mockData";
import {
  createPostalTrafficGeoJson,
  getNearbyPostalTrafficPets,
  getPostalTrafficLabel,
  getPostalTrafficPetPosition,
  type PostalTrafficPet,
} from "./postalTraffic";

const testPet: PostalTrafficPet = {
  friendName: "Lia",
  id: "traffic-test",
  mascotName: "Aurora",
  route: {
    origin: { latitude: 0, longitude: 0 },
    destination: { latitude: 0, longitude: 10 },
    outboundStartAt: "2026-07-11T10:00:00.000Z",
    outboundArrivalAt: "2026-07-11T12:00:00.000Z",
  },
  speciesKey: "species.carrierPigeon",
  visibility: "friend",
};

describe("postal traffic helpers", () => {
  it("interpolates a traffic pet position from route timestamps", () => {
    const position = getPostalTrafficPetPosition(
      testPet,
      new Date("2026-07-11T11:00:00.000Z"),
    );

    expect(position.progress).toBe(0.5);
    expect(position.coordinates).toEqual({ latitude: 0, longitude: 5 });
  });

  it("uses identified labels for friend pets", () => {
    expect(getPostalTrafficLabel(testPet)).toBe("Aurora / Lia");
  });

  it("uses an anonymous label key for non-friend pets", () => {
    expect(
      getPostalTrafficLabel({
        ...testPet,
        friendName: undefined,
        mascotName: undefined,
        visibility: "anonymous",
      }),
    ).toBe("postalTraffic.anonymousPet");
  });

  it("filters nearby traffic pets by distance from the active route", () => {
    const nearbyPet: PostalTrafficPet = {
      ...testPet,
      route: {
        ...testPet.route,
        origin: { latitude: -23.3045, longitude: -51.1696 },
        destination: { latitude: -23.4205, longitude: -51.9333 },
      },
    };
    const farPet: PostalTrafficPet = {
      ...testPet,
      id: "traffic-far-test",
      route: {
        ...testPet.route,
        origin: { latitude: 35.6762, longitude: 139.6503 },
        destination: { latitude: -33.8688, longitude: 151.2093 },
      },
      visibility: "anonymous",
    };

    const traffic = getNearbyPostalTrafficPets(
      nuvemDelivery,
      new Date("2026-07-11T11:00:00.000Z"),
      [nearbyPet, farPet],
      900,
    );

    expect(traffic).toHaveLength(1);
    expect(traffic[0]?.id).toBe("traffic-test");
  });

  it("returns an empty state when no traffic pets are nearby", () => {
    expect(
      getNearbyPostalTrafficPets(
        nuvemDelivery,
        new Date("2026-07-11T11:00:00.000Z"),
        [
          {
            ...testPet,
            route: {
              ...testPet.route,
              origin: { latitude: 35.6762, longitude: 139.6503 },
              destination: { latitude: -33.8688, longitude: 151.2093 },
            },
          },
        ],
        100,
      ),
    ).toHaveLength(0);
  });

  it("creates GeoJSON for postal traffic markers", () => {
    const traffic = getNearbyPostalTrafficPets(
      nuvemDelivery,
      new Date("2026-07-11T11:00:00.000Z"),
      [
        {
          ...testPet,
          route: {
            ...testPet.route,
            origin: { latitude: -23.3045, longitude: -51.1696 },
            destination: { latitude: -23.4205, longitude: -51.9333 },
          },
        },
      ],
      900,
    );
    const geoJson = createPostalTrafficGeoJson(traffic);

    expect(geoJson.features).toHaveLength(1);
    expect(geoJson.features[0]?.properties.visibility).toBe("friend");
    expect(geoJson.features[0]?.geometry.coordinates[0]).toBeCloseTo(-51.55145, 4);
    expect(geoJson.features[0]?.geometry.coordinates[1]).toBeCloseTo(-23.3625, 4);
  });
});
