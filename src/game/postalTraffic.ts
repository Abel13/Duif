import type { TranslationKey } from "../i18n";
import { assetPaths } from "./assets";
import { interpolateCoordinates, type MapCoordinate, type TravelLeg } from "./mapTravel";
import { clampProgress, haversineDistanceKm } from "./travel";

export const POSTAL_TRAFFIC_VISIBILITY_RADIUS_KM = 250;
export const POSTAL_TRAFFIC_MAX_VISIBLE = 10;

export type PostalTrafficVisibility = "friend" | "public";
export type PostalTrafficRangeState = "visible" | "outOfRange";

export type PostalTrafficRouteSnapshot = {
  origin: MapCoordinate;
  destination: MapCoordinate;
  originRegionKey: TranslationKey;
  destinationRegionKey: TranslationKey;
  outboundStartAt: string;
  outboundArrivalAt: string;
  returnStartAt?: string;
  returnArrivalAt?: string;
};

type PostalTrafficPetBase = {
  id: string;
  mascotName: string;
  portraitAssetPath: string;
  route: PostalTrafficRouteSnapshot;
  speciesKey: TranslationKey;
};

export type PostalTrafficPet =
  | (PostalTrafficPetBase & {
      friendId: string;
      friendName: string;
      visibility: "friend";
    })
  | (PostalTrafficPetBase & {
      visibility: "public";
    });

type PostalTrafficPetSnapshotBase = {
  coordinates: MapCoordinate;
  destinationRegionKey: TranslationKey;
  distanceFromMascotKm: number;
  id: string;
  label: string;
  leg: TravelLeg;
  mascotName: string;
  originRegionKey: TranslationKey;
  portraitAssetPath: string;
  progress: number;
  speciesKey: TranslationKey;
};

export type PostalTrafficPetSnapshot =
  | (PostalTrafficPetSnapshotBase & {
      friendId: string;
      friendName: string;
      visibility: "friend";
    })
  | (PostalTrafficPetSnapshotBase & {
      visibility: "public";
    });

type PostalTrafficFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      id: string;
      label: string;
      visibility: PostalTrafficVisibility;
    };
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
  }>;
};

export const mockPostalTrafficPets: PostalTrafficPet[] = [
  {
    friendId: "friend-lisbon",
    friendName: "Lia",
    id: "traffic-lia-aurora",
    mascotName: "Aurora",
    portraitAssetPath: assetPaths.friends.mascot("aurora.webp"),
    route: {
      origin: { latitude: -23.4205, longitude: -51.9333 },
      destination: { latitude: -23.3045, longitude: -51.1696 },
      originRegionKey: "postalTraffic.regions.paranaBrazil",
      destinationRegionKey: "postalTraffic.regions.paranaBrazil",
      outboundStartAt: "2026-07-18T22:00:00.000Z",
      outboundArrivalAt: "2026-07-19T02:00:00.000Z",
      returnStartAt: "2026-07-19T02:30:00.000Z",
      returnArrivalAt: "2026-07-19T06:30:00.000Z",
    },
    speciesKey: "species.mailDuck",
    visibility: "friend",
  },
  {
    id: "traffic-public-bento",
    mascotName: "Bento",
    portraitAssetPath: assetPaths.mascots.publicPortrait("bento.webp"),
    route: {
      origin: { latitude: -23.2758, longitude: -51.2797 },
      destination: { latitude: -23.5508, longitude: -51.4608 },
      originRegionKey: "postalTraffic.regions.paranaBrazil",
      destinationRegionKey: "postalTraffic.regions.paranaBrazil",
      outboundStartAt: "2026-07-18T21:30:00.000Z",
      outboundArrivalAt: "2026-07-19T01:30:00.000Z",
    },
    speciesKey: "species.messengerFalcon",
    visibility: "public",
  },
  {
    friendId: "friend-toronto",
    friendName: "Mina",
    id: "traffic-mina-maple",
    mascotName: "Maple",
    portraitAssetPath: assetPaths.friends.mascot("maple.webp"),
    route: {
      origin: { latitude: -23.415, longitude: -51.4245 },
      destination: { latitude: -23.4205, longitude: -51.9333 },
      originRegionKey: "postalTraffic.regions.paranaBrazil",
      destinationRegionKey: "postalTraffic.regions.paranaBrazil",
      outboundStartAt: "2026-07-18T20:30:00.000Z",
      outboundArrivalAt: "2026-07-19T02:30:00.000Z",
    },
    speciesKey: "species.mailDuck",
    visibility: "friend",
  },
  {
    id: "traffic-public-oliva",
    mascotName: "Oliva",
    portraitAssetPath: assetPaths.mascots.publicPortrait("oliva.webp"),
    route: {
      origin: { latitude: 35.6762, longitude: 139.6503 },
      destination: { latitude: -33.8688, longitude: 151.2093 },
      originRegionKey: "postalTraffic.regions.tokyoJapan",
      destinationRegionKey: "postalTraffic.regions.newSouthWalesAustralia",
      outboundStartAt: "2026-07-18T10:00:00.000Z",
      outboundArrivalAt: "2026-07-20T10:00:00.000Z",
    },
    speciesKey: "species.mailDuck",
    visibility: "public",
  },
];

export function getPostalTrafficPetPosition(
  pet: PostalTrafficPet,
  now: Date = new Date(),
): { coordinates: MapCoordinate; leg: TravelLeg; progress: number } {
  const currentTime = now.getTime();
  const outboundStartTime = Date.parse(pet.route.outboundStartAt);
  const outboundArrivalTime = Date.parse(pet.route.outboundArrivalAt);
  const returnStartTime = pet.route.returnStartAt ? Date.parse(pet.route.returnStartAt) : Number.NaN;
  const returnArrivalTime = pet.route.returnArrivalAt ? Date.parse(pet.route.returnArrivalAt) : Number.NaN;

  if (!Number.isFinite(currentTime) || !Number.isFinite(outboundStartTime) || !Number.isFinite(outboundArrivalTime)) {
    return { coordinates: pet.route.origin, leg: "preparing", progress: 0 };
  }
  if (currentTime < outboundStartTime) {
    return { coordinates: pet.route.origin, leg: "preparing", progress: 0 };
  }
  if (currentTime < outboundArrivalTime) {
    const progress = clampProgress((currentTime - outboundStartTime) / (outboundArrivalTime - outboundStartTime));
    return {
      coordinates: interpolateCoordinates(pet.route.origin, pet.route.destination, progress),
      leg: "outbound",
      progress,
    };
  }
  if (!Number.isFinite(returnStartTime) || !Number.isFinite(returnArrivalTime) || currentTime < returnStartTime) {
    return { coordinates: pet.route.destination, leg: "delivered", progress: 1 };
  }
  if (currentTime < returnArrivalTime) {
    const progress = clampProgress((currentTime - returnStartTime) / (returnArrivalTime - returnStartTime));
    return {
      coordinates: interpolateCoordinates(pet.route.destination, pet.route.origin, progress),
      leg: "returning",
      progress,
    };
  }
  return { coordinates: pet.route.origin, leg: "returned", progress: 1 };
}

export function getPostalTrafficLabel(pet: Pick<PostalTrafficPet, "mascotName">) {
  return pet.mascotName;
}

export function getNearbyPostalTrafficPets(
  mascotCoordinates: MapCoordinate,
  now: Date = new Date(),
  pets: PostalTrafficPet[] = mockPostalTrafficPets,
  maxDistanceKm = POSTAL_TRAFFIC_VISIBILITY_RADIUS_KM,
  limit = POSTAL_TRAFFIC_MAX_VISIBLE,
): PostalTrafficPetSnapshot[] {
  return pets
    .map((pet) => createPublicTrafficSnapshot(pet, mascotCoordinates, now))
    .filter((pet) => pet.distanceFromMascotKm <= maxDistanceKm)
    .sort((left, right) => left.distanceFromMascotKm - right.distanceFromMascotKm || left.id.localeCompare(right.id))
    .slice(0, Math.max(0, limit));
}

export function createPublicTrafficSnapshot(
  pet: PostalTrafficPet,
  mascotCoordinates: MapCoordinate,
  now: Date = new Date(),
): PostalTrafficPetSnapshot {
  const position = getPostalTrafficPetPosition(pet, now);
  const base = {
    coordinates: position.coordinates,
    destinationRegionKey: pet.route.destinationRegionKey,
    distanceFromMascotKm: haversineDistanceKm(mascotCoordinates, position.coordinates),
    id: pet.id,
    label: getPostalTrafficLabel(pet),
    leg: position.leg,
    mascotName: pet.mascotName,
    originRegionKey: pet.route.originRegionKey,
    portraitAssetPath: pet.portraitAssetPath,
    progress: Math.round(position.progress * 100),
    speciesKey: pet.speciesKey,
  };

  return pet.visibility === "friend"
    ? { ...base, friendId: pet.friendId, friendName: pet.friendName, visibility: "friend" }
    : { ...base, visibility: "public" };
}

export function resolvePostalTrafficSelection(
  traffic: PostalTrafficPetSnapshot[],
  selectedId: string | undefined,
  previous: PostalTrafficPetSnapshot | undefined,
): { pet?: PostalTrafficPetSnapshot; rangeState?: PostalTrafficRangeState } {
  if (!selectedId) return {};
  const visible = traffic.find((pet) => pet.id === selectedId);
  if (visible) return { pet: visible, rangeState: "visible" };
  return previous?.id === selectedId
    ? { pet: previous, rangeState: "outOfRange" }
    : {};
}

export function createPostalTrafficGeoJson(
  traffic: PostalTrafficPetSnapshot[],
): PostalTrafficFeatureCollection {
  return {
    type: "FeatureCollection",
    features: traffic.map((pet) => ({
      type: "Feature",
      properties: { id: pet.id, label: pet.label, visibility: pet.visibility },
      geometry: {
        type: "Point",
        coordinates: [pet.coordinates.longitude, pet.coordinates.latitude],
      },
    })),
  };
}
