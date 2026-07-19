import type { TranslationKey } from "../i18n";
import { assetPaths } from "./assets";
import { interpolateCoordinates, type MapCoordinate, type TravelLeg } from "./mapTravel";
import { clampProgress, haversineDistanceKm } from "./travel";

export const POSTAL_TRAFFIC_VISIBILITY_RADIUS_KM = 250;
export const POSTAL_TRAFFIC_MAX_VISIBLE = 10;
export const POSTAL_TRAFFIC_REFRESH_MS = 5 * 60 * 1000;
export const POSTAL_TRAFFIC_VIEWPORT_MARGIN = 0.25;

export type PostalTrafficVisibility = "friend" | "public";
export type PostalTrafficRangeState = "visible" | "outOfRange";
export type PostalTrafficVisualPhase = "entering" | "visible" | "leaving";

export type PostalTrafficViewport = {
  north: number;
  east: number;
  south: number;
  west: number;
};

export type PostalTrafficQueryAnchor = {
  center: MapCoordinate;
  viewport: PostalTrafficViewport;
};

export type PostalTrafficRouteSnapshot = {
  origin: MapCoordinate;
  destination: MapCoordinate;
  originRegionKey: TranslationKey;
  originRegionLabel?: string;
  destinationRegionKey: TranslationKey;
  destinationRegionLabel?: string;
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
  destinationRegionLabel?: string;
  distanceFromMascotKm: number;
  id: string;
  label: string;
  leg: TravelLeg;
  mascotName: string;
  originRegionKey: TranslationKey;
  originRegionLabel?: string;
  portraitAssetPath: string;
  progress: number;
  speciesKey: TranslationKey;
  route: PostalTrafficRouteSnapshot;
  visualPhase: PostalTrafficVisualPhase;
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
      origin: { latitude: -30.0346, longitude: -51.2177 },
      destination: { latitude: -27.5949, longitude: -48.5482 },
      originRegionKey: "postalTraffic.regions.rioGrandeDoSulBrazil",
      destinationRegionKey: "postalTraffic.regions.santaCatarinaBrazil",
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
      origin: { latitude: -16.6869, longitude: -49.2648 },
      destination: { latitude: -15.7939, longitude: -47.8828 },
      originRegionKey: "postalTraffic.regions.goiasBrazil",
      destinationRegionKey: "postalTraffic.regions.distritoFederalBrazil",
      outboundStartAt: "2026-07-18T21:30:00.000Z",
      outboundArrivalAt: "2026-07-19T06:30:00.000Z",
      returnStartAt: "2026-07-19T07:00:00.000Z",
      returnArrivalAt: "2026-07-19T16:00:00.000Z",
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
      origin: { latitude: -19.9167, longitude: -43.9345 },
      destination: { latitude: -19.539, longitude: -40.6306 },
      originRegionKey: "postalTraffic.regions.minasGeraisBrazil",
      destinationRegionKey: "postalTraffic.regions.espiritoSantoBrazil",
      outboundStartAt: "2026-07-18T20:30:00.000Z",
      outboundArrivalAt: "2026-07-19T02:30:00.000Z",
      returnStartAt: "2026-07-19T03:00:00.000Z",
      returnArrivalAt: "2026-07-19T09:00:00.000Z",
    },
    speciesKey: "species.mailDuck",
    visibility: "friend",
  },
  {
    id: "traffic-public-oliva",
    mascotName: "Oliva",
    portraitAssetPath: assetPaths.mascots.publicPortrait("oliva.webp"),
    route: {
      origin: { latitude: -12.9714, longitude: -38.5014 },
      destination: { latitude: -8.0476, longitude: -34.877 },
      originRegionKey: "postalTraffic.regions.bahiaBrazil",
      destinationRegionKey: "postalTraffic.regions.pernambucoBrazil",
      outboundStartAt: "2026-07-18T10:00:00.000Z",
      outboundArrivalAt: "2026-07-20T10:00:00.000Z",
      returnStartAt: "2026-07-20T10:30:00.000Z",
      returnArrivalAt: "2026-07-22T10:30:00.000Z",
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
    destinationRegionLabel: pet.route.destinationRegionLabel,
    distanceFromMascotKm: haversineDistanceKm(mascotCoordinates, position.coordinates),
    id: pet.id,
    label: getPostalTrafficLabel(pet),
    leg: position.leg,
    mascotName: pet.mascotName,
    originRegionKey: pet.route.originRegionKey,
    originRegionLabel: pet.route.originRegionLabel,
    portraitAssetPath: pet.portraitAssetPath,
    progress: Math.round(position.progress * 100),
    speciesKey: pet.speciesKey,
    route: pet.route,
    visualPhase: "visible" as const,
  };

  return pet.visibility === "friend"
    ? { ...base, friendId: pet.friendId, friendName: pet.friendName, visibility: "friend" }
    : { ...base, visibility: "public" };
}

export function getPostalTrafficSnapshotPosition(
  snapshot: PostalTrafficPetSnapshot,
  now: Date = new Date(),
) {
  return getPostalTrafficPetPosition(snapshotToPet(snapshot), now);
}

export function isPostalTrafficJourneyVisible(
  snapshot: PostalTrafficPetSnapshot,
  now: Date = new Date(),
) {
  const position = getPostalTrafficSnapshotPosition(snapshot, now);
  if (position.leg === "returned" || position.leg === "completed") return false;
  if (
    position.leg === "delivered" &&
    (!snapshot.route.returnStartAt || !snapshot.route.returnArrivalAt)
  ) {
    return false;
  }
  return true;
}

function snapshotToPet(snapshot: PostalTrafficPetSnapshot): PostalTrafficPet {
  const base = {
    id: snapshot.id,
    mascotName: snapshot.mascotName,
    portraitAssetPath: snapshot.portraitAssetPath,
    route: snapshot.route,
    speciesKey: snapshot.speciesKey,
  };
  return snapshot.visibility === "friend"
    ? { ...base, friendId: snapshot.friendId, friendName: snapshot.friendName, visibility: "friend" }
    : { ...base, visibility: "public" };
}

export function expandPostalTrafficViewport(
  viewport: PostalTrafficViewport,
  margin = POSTAL_TRAFFIC_VIEWPORT_MARGIN,
): PostalTrafficViewport {
  const latitudeSpan = Math.max(0, viewport.north - viewport.south);
  const longitudeSpan = viewport.east >= viewport.west
    ? viewport.east - viewport.west
    : viewport.east + 360 - viewport.west;
  return {
    north: Math.min(90, viewport.north + latitudeSpan * margin),
    south: Math.max(-90, viewport.south - latitudeSpan * margin),
    east: normalizeLongitude(viewport.east + longitudeSpan * margin),
    west: normalizeLongitude(viewport.west - longitudeSpan * margin),
  };
}

function normalizeLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
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
