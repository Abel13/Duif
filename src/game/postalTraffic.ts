import type { TranslationKey } from "../i18n";
import {
  getDistanceFromPointToRouteKm,
  interpolateCoordinates,
  type MapCoordinate,
} from "./mapTravel";
import { clampProgress } from "./travel";
import type { Delivery } from "./types";

export type PostalTrafficVisibility = "friend" | "anonymous";

export type PostalTrafficRouteSnapshot = {
  origin: MapCoordinate;
  destination: MapCoordinate;
  outboundStartAt: string;
  outboundArrivalAt: string;
  returnStartAt?: string;
  returnArrivalAt?: string;
};

export type PostalTrafficPet = {
  id: string;
  friendName?: string;
  mascotName?: string;
  route: PostalTrafficRouteSnapshot;
  speciesKey: TranslationKey;
  visibility: PostalTrafficVisibility;
};

export type PostalTrafficPetSnapshot = PostalTrafficPet & {
  coordinates: MapCoordinate;
  distanceFromRouteKm: number;
  label: string;
  progress: number;
};

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
    friendName: "Lia",
    id: "traffic-lia-aurora",
    mascotName: "Aurora",
    route: {
      origin: { latitude: -23.4205, longitude: -51.9333 },
      destination: { latitude: -23.3045, longitude: -51.1696 },
      outboundStartAt: "2026-07-18T12:30:00.000Z",
      outboundArrivalAt: "2026-07-18T18:30:00.000Z",
      returnStartAt: "2026-07-18T19:00:00.000Z",
      returnArrivalAt: "2026-07-19T01:00:00.000Z",
    },
    speciesKey: "species.carrierPigeon",
    visibility: "friend",
  },
  {
    id: "traffic-anonymous-parana",
    route: {
      origin: { latitude: -23.2758, longitude: -51.2797 },
      destination: { latitude: -23.5508, longitude: -51.4608 },
      outboundStartAt: "2026-07-18T16:00:00.000Z",
      outboundArrivalAt: "2026-07-18T23:00:00.000Z",
    },
    speciesKey: "species.messengerFalcon",
    visibility: "anonymous",
  },
  {
    friendName: "Mina",
    id: "traffic-mina-maple",
    mascotName: "Maple",
    route: {
      origin: { latitude: -23.415, longitude: -51.4245 },
      destination: { latitude: -23.4205, longitude: -51.9333 },
      outboundStartAt: "2026-07-18T17:00:00.000Z",
      outboundArrivalAt: "2026-07-19T00:00:00.000Z",
    },
    speciesKey: "species.mailDuck",
    visibility: "friend",
  },
  {
    id: "traffic-far-anonymous",
    route: {
      origin: { latitude: 35.6762, longitude: 139.6503 },
      destination: { latitude: -33.8688, longitude: 151.2093 },
      outboundStartAt: "2026-07-10T00:00:00.000Z",
      outboundArrivalAt: "2026-07-12T00:00:00.000Z",
    },
    speciesKey: "species.mailDuck",
    visibility: "anonymous",
  },
];

export function getPostalTrafficPetPosition(
  pet: PostalTrafficPet,
  now: Date = new Date(),
): {
  coordinates: MapCoordinate;
  progress: number;
} {
  const currentTime = now.getTime();
  const outboundStartTime = Date.parse(pet.route.outboundStartAt);
  const outboundArrivalTime = Date.parse(pet.route.outboundArrivalAt);
  const returnStartTime = pet.route.returnStartAt ? Date.parse(pet.route.returnStartAt) : Number.NaN;
  const returnArrivalTime = pet.route.returnArrivalAt ? Date.parse(pet.route.returnArrivalAt) : Number.NaN;

  if (!Number.isFinite(currentTime) || !Number.isFinite(outboundStartTime) || !Number.isFinite(outboundArrivalTime)) {
    return {
      coordinates: pet.route.origin,
      progress: 0,
    };
  }

  if (currentTime < outboundStartTime) {
    return {
      coordinates: pet.route.origin,
      progress: 0,
    };
  }

  if (currentTime < outboundArrivalTime) {
    const progress = clampProgress((currentTime - outboundStartTime) / (outboundArrivalTime - outboundStartTime));

    return {
      coordinates: interpolateCoordinates(pet.route.origin, pet.route.destination, progress),
      progress,
    };
  }

  if (!Number.isFinite(returnStartTime) || !Number.isFinite(returnArrivalTime) || currentTime < returnStartTime) {
    return {
      coordinates: pet.route.destination,
      progress: 1,
    };
  }

  if (currentTime < returnArrivalTime) {
    const progress = clampProgress((currentTime - returnStartTime) / (returnArrivalTime - returnStartTime));

    return {
      coordinates: interpolateCoordinates(pet.route.destination, pet.route.origin, progress),
      progress,
    };
  }

  return {
    coordinates: pet.route.origin,
    progress: 1,
  };
}

export function getPostalTrafficLabel(pet: PostalTrafficPet) {
  if (pet.visibility === "friend" && pet.friendName && pet.mascotName) {
    return `${pet.mascotName} / ${pet.friendName}`;
  }

  return "postalTraffic.anonymousPet";
}

export function getNearbyPostalTrafficPets(
  delivery: Delivery,
  now: Date = new Date(),
  pets: PostalTrafficPet[] = mockPostalTrafficPets,
  maxDistanceFromRouteKm = 900,
): PostalTrafficPetSnapshot[] {
  return pets.flatMap((pet) => {
    const position = getPostalTrafficPetPosition(pet, now);
    const distanceFromRouteKm = getDistanceFromPointToRouteKm(
      delivery.origin,
      delivery.destination,
      position.coordinates,
    );

    if (distanceFromRouteKm > maxDistanceFromRouteKm) {
      return [];
    }

    return [
      {
        ...pet,
        coordinates: position.coordinates,
        distanceFromRouteKm,
        label: getPostalTrafficLabel(pet),
        progress: position.progress,
      },
    ];
  });
}

export function createPostalTrafficGeoJson(
  traffic: PostalTrafficPetSnapshot[],
): PostalTrafficFeatureCollection {
  return {
    type: "FeatureCollection",
    features: traffic.map((pet) => ({
      type: "Feature",
      properties: {
        id: pet.id,
        label: pet.label,
        visibility: pet.visibility,
      },
      geometry: {
        type: "Point",
        coordinates: [pet.coordinates.longitude, pet.coordinates.latitude],
      },
    })),
  };
}
