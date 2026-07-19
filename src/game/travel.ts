import type { Coordinates, Delivery, DeliveryStatus } from "./types";

const EARTH_RADIUS_KM = 6371;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const DEFAULT_GAME_SPEED_MULTIPLIER = 1;

export function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(1, Math.max(0, progress));
}

export function haversineDistanceKm(
  origin: Pick<Coordinates, "latitude" | "longitude">,
  destination: Pick<Coordinates, "latitude" | "longitude">,
) {
  if (origin.latitude === destination.latitude && origin.longitude === destination.longitude) {
    return 0;
  }

  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return roundToTwoDecimals(EARTH_RADIUS_KM * centralAngle);
}

export function estimateTravelDurationHours(
  distanceKm: number,
  speedKmh: number,
  gameSpeedMultiplier = DEFAULT_GAME_SPEED_MULTIPLIER,
) {
  if (
    !Number.isFinite(distanceKm) ||
    !Number.isFinite(speedKmh) ||
    !Number.isFinite(gameSpeedMultiplier) ||
    distanceKm <= 0 ||
    speedKmh <= 0 ||
    gameSpeedMultiplier <= 0
  ) {
    return 0;
  }

  return distanceKm / speedKmh / gameSpeedMultiplier;
}

export function getTravelProgress(delivery: Delivery, now: Date = new Date()) {
  const startTime = Date.parse(delivery.outboundStartAt);
  const endTime = Date.parse(delivery.returnArrivalAt ?? delivery.outboundArrivalAt);
  const currentTime = now.getTime();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return 0;
  }

  return clampProgress((currentTime - startTime) / (endTime - startTime));
}

export function getDeliveryStatus(delivery: Delivery, now: Date = new Date()): DeliveryStatus {
  if (delivery.status === "completed") {
    return "completed";
  }

  const currentTime = now.getTime();
  const outboundStartTime = parseIsoTime(delivery.outboundStartAt);
  const outboundArrivalTime = parseIsoTime(delivery.outboundArrivalAt);
  const returnStartTime = parseOptionalIsoTime(delivery.returnStartAt);
  const returnArrivalTime = parseOptionalIsoTime(delivery.returnArrivalAt);

  if (!Number.isFinite(currentTime) || outboundStartTime === undefined || outboundArrivalTime === undefined) {
    return delivery.status;
  }

  if (currentTime < outboundStartTime) {
    return "preparing";
  }

  if (currentTime < outboundArrivalTime) {
    return "outbound";
  }

  if (returnStartTime === undefined || returnArrivalTime === undefined) {
    return "delivered";
  }

  if (currentTime < returnStartTime) {
    return "delivered";
  }

  if (currentTime < returnArrivalTime) {
    return "returning";
  }

  return "returned";
}

export function formatRemainingTime(delivery: Delivery, now: Date = new Date()) {
  const targetTime = getNextDeliveryTimestamp(delivery, now);

  if (targetTime === undefined) {
    return "0m";
  }

  const remainingMs = targetTime - now.getTime();

  if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
    return "0m";
  }

  const roundedMinutes = Math.ceil(remainingMs / MINUTE_MS);

  if (roundedMinutes < 60) {
    return `${roundedMinutes}m`;
  }

  const days = Math.floor(remainingMs / DAY_MS);
  const hours = Math.floor((remainingMs % DAY_MS) / HOUR_MS);
  const minutes = Math.ceil((remainingMs % HOUR_MS) / MINUTE_MS);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (minutes === 60) {
    return `${hours + 1}h`;
  }

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function getNextDeliveryTimestamp(delivery: Delivery, now: Date) {
  const status = getDeliveryStatus(delivery, now);

  if (status === "completed" || status === "returned") {
    return undefined;
  }

  if (status === "preparing") {
    return parseIsoTime(delivery.outboundStartAt);
  }

  if (status === "outbound") {
    return parseIsoTime(delivery.outboundArrivalAt);
  }

  if (status === "delivered") {
    return parseOptionalIsoTime(delivery.returnStartAt);
  }

  return parseOptionalIsoTime(delivery.returnArrivalAt);
}

function parseIsoTime(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function parseOptionalIsoTime(value: string | undefined) {
  return value ? parseIsoTime(value) : undefined;
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
