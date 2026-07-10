import type {
  CorrespondenceContent,
  Coordinates,
  CorrespondenceOption,
  CorrespondenceType,
  Delivery,
  FriendProfile,
  Mascot,
  PostcardVariant,
  SendFlowSelection,
} from "./types";
import type { TranslationKey } from "../i18n";
import { currentPlayer, starterMascots } from "./mockData";
import { getFriendById } from "./friends";
import { estimateTravelDurationHours, haversineDistanceKm } from "./travel";

const RETURN_PAUSE_MINUTES = 30;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
export const LETTER_MAX_CHARACTERS = 500;
export const POSTCARD_MAX_CHARACTERS = 180;
export const STICKER_MAX_SELECTION = 3;

export type MockStickerOption = {
  id: string;
  nameKey: TranslationKey;
};

export type MockPostcardOption = {
  id: PostcardVariant;
  nameKey: TranslationKey;
};

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

export const mockStickerOptions: MockStickerOption[] = [
  { id: "sticker-sun-stamp", nameKey: "send.content.stickers.sunStamp" },
  { id: "sticker-blue-envelope", nameKey: "send.content.stickers.blueEnvelope" },
  { id: "sticker-route-spark", nameKey: "send.content.stickers.routeSpark" },
];

export const mockPostcardOptions: MockPostcardOption[] = [
  { id: "city", nameKey: "send.content.postcardVariants.city" },
  { id: "event", nameKey: "send.content.postcardVariants.event" },
  { id: "photo", nameKey: "send.content.postcardVariants.photo" },
];

export function getCorrespondenceById(correspondenceId: string) {
  return correspondenceOptions.find((option) => option.id === correspondenceId);
}

export function estimateMascotSpeedKmh(mascot: Mascot) {
  return 28 + mascot.attributes.speed * 4 + mascot.attributes.stamina * 2;
}

export function createMockDeliveryFromSelection(
  selection: SendFlowSelection,
  content: CorrespondenceContent,
  now: Date = new Date(),
) {
  const friend = selection.friendId ? getFriendById(selection.friendId) : undefined;
  const mascot = selection.mascotId
    ? starterMascots.find((starterMascot) => starterMascot.id === selection.mascotId)
    : undefined;
  const correspondence = selection.correspondenceId
    ? getCorrespondenceById(selection.correspondenceId)
    : undefined;

  const friendCoordinates = getFriendCoordinates(friend);

  if (
    !friend ||
    !mascot ||
    !correspondence ||
    !friendCoordinates ||
    !isCorrespondenceContentValid(content)
  ) {
    return undefined;
  }

  const distanceKm = haversineDistanceKm(currentPlayer.homeBase, friendCoordinates);
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
    destination: friendCoordinates,
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
    content,
  };
}

export function getFriendCoordinates(friend: FriendProfile | undefined): Coordinates | undefined {
  if (
    !friend ||
    typeof friend.location.latitude !== "number" ||
    typeof friend.location.longitude !== "number"
  ) {
    return undefined;
  }

  return {
    labelKey: friend.location.labelKey ?? "locations.saoPaulo",
    latitude: friend.location.latitude,
    longitude: friend.location.longitude,
  };
}

export function createDefaultCorrespondenceContent(
  correspondenceType: CorrespondenceType,
): CorrespondenceContent {
  if (correspondenceType === "postcard") {
    return {
      postcardMessage: "",
      postcardVariant: "city",
      type: "postcard",
    };
  }

  if (correspondenceType === "sticker") {
    return {
      stickerIds: [mockStickerOptions[0].id],
      type: "sticker",
    };
  }

  if (correspondenceType === "smallGift") {
    return {
      giftNote: "",
      type: "smallGift",
    };
  }

  return {
    letterText: "",
    type: "letter",
  };
}

export function isCorrespondenceContentValid(content: CorrespondenceContent) {
  if (content.type === "letter") {
    const trimmedLetter = content.letterText.trim();
    return trimmedLetter.length > 0 && trimmedLetter.length <= LETTER_MAX_CHARACTERS;
  }

  if (content.type === "postcard") {
    return (
      mockPostcardOptions.some((option) => option.id === content.postcardVariant) &&
      content.postcardMessage.length <= POSTCARD_MAX_CHARACTERS
    );
  }

  if (content.type === "sticker") {
    return content.stickerIds.length > 0 && content.stickerIds.length <= STICKER_MAX_SELECTION;
  }

  return content.giftNote.length <= POSTCARD_MAX_CHARACTERS;
}

export function getCorrespondenceContentCount(content: CorrespondenceContent) {
  if (content.type === "letter") {
    return content.letterText.length;
  }

  if (content.type === "postcard") {
    return content.postcardMessage.length;
  }

  if (content.type === "smallGift") {
    return content.giftNote.length;
  }

  return content.stickerIds.length;
}
