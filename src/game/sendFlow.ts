import type {
  CorrespondenceContent,
  Coordinates,
  CorrespondenceOption,
  CorrespondenceType,
  FriendProfile,
  Mascot,
  PostcardVariant,
} from "./types";
import type { TranslationKey } from "../i18n";
export const LETTER_MAX_CHARACTERS = 500;
export const POSTCARD_MAX_CHARACTERS = 180;
export const STICKER_MAX_SELECTION = 3;

export type StickerOption = {
  id: string;
  nameKey: TranslationKey;
};

export type PostcardOption = {
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

export const stickerOptions: StickerOption[] = [
  { id: "sticker-sun-stamp", nameKey: "send.content.stickers.sunStamp" },
  { id: "sticker-blue-envelope", nameKey: "send.content.stickers.blueEnvelope" },
  { id: "sticker-route-spark", nameKey: "send.content.stickers.routeSpark" },
];

export const postcardVariants: PostcardOption[] = [
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
      stickerIds: [stickerOptions[0].id],
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
      postcardVariants.some((option) => option.id === content.postcardVariant) &&
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
