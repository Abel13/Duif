import type {
  CorrespondenceOption,
  Delivery,
  Mascot,
  SendFlowSelection,
} from "./types";
import { currentPlayer, starterMascots } from "./mockData";
import { getFriendById } from "./friends";
import { estimateTravelDurationHours, haversineDistanceKm } from "./travel";

const RETURN_PAUSE_MINUTES = 30;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export const correspondenceOptions: CorrespondenceOption[] = [
  {
    id: "correspondence-letter",
    type: "letter",
    nameKey: "correspondence.letter.name",
    descriptionKey: "correspondence.letter.description",
  },
  {
    id: "correspondence-postcard",
    type: "postcard",
    nameKey: "correspondence.postcard.name",
    descriptionKey: "correspondence.postcard.description",
  },
  {
    id: "correspondence-sticker",
    type: "sticker",
    nameKey: "correspondence.sticker.name",
    descriptionKey: "correspondence.sticker.description",
  },
  {
    id: "correspondence-small-gift",
    type: "smallGift",
    nameKey: "correspondence.smallGift.name",
    descriptionKey: "correspondence.smallGift.description",
  },
];

export function getCorrespondenceById(correspondenceId: string) {
  return correspondenceOptions.find((option) => option.id === correspondenceId);
}

export function estimateMascotSpeedKmh(mascot: Mascot) {
  return 28 + mascot.attributes.speed * 4 + mascot.attributes.stamina * 2;
}

export function createMockDeliveryFromSelection(
  selection: SendFlowSelection,
  now: Date = new Date(),
) {
  const friend = selection.friendId ? getFriendById(selection.friendId) : undefined;
  const mascot = selection.mascotId
    ? starterMascots.find((starterMascot) => starterMascot.id === selection.mascotId)
    : undefined;
  const correspondence = selection.correspondenceId
    ? getCorrespondenceById(selection.correspondenceId)
    : undefined;

  if (!friend || !mascot || !correspondence) {
    return undefined;
  }

  const distanceKm = haversineDistanceKm(currentPlayer.homeBase, friend.location);
  const animalSpeedKmh = estimateMascotSpeedKmh(mascot);
  const outboundDurationHours = estimateTravelDurationHours(distanceKm, animalSpeedKmh);
  const outboundStartAt = now;
  const outboundArrivalAt = new Date(now.getTime() + outboundDurationHours * HOUR_MS);
  const returnStartAt = new Date(outboundArrivalAt.getTime() + RETURN_PAUSE_MINUTES * MINUTE_MS);
  const returnArrivalAt = new Date(returnStartAt.getTime() + outboundDurationHours * HOUR_MS);

  const delivery: Delivery = {
    id: `delivery-${mascot.id}-${friend.id}-${correspondence.id}`,
    senderId: currentPlayer.id,
    receiverId: friend.id,
    mascotId: mascot.id,
    origin: currentPlayer.homeBase,
    destination: friend.location,
    distanceKm,
    animalSpeedKmh,
    outboundStartAt: outboundStartAt.toISOString(),
    outboundArrivalAt: outboundArrivalAt.toISOString(),
    returnStartAt: returnStartAt.toISOString(),
    returnArrivalAt: returnArrivalAt.toISOString(),
    status: "outbound",
    rewardSeed: `${mascot.id}-${friend.id}-${correspondence.id}`,
  };

  return {
    delivery,
    friend,
    mascot,
    correspondence,
  };
}
