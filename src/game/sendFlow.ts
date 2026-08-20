import type {
  CorrespondenceContent,
  Coordinates,
  CorrespondenceOption,
  CorrespondenceType,
  FriendProfile,
  Mascot,
  OwnedPostcard,
  OwnedSticker,
} from "./types";
import type { TranslationKey } from "../i18n";
export const LETTER_MAX_CHARACTERS = 500;
export const POSTCARD_MAX_CHARACTERS = 180;
export const STICKER_MAX_SELECTION = 3;

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
  postcards: OwnedPostcard[] = [],
  stickers: OwnedSticker[] = [],
): CorrespondenceContent {
  if (correspondenceType === "postcard") {
    return {
      postcardMessage: "",
      postcardCatalogKey: postcards[0]?.catalogKey ?? "",
      type: "postcard",
    };
  }

  if (correspondenceType === "sticker") {
    return {
      stickerIds: stickers[0]?.quantity ? [stickers[0].catalogKey] : [],
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
      content.postcardCatalogKey.length > 0 &&
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
