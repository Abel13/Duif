export const MIN_REWARD_VISIBILITY_ZOOM = 6;
export const MASCOT_FOCUS_ZOOM = 13;

type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export function getNormalizedRouteBounds(
  origin: RouteCoordinate,
  destination: RouteCoordinate,
): [[number, number], [number, number]] {
  return [
    [
      Math.min(origin.longitude, destination.longitude),
      Math.min(origin.latitude, destination.latitude),
    ],
    [
      Math.max(origin.longitude, destination.longitude),
      Math.max(origin.latitude, destination.latitude),
    ],
  ];
}

export function getRouteFitPadding(width: number, height: number) {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 320;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 568;
  const margin = Math.round(Math.min(safeWidth, safeHeight) * 0.04);

  return Math.min(36, Math.max(18, margin));
}

export function shouldShowMapRewards(zoom: number) {
  return Number.isFinite(zoom) && zoom >= MIN_REWARD_VISIBILITY_ZOOM;
}

export function getMapFocusZoom(
  currentZoom: number,
  targetKind: "mascot" | "origin" | "destination" | "reward",
) {
  if (targetKind === "mascot") {
    return MASCOT_FOCUS_ZOOM;
  }

  return Math.max(currentZoom, targetKind === "reward" ? 6.5 : 4.5);
}
