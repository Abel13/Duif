import type { TranslationKey } from "../i18n";
import { clampProgress, getDeliveryStatus } from "./travel";
import type { Coordinates, Delivery, RewardRarity } from "./types";

export type MapCoordinate = Pick<Coordinates, "latitude" | "longitude">;

export type TravelLeg = "preparing" | "outbound" | "delivered" | "returning" | "returned" | "completed";

export type PetMapPosition = {
  coordinates: MapCoordinate;
  leg: TravelLeg;
  legProgress: number;
  outboundProgress: number;
};

export type RouteRewardKind = "badge" | "postcard" | "stamp" | "souvenir";

export type RouteRewardDiscovery = {
  coordinates: MapCoordinate;
  descriptionKey: TranslationKey;
  discovered: boolean;
  id: string;
  kind: RouteRewardKind;
  rarity: RewardRarity;
  routeProgress: number;
  titleKey: TranslationKey;
};

export type MapPlaceLabelKind = "origin" | "destination" | "reward";

export type MapPlaceLabel = {
  coordinates: MapCoordinate;
  id: string;
  kind: MapPlaceLabelKind;
  label: string;
};

type LineStringFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      id: string;
    };
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  }>;
};

type PointFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      discovered: boolean;
      id: string;
      kind: RouteRewardKind;
      rarity: RewardRarity;
      titleKey: TranslationKey;
    };
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
  }>;
};

type PlaceLabelFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      id: string;
      kind: MapPlaceLabelKind;
      label: string;
    };
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
  }>;
};

const mockRouteRewards: RouteRewardDiscovery[] = [
  {
    coordinates: {
      latitude: -22.9068,
      longitude: -43.1729,
    },
    descriptionKey: "map.rewards.rioPostcard.description",
    discovered: false,
    id: "route-reward-rio-postcard",
    kind: "postcard",
    rarity: "common",
    routeProgress: 0.12,
    titleKey: "map.rewards.rioPostcard.name",
  },
  {
    coordinates: {
      latitude: 14.933,
      longitude: -23.5133,
    },
    descriptionKey: "map.rewards.capeVerdeBadge.description",
    discovered: false,
    id: "route-reward-cape-verde-badge",
    kind: "badge",
    rarity: "uncommon",
    routeProgress: 0.58,
    titleKey: "map.rewards.capeVerdeBadge.name",
  },
  {
    coordinates: {
      latitude: 32.7607,
      longitude: -16.9595,
    },
    descriptionKey: "map.rewards.madeiraStamp.description",
    discovered: false,
    id: "route-reward-madeira-stamp",
    kind: "stamp",
    rarity: "rare",
    routeProgress: 0.82,
    titleKey: "map.rewards.madeiraStamp.name",
  },
];

export function interpolateCoordinates(
  origin: MapCoordinate,
  destination: MapCoordinate,
  progress: number,
): MapCoordinate {
  const safeProgress = clampProgress(progress);

  return {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * safeProgress,
    longitude: origin.longitude + (destination.longitude - origin.longitude) * safeProgress,
  };
}

export function getPetMapPosition(delivery: Delivery, now: Date = new Date()): PetMapPosition {
  const status = getDeliveryStatus(delivery, now);

  if (status === "completed") {
    return {
      coordinates: delivery.origin,
      leg: "completed",
      legProgress: 1,
      outboundProgress: 1,
    };
  }

  const currentTime = now.getTime();
  const outboundStartTime = Date.parse(delivery.outboundStartAt);
  const outboundArrivalTime = Date.parse(delivery.outboundArrivalAt);
  const returnStartTime = delivery.returnStartAt ? Date.parse(delivery.returnStartAt) : Number.NaN;
  const returnArrivalTime = delivery.returnArrivalAt
    ? Date.parse(delivery.returnArrivalAt)
    : Number.NaN;

  if (!Number.isFinite(currentTime) || !Number.isFinite(outboundStartTime) || !Number.isFinite(outboundArrivalTime)) {
    return {
      coordinates: delivery.origin,
      leg: "preparing",
      legProgress: 0,
      outboundProgress: 0,
    };
  }

  if (currentTime < outboundStartTime) {
    return {
      coordinates: delivery.origin,
      leg: "preparing",
      legProgress: 0,
      outboundProgress: 0,
    };
  }

  if (currentTime < outboundArrivalTime) {
    const progress = clampProgress(
      (currentTime - outboundStartTime) / (outboundArrivalTime - outboundStartTime),
    );

    return {
      coordinates: interpolateCoordinates(delivery.origin, delivery.destination, progress),
      leg: "outbound",
      legProgress: progress,
      outboundProgress: progress,
    };
  }

  if (!Number.isFinite(returnStartTime) || !Number.isFinite(returnArrivalTime) || currentTime < returnStartTime) {
    return {
      coordinates: delivery.destination,
      leg: "delivered",
      legProgress: 1,
      outboundProgress: 1,
    };
  }

  if (currentTime < returnArrivalTime) {
    const progress = clampProgress(
      (currentTime - returnStartTime) / (returnArrivalTime - returnStartTime),
    );

    return {
      coordinates: interpolateCoordinates(delivery.destination, delivery.origin, progress),
      leg: "returning",
      legProgress: progress,
      outboundProgress: 1,
    };
  }

  return {
    coordinates: delivery.origin,
    leg: "returned",
    legProgress: 1,
    outboundProgress: 1,
  };
}

export function getRouteRewardDiscoveries(
  delivery: Delivery,
  now: Date = new Date(),
): RouteRewardDiscovery[] {
  const petPosition = getPetMapPosition(delivery, now);

  return mockRouteRewards.map((reward) => ({
    ...reward,
    discovered: petPosition.outboundProgress >= reward.routeProgress,
  }));
}

export function createDeliveryRouteGeoJson(delivery: Delivery): LineStringFeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: delivery.id,
        },
        geometry: {
          type: "LineString",
          coordinates: [
            toLngLat(delivery.origin),
            toLngLat(delivery.destination),
          ],
        },
      },
    ],
  };
}

export function createRouteRewardsGeoJson(
  rewards: RouteRewardDiscovery[],
): PointFeatureCollection {
  return {
    type: "FeatureCollection",
    features: rewards.map((reward) => ({
      type: "Feature",
      properties: {
        discovered: reward.discovered,
        id: reward.id,
        kind: reward.kind,
        rarity: reward.rarity,
        titleKey: reward.titleKey,
      },
      geometry: {
        type: "Point",
        coordinates: toLngLat(reward.coordinates),
      },
    })),
  };
}

export function createMapPlaceLabelsGeoJson(
  labels: MapPlaceLabel[],
): PlaceLabelFeatureCollection {
  return {
    type: "FeatureCollection",
    features: labels.map((label) => ({
      type: "Feature",
      properties: {
        id: label.id,
        kind: label.kind,
        label: label.label,
      },
      geometry: {
        type: "Point",
        coordinates: toLngLat(label.coordinates),
      },
    })),
  };
}

export function toLngLat(coordinates: MapCoordinate): [number, number] {
  return [coordinates.longitude, coordinates.latitude];
}
