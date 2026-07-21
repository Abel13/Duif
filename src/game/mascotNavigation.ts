import type { Mascot } from "./types";

export const nestMascotStorageKey = "duif.nest.selected-mascot.v1";

export function resolveNestMascotId(
  mascots: readonly Mascot[],
  requestedMascotId?: string,
  storedMascotId?: string,
) {
  const availableIds = new Set(mascots.map((mascot) => mascot.id));

  if (requestedMascotId && availableIds.has(requestedMascotId)) return requestedMascotId;
  if (storedMascotId && availableIds.has(storedMascotId)) return storedMascotId;
  return mascots[0]?.id;
}

export function readStoredNestMascotId(storage?: Pick<Storage, "getItem">) {
  const value = storage?.getItem(nestMascotStorageKey)?.trim();
  return value || undefined;
}

export function writeStoredNestMascotId(
  mascotId: string | undefined,
  storage?: Pick<Storage, "removeItem" | "setItem">,
) {
  if (!storage) return;
  if (mascotId) storage.setItem(nestMascotStorageKey, mascotId);
  else storage.removeItem(nestMascotStorageKey);
}

export function getNestMascotNeighbors(mascots: readonly Mascot[], mascotId: string | undefined) {
  const index = mascots.findIndex((mascot) => mascot.id === mascotId);
  return {
    next: index >= 0 && index < mascots.length - 1 ? mascots[index + 1] : undefined,
    previous: index > 0 ? mascots[index - 1] : undefined,
  };
}
