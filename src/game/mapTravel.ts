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

export type RouteRewardKind = "badge" | "postcard" | "stamp" | "souvenir" | "material" | "eventItem";
export type RouteRewardRegionKind = "city" | "state" | "country" | "event";

export type RouteRewardPoint = {
  coordinates: MapCoordinate;
  descriptionKey: TranslationKey;
  eligibilityRadiusKm: number;
  id: string;
  kind: RouteRewardKind;
  rarity: RewardRarity;
  regionKind: RouteRewardRegionKind;
  regionLabel: string;
  titleKey: TranslationKey;
};

export type RouteRewardDiscovery = {
  coordinates: MapCoordinate;
  descriptionKey: TranslationKey;
  discovered: boolean;
  distanceFromRouteKm: number;
  id: string;
  kind: RouteRewardKind;
  rarity: RewardRarity;
  regionKind: RouteRewardRegionKind;
  regionLabel: string;
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
      regionKind: RouteRewardRegionKind;
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

const earthRadiusKm = 6371;

export const mockRouteRewardPoints: RouteRewardPoint[] = [
  {
    coordinates: {
      latitude: -22.9068,
      longitude: -43.1729,
    },
    descriptionKey: "map.rewards.rioPostcard.description",
    eligibilityRadiusKm: 360,
    id: "route-reward-rio-postcard",
    kind: "postcard",
    rarity: "common",
    regionKind: "city",
    regionLabel: "Rio de Janeiro, RJ, Brasil",
    titleKey: "map.rewards.rioPostcard.name",
  },
  {
    coordinates: {
      latitude: -12.9777,
      longitude: -38.5016,
    },
    descriptionKey: "map.rewards.bahiaSouvenir.description",
    eligibilityRadiusKm: 520,
    id: "route-reward-bahia-souvenir",
    kind: "souvenir",
    rarity: "common",
    regionKind: "state",
    regionLabel: "Bahia, Brasil",
    titleKey: "map.rewards.bahiaSouvenir.name",
  },
  {
    coordinates: {
      latitude: 14.933,
      longitude: -23.5133,
    },
    descriptionKey: "map.rewards.capeVerdeBadge.description",
    eligibilityRadiusKm: 700,
    id: "route-reward-cape-verde-badge",
    kind: "badge",
    rarity: "uncommon",
    regionKind: "country",
    regionLabel: "Cabo Verde",
    titleKey: "map.rewards.capeVerdeBadge.name",
  },
  {
    coordinates: {
      latitude: 27.7606,
      longitude: -15.586,
    },
    descriptionKey: "map.rewards.canaryMaterial.description",
    eligibilityRadiusKm: 580,
    id: "route-reward-canary-material",
    kind: "material",
    rarity: "uncommon",
    regionKind: "country",
    regionLabel: "Ilhas Canárias, Espanha",
    titleKey: "map.rewards.canaryMaterial.name",
  },
  {
    coordinates: {
      latitude: 32.7607,
      longitude: -16.9595,
    },
    descriptionKey: "map.rewards.madeiraStamp.description",
    eligibilityRadiusKm: 520,
    id: "route-reward-madeira-stamp",
    kind: "stamp",
    rarity: "rare",
    regionKind: "country",
    regionLabel: "Madeira, Portugal",
    titleKey: "map.rewards.madeiraStamp.name",
  },
  {
    coordinates: {
      latitude: 35.0,
      longitude: -12.0,
    },
    descriptionKey: "map.rewards.atlanticEvent.description",
    eligibilityRadiusKm: 420,
    id: "route-reward-atlantic-event",
    kind: "eventItem",
    rarity: "rare",
    regionKind: "event",
    regionLabel: "Atlântico Norte",
    titleKey: "map.rewards.atlanticEvent.name",
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
  return createRouteRewardDiscoveries(delivery, now);
}

export function createRouteRewardDiscoveries(
  delivery: Delivery,
  now: Date = new Date(),
  rewardPoints: RouteRewardPoint[] = mockRouteRewardPoints,
): RouteRewardDiscovery[] {
  const petPosition = getPetMapPosition(delivery, now);

  return getEligibleRouteRewards(delivery, rewardPoints).map((reward) => ({
    ...reward,
    discovered: petPosition.outboundProgress >= reward.routeProgress,
  }));
}

export function getEligibleRouteRewards(
  delivery: Delivery,
  rewardPoints: RouteRewardPoint[] = mockRouteRewardPoints,
): RouteRewardDiscovery[] {
  return rewardPoints.flatMap((rewardPoint) => {
    const distanceFromRouteKm = getDistanceFromPointToRouteKm(
      delivery.origin,
      delivery.destination,
      rewardPoint.coordinates,
    );

    if (distanceFromRouteKm > rewardPoint.eligibilityRadiusKm) {
      return [];
    }

    return [
      {
        coordinates: rewardPoint.coordinates,
        descriptionKey: rewardPoint.descriptionKey,
        discovered: false,
        distanceFromRouteKm,
        id: rewardPoint.id,
        kind: rewardPoint.kind,
        rarity: rewardPoint.rarity,
        regionKind: rewardPoint.regionKind,
        regionLabel: rewardPoint.regionLabel,
        routeProgress: getRouteRewardProgress(delivery.origin, delivery.destination, rewardPoint),
        titleKey: rewardPoint.titleKey,
      },
    ];
  });
}

export function getRouteRewardProgress(
  origin: MapCoordinate,
  destination: MapCoordinate,
  rewardPoint: RouteRewardPoint,
): number {
  return getProjectedRouteMetrics(origin, destination, rewardPoint.coordinates).progress;
}

export function getDistanceFromPointToRouteKm(
  origin: MapCoordinate,
  destination: MapCoordinate,
  point: MapCoordinate,
): number {
  return getProjectedRouteMetrics(origin, destination, point).distanceKm;
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
        regionKind: reward.regionKind,
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

function getProjectedRouteMetrics(
  origin: MapCoordinate,
  destination: MapCoordinate,
  point: MapCoordinate,
): {
  distanceKm: number;
  progress: number;
} {
  const referenceLatitude = (origin.latitude + destination.latitude + point.latitude) / 3;
  const projectedOrigin = projectCoordinateToKm(origin, referenceLatitude);
  const projectedDestination = projectCoordinateToKm(destination, referenceLatitude);
  const projectedPoint = projectCoordinateToKm(point, referenceLatitude);
  const routeX = projectedDestination.x - projectedOrigin.x;
  const routeY = projectedDestination.y - projectedOrigin.y;
  const routeLengthSquared = routeX * routeX + routeY * routeY;

  if (routeLengthSquared <= 0) {
    return {
      distanceKm: getProjectedDistanceKm(projectedOrigin, projectedPoint),
      progress: 0,
    };
  }

  const rawProgress =
    ((projectedPoint.x - projectedOrigin.x) * routeX + (projectedPoint.y - projectedOrigin.y) * routeY) /
    routeLengthSquared;
  const progress = clampProgress(rawProgress);
  const closestPoint = {
    x: projectedOrigin.x + routeX * progress,
    y: projectedOrigin.y + routeY * progress,
  };

  return {
    distanceKm: getProjectedDistanceKm(projectedPoint, closestPoint),
    progress,
  };
}

function projectCoordinateToKm(coordinate: MapCoordinate, referenceLatitude: number) {
  return {
    x: earthRadiusKm * toRadians(coordinate.longitude) * Math.cos(toRadians(referenceLatitude)),
    y: earthRadiusKm * toRadians(coordinate.latitude),
  };
}

function getProjectedDistanceKm(
  first: {
    x: number;
    y: number;
  },
  second: {
    x: number;
    y: number;
  },
) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
