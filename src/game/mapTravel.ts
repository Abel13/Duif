import type { TranslationKey } from "../i18n";
import type { OfficialAssetKey } from "./assets";
import { clampProgress, getDeliveryStatus } from "./travel";
import { getDeliveryTravelModifiers } from "./travelModifiers";
import type { Coordinates, Delivery, DeliveryStatus, RewardRarity } from "./types";

export type MapCoordinate = Pick<Coordinates, "latitude" | "longitude">;

export type MapFocusTarget =
  | { kind: "overview" }
  | { kind: "mascot" }
  | { kind: "origin" }
  | { kind: "destination" }
  | { kind: "reward"; rewardId: string }
  | { kind: "traffic"; trafficId: string };

export type MapSelection =
  | { kind: "reward"; rewardId: string }
  | { kind: "traffic"; trafficId: string }
  | null;
export type MapMotionPreference = "full" | "reduced";
export type RouteDiscoveryVisualState = "future" | "new" | "carried";
export type RouteDiscoveryEventOrigin = "visible" | "resume";
export type MapJourneyPhase = "traveling" | "returned" | "completed";

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
  thumbnailAssetKey?: OfficialAssetKey;
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
  thumbnailAssetKey?: OfficialAssetKey;
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

export type TravelProgressGeoJson = {
  outbound: LineStringFeatureCollection;
  returning: LineStringFeatureCollection;
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

export function getMapJourneyPhase(
  status: DeliveryStatus | string | undefined,
  isCollected: boolean,
): MapJourneyPhase {
  if (isCollected || status === "completed") return "completed";
  if (status === "returned") return "returned";
  return "traveling";
}

export const mockRouteRewardPoints: RouteRewardPoint[] = [
  {
    coordinates: {
      latitude: -23.3045,
      longitude: -51.1696,
    },
    descriptionKey: "map.rewards.londrinaPostcard.description",
    eligibilityRadiusKm: 18,
    id: "route-reward-londrina-postcard",
    kind: "postcard",
    rarity: "common",
    regionKind: "city",
    regionLabel: "Londrina, PR, Brasil",
    titleKey: "map.rewards.londrinaPostcard.name",
  },
  {
    coordinates: {
      latitude: -23.2758,
      longitude: -51.2797,
    },
    descriptionKey: "map.rewards.cambeSouvenir.description",
    eligibilityRadiusKm: 18,
    id: "route-reward-cambe-souvenir",
    kind: "souvenir",
    rarity: "common",
    regionKind: "state",
    regionLabel: "Cambé, PR, Brasil",
    titleKey: "map.rewards.cambeSouvenir.name",
  },
  {
    coordinates: {
      latitude: -23.3103,
      longitude: -51.3692,
    },
    descriptionKey: "map.rewards.rolandiaBadge.description",
    eligibilityRadiusKm: 18,
    id: "route-reward-rolandia-badge",
    kind: "badge",
    rarity: "uncommon",
    regionKind: "country",
    regionLabel: "Rolândia, PR, Brasil",
    titleKey: "map.rewards.rolandiaBadge.name",
  },
  {
    coordinates: {
      latitude: -23.415,
      longitude: -51.4245,
    },
    descriptionKey: "map.rewards.arapongasMaterial.description",
    eligibilityRadiusKm: 20,
    id: "route-reward-arapongas-material",
    kind: "material",
    rarity: "uncommon",
    regionKind: "country",
    regionLabel: "Arapongas, PR, Brasil",
    titleKey: "map.rewards.arapongasMaterial.name",
  },
  {
    coordinates: {
      latitude: -23.5508,
      longitude: -51.4608,
    },
    descriptionKey: "map.rewards.apucaranaStamp.description",
    eligibilityRadiusKm: 24,
    id: "route-reward-apucarana-stamp",
    kind: "stamp",
    rarity: "rare",
    regionKind: "country",
    regionLabel: "Apucarana, PR, Brasil",
    titleKey: "map.rewards.apucaranaStamp.name",
  },
  {
    coordinates: {
      latitude: -23.4205,
      longitude: -51.9333,
    },
    descriptionKey: "map.rewards.maringaEvent.description",
    eligibilityRadiusKm: 18,
    id: "route-reward-maringa-event",
    kind: "eventItem",
    rarity: "rare",
    regionKind: "event",
    regionLabel: "Maringá, PR, Brasil",
    titleKey: "map.rewards.maringaEvent.name",
  },
];

export function interpolateCoordinates(
  origin: MapCoordinate,
  destination: MapCoordinate,
  progress: number,
): MapCoordinate {
  const safeProgress = clampProgress(progress);
  const longitudeDelta = normalizeLongitude(
    destination.longitude - origin.longitude,
  );

  return {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * safeProgress,
    longitude: normalizeLongitude(origin.longitude + longitudeDelta * safeProgress),
  };
}

export function createInterpolatedRouteCoordinates(
  origin: MapCoordinate,
  destination: MapCoordinate,
  progress = 1,
  segmentCount = 64,
): MapCoordinate[] {
  const safeProgress = clampProgress(progress);
  const steps = Math.max(1, Math.ceil(Math.max(1, segmentCount) * safeProgress));
  return Array.from({ length: steps + 1 }, (_, index) =>
    interpolateCoordinates(origin, destination, safeProgress * (index / steps)),
  );
}

function normalizeLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
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
  const discoveryRadiusMultiplier = getDeliveryTravelModifiers(
    delivery.travelModifiers,
  ).discoveryRadiusMultiplier;

  return rewardPoints.flatMap((rewardPoint) => {
    const distanceFromRouteKm = getDistanceFromPointToRouteKm(
      delivery.origin,
      delivery.destination,
      rewardPoint.coordinates,
    );

    if (distanceFromRouteKm > rewardPoint.eligibilityRadiusKm * discoveryRadiusMultiplier) {
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

export function getCrossedRouteRewardIds(
  rewards: RouteRewardDiscovery[],
  previousProgress: number,
  currentProgress: number,
  knownIds: ReadonlySet<string> = new Set(),
): string[] {
  if (
    !Number.isFinite(previousProgress) ||
    !Number.isFinite(currentProgress) ||
    currentProgress <= previousProgress
  ) {
    return [];
  }

  const safePreviousProgress = clampProgress(previousProgress);
  const safeCurrentProgress = clampProgress(currentProgress);

  return rewards
    .filter((reward) =>
      !knownIds.has(reward.id) &&
      reward.routeProgress > safePreviousProgress &&
      reward.routeProgress <= safeCurrentProgress,
    )
    .sort((first, second) => first.routeProgress - second.routeProgress)
    .map((reward) => reward.id);
}

export function getRouteDiscoveryVisualState(
  reward: RouteRewardDiscovery,
  newDiscoveryIds: ReadonlySet<string>,
): RouteDiscoveryVisualState {
  if (newDiscoveryIds.has(reward.id)) return "new";
  return reward.discovered ? "carried" : "future";
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
          coordinates: createInterpolatedRouteCoordinates(
            delivery.origin,
            delivery.destination,
          ).map(toLngLat),
        },
      },
    ],
  };
}

export function createTravelProgressGeoJson(
  delivery: Delivery,
  position: PetMapPosition,
): TravelProgressGeoJson {
  const outboundProgress = position.leg === "preparing"
    ? undefined
    : position.leg === "outbound"
      ? position.legProgress
      : 1;
  const returnProgress = position.leg === "returning"
    ? position.legProgress
    : position.leg === "returned" || position.leg === "completed"
      ? 1
      : undefined;

  return {
    outbound: createProgressFeatureCollection(
      `${delivery.id}-outbound-progress`,
      outboundProgress === undefined
        ? undefined
        : createInterpolatedRouteCoordinates(delivery.origin, delivery.destination, outboundProgress),
    ),
    returning: createProgressFeatureCollection(
      `${delivery.id}-return-progress`,
      returnProgress === undefined
        ? undefined
        : createInterpolatedRouteCoordinates(delivery.destination, delivery.origin, returnProgress),
    ),
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

export function getMapFocusCoordinate(
  target: MapFocusTarget,
  delivery: Delivery,
  mascotPosition: MapCoordinate,
  rewards: RouteRewardDiscovery[],
  traffic: Array<{ coordinates: MapCoordinate; id: string }> = [],
): MapCoordinate | undefined {
  switch (target.kind) {
    case "mascot":
      return mascotPosition;
    case "origin":
      return delivery.origin;
    case "destination":
      return delivery.destination;
    case "reward":
      return rewards.find((reward) => reward.id === target.rewardId)?.coordinates;
    case "traffic":
      return traffic.find((pet) => pet.id === target.trafficId)?.coordinates;
    case "overview":
      return undefined;
  }
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

function createProgressFeatureCollection(
  id: string,
  coordinates?: MapCoordinate[],
): LineStringFeatureCollection {
  return {
    type: "FeatureCollection",
    features: coordinates
      ? [{
          type: "Feature",
          properties: { id },
          geometry: {
            type: "LineString",
            coordinates: coordinates.map(toLngLat),
          },
        }]
      : [],
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
