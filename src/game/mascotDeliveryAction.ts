import { getDeliveryStatus } from "./travel";
import type { Delivery, DeliveryStatus, Mascot } from "./types";

export type MascotDeliveryAction = "send" | "viewTrip" | "collect";

const activeTravelStatuses = new Set<DeliveryStatus>([
  "preparing",
  "outbound",
  "delivered",
  "returning",
]);

export function resolveMascotDeliveryAction(
  delivery: Delivery | undefined,
  now: Date = new Date(),
): MascotDeliveryAction {
  if (!delivery) return "send";

  const status = getDeliveryStatus(delivery, now);
  if (status === "returned") return "collect";
  return activeTravelStatuses.has(status) ? "viewTrip" : "send";
}

export function hasActiveMascotDelivery(
  mascot: Pick<Mascot, "currentDelivery">,
  now: Date = new Date(),
) {
  return resolveMascotDeliveryAction(mascot.currentDelivery, now) === "viewTrip";
}

export function resolveRequestedTravelMascotId(
  mascots: readonly Mascot[],
  requestedMascotId: string | null | undefined,
  now: Date = new Date(),
) {
  if (!requestedMascotId) return undefined;
  const mascot = mascots.find((candidate) => candidate.id === requestedMascotId);
  return mascot && hasActiveMascotDelivery(mascot, now) ? mascot.id : undefined;
}
