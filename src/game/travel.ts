import type { Coordinates, Delivery, DeliveryStatus } from "./types";

export function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

export function haversineDistanceKm(_origin: Coordinates, _destination: Coordinates) {
  return 0;
}

export function estimateTravelDurationHours(_distanceKm: number, _speedKmh: number) {
  return 0;
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

export function getDeliveryStatus(delivery: Delivery): DeliveryStatus {
  return delivery.status;
}

export function formatRemainingTime(_delivery: Delivery, _now: Date = new Date()) {
  return "";
}
