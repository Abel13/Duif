import { describe, expect, it } from "vitest";

import {
  createPostalTrafficGeoJson,
  createPublicTrafficSnapshot,
  expandPostalTrafficViewport,
  getNearbyPostalTrafficPets,
  getPostalTrafficPetPosition,
  mockPostalTrafficPets,
  resolvePostalTrafficSelection,
  type PostalTrafficPet,
} from "./postalTraffic";

const referenceTime = new Date("2026-07-18T11:00:00.000Z");
const mascotCoordinates = { latitude: 0, longitude: 0 };

const friendPet: PostalTrafficPet = {
  friendId: "friend-lisbon",
  friendName: "Lia",
  id: "traffic-test",
  mascotName: "Aurora",
  portraitAssetPath: "/assets/friends/mascots/aurora.webp",
  route: {
    origin: { latitude: 0, longitude: 0 },
    destination: { latitude: 0, longitude: 10 },
    originRegionKey: "postalTraffic.regions.paranaBrazil",
    destinationRegionKey: "postalTraffic.regions.paranaBrazil",
    outboundStartAt: "2026-07-18T10:00:00.000Z",
    outboundArrivalAt: "2026-07-18T12:00:00.000Z",
  },
  speciesKey: "species.mailDuck",
  visibility: "friend",
};

function petAt(id: string, longitude: number): PostalTrafficPet {
  return {
    id,
    mascotName: id,
    portraitAssetPath: `/assets/${id}.webp`,
    route: {
      origin: { latitude: 0, longitude },
      destination: { latitude: 0, longitude },
      originRegionKey: "postalTraffic.regions.paranaBrazil",
      destinationRegionKey: "postalTraffic.regions.paranaBrazil",
      outboundStartAt: "2026-07-19T10:00:00.000Z",
      outboundArrivalAt: "2026-07-19T12:00:00.000Z",
    },
    speciesKey: "species.messengerFalcon",
    visibility: "public",
  };
}

describe("postal traffic helpers", () => {
  it("keeps every mock traffic route inside Brazil", () => {
    mockPostalTrafficPets.forEach((pet) => {
      expect(pet.route.originRegionKey).toMatch(/Brazil$/);
      expect(pet.route.destinationRegionKey).toMatch(/Brazil$/);
      [pet.route.origin, pet.route.destination].forEach((point) => {
        expect(point.latitude).toBeGreaterThanOrEqual(-34);
        expect(point.latitude).toBeLessThanOrEqual(6);
        expect(point.longitude).toBeGreaterThanOrEqual(-74);
        expect(point.longitude).toBeLessThanOrEqual(-34);
      });
    });
  });

  it("interpolates outbound and returning positions with integer public progress", () => {
    const outbound = getPostalTrafficPetPosition(friendPet, referenceTime);
    const returningPet: PostalTrafficPet = {
      ...friendPet,
      route: {
        ...friendPet.route,
        returnStartAt: "2026-07-18T13:00:00.000Z",
        returnArrivalAt: "2026-07-18T15:00:00.000Z",
      },
    };
    const returning = getPostalTrafficPetPosition(
      returningPet,
      new Date("2026-07-18T14:00:00.000Z"),
    );

    expect(outbound).toMatchObject({ leg: "outbound", progress: 0.5 });
    expect(outbound.coordinates).toEqual({ latitude: 0, longitude: 5 });
    expect(returning).toMatchObject({ leg: "returning", progress: 0.5 });
    expect(returning.coordinates).toEqual({ latitude: 0, longitude: 5 });
    expect(createPublicTrafficSnapshot(friendPet, mascotCoordinates, referenceTime).progress).toBe(50);
  });

  it("sanitizes invalid timestamps to a preparing position", () => {
    const pet = {
      ...friendPet,
      route: { ...friendPet.route, outboundStartAt: "invalid" },
    };
    expect(getPostalTrafficPetPosition(pet, referenceTime)).toEqual({
      coordinates: pet.route.origin,
      leg: "preparing",
      progress: 0,
    });
  });

  it("includes the exact range boundary and excludes immediately outside it", () => {
    const pet = petAt("boundary", 2);
    const distance = createPublicTrafficSnapshot(pet, mascotCoordinates, referenceTime)
      .distanceFromMascotKm;

    expect(getNearbyPostalTrafficPets(mascotCoordinates, referenceTime, [pet], distance)).toHaveLength(1);
    expect(getNearbyPostalTrafficPets(mascotCoordinates, referenceTime, [pet], distance - 0.01)).toHaveLength(0);
  });

  it("sorts by current distance, breaks ties by id, and limits twelve entries to ten", () => {
    const pets = Array.from({ length: 12 }, (_, index) =>
      petAt(`traffic-${String.fromCharCode(108 - index)}`, index < 2 ? 0.1 : 0.1 + index * 0.01),
    );
    const traffic = getNearbyPostalTrafficPets(mascotCoordinates, referenceTime, pets, 250, 10);

    expect(traffic).toHaveLength(10);
    expect(traffic.slice(0, 2).map((pet) => pet.id)).toEqual(["traffic-k", "traffic-l"]);
    expect(traffic[9]!.distanceFromMascotKm).toBeLessThanOrEqual(traffic[10]?.distanceFromMascotKm ?? Infinity);
  });

  it("does not expose owner fields in public mascot snapshots", () => {
    const pet = petAt("bento", 0.2);
    const snapshot = createPublicTrafficSnapshot(pet, mascotCoordinates, referenceTime);
    expect(snapshot.visibility).toBe("public");
    expect("friendId" in snapshot).toBe(false);
    expect("friendName" in snapshot).toBe(false);
    expect(snapshot.route).toEqual(pet.route);
  });

  it("keeps friend identity in friend snapshots for the profile CTA", () => {
    expect(createPublicTrafficSnapshot(friendPet, mascotCoordinates, referenceTime)).toMatchObject({
      friendId: "friend-lisbon",
      friendName: "Lia",
      mascotName: "Aurora",
      visibility: "friend",
    });
  });

  it("freezes an out-of-range selection and resumes it when visible again", () => {
    const previous = createPublicTrafficSnapshot(petAt("bento", 0.2), mascotCoordinates, referenceTime);
    expect(resolvePostalTrafficSelection([], "bento", previous)).toEqual({
      pet: previous,
      rangeState: "outOfRange",
    });

    const visible = { ...previous, progress: 51 };
    expect(resolvePostalTrafficSelection([visible], "bento", previous)).toEqual({
      pet: visible,
      rangeState: "visible",
    });
  });

  it("creates public GeoJSON without route endpoints", () => {
    const traffic = getNearbyPostalTrafficPets(mascotCoordinates, referenceTime, [petAt("bento", 0.2)]);
    const geoJson = createPostalTrafficGeoJson(traffic);

    expect(geoJson.features).toHaveLength(1);
    expect(geoJson.features[0]?.properties).toEqual({
      id: "bento",
      label: "bento",
      visibility: "public",
    });
    expect(geoJson.features[0]?.geometry.coordinates).toEqual([0.2, 0]);
  });

  it("expands normal and antimeridian viewports by 25%", () => {
    expect(expandPostalTrafficViewport({ north: 10, east: 20, south: 0, west: 0 })).toEqual({
      north: 12.5, east: 25, south: -2.5, west: -5,
    });
    expect(expandPostalTrafficViewport({ north: 10, east: -170, south: 0, west: 170 })).toMatchObject({
      east: -165, west: 165,
    });
  });
});
