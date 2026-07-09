import type { FriendMascotPreview, FriendProfile } from "./types";

export const friendMascots: FriendMascotPreview[] = [
  {
    id: "friend-mascot-aurora",
    name: "Aurora",
    speciesKey: "species.mailDuck",
    level: 3,
    appearance: {
      primaryColor: "#fff8e8",
      accentColor: "#7a8f68",
      portraitPlaceholderKey: "appearance.friendAuroraPortrait",
    },
  },
  {
    id: "friend-mascot-brisa",
    name: "Brisa",
    speciesKey: "species.carrierPigeon",
    level: 2,
    appearance: {
      primaryColor: "#f7f1e3",
      accentColor: "#6f91a8",
      portraitPlaceholderKey: "appearance.friendBrisaPortrait",
    },
  },
  {
    id: "friend-mascot-tico",
    name: "Tico",
    speciesKey: "species.carrierPigeon",
    level: 4,
    appearance: {
      primaryColor: "#e8ddc7",
      accentColor: "#8b5e3c",
      portraitPlaceholderKey: "appearance.friendTicoPortrait",
    },
  },
  {
    id: "friend-mascot-atlas",
    name: "Atlas",
    speciesKey: "species.messengerFalcon",
    level: 5,
    appearance: {
      primaryColor: "#8b5e3c",
      accentColor: "#a44a3f",
      portraitPlaceholderKey: "appearance.friendAtlasPortrait",
    },
  },
  {
    id: "friend-mascot-luma",
    name: "Luma",
    speciesKey: "species.mailDuck",
    level: 2,
    appearance: {
      primaryColor: "#fff8e8",
      accentColor: "#c49a4a",
      portraitPlaceholderKey: "appearance.friendLumaPortrait",
    },
  },
];

export const mockFriends: FriendProfile[] = [
  {
    id: "friend-lisbon",
    name: "Lia",
    location: {
      latitude: 38.7223,
      longitude: -9.1393,
      labelKey: "locations.lisbon",
    },
    favoriteNoteKey: "friends.lia.note",
    friendshipLevel: 4,
    exchangeCount: 18,
    mascotIds: ["friend-mascot-aurora", "friend-mascot-brisa"],
    receivedCorrespondence: [
      {
        id: "correspondence-lia-postcard",
        fromName: "Lia",
        type: "postcard",
        titleKey: "friends.correspondence.liaPostcard.title",
        descriptionKey: "friends.correspondence.liaPostcard.description",
        receivedAt: "2026-07-02T09:30:00.000Z",
      },
      {
        id: "correspondence-lia-sticker",
        fromName: "Lia",
        type: "sticker",
        titleKey: "friends.correspondence.liaSticker.title",
        descriptionKey: "friends.correspondence.liaSticker.description",
        receivedAt: "2026-07-04T14:10:00.000Z",
      },
    ],
  },
  {
    id: "friend-curitiba",
    name: "Caio",
    location: {
      latitude: -25.4284,
      longitude: -49.2733,
      labelKey: "locations.curitiba",
    },
    favoriteNoteKey: "friends.caio.note",
    friendshipLevel: 2,
    exchangeCount: 7,
    mascotIds: ["friend-mascot-tico"],
    receivedCorrespondence: [
      {
        id: "correspondence-caio-letter",
        fromName: "Caio",
        type: "letter",
        titleKey: "friends.correspondence.caioLetter.title",
        descriptionKey: "friends.correspondence.caioLetter.description",
        receivedAt: "2026-07-05T12:20:00.000Z",
      },
    ],
  },
  {
    id: "friend-toronto",
    name: "Mina",
    location: {
      latitude: 43.6532,
      longitude: -79.3832,
      labelKey: "locations.toronto",
    },
    favoriteNoteKey: "friends.mina.note",
    friendshipLevel: 5,
    exchangeCount: 24,
    mascotIds: ["friend-mascot-atlas", "friend-mascot-luma"],
    receivedCorrespondence: [
      {
        id: "correspondence-mina-gift",
        fromName: "Mina",
        type: "smallGift",
        titleKey: "friends.correspondence.minaGift.title",
        descriptionKey: "friends.correspondence.minaGift.description",
        receivedAt: "2026-07-06T16:45:00.000Z",
      },
    ],
  },
];

export function getFriendById(friendId: string) {
  return mockFriends.find((friend) => friend.id === friendId);
}

export function getFriendMascots(friendId: string) {
  const friend = getFriendById(friendId);

  if (!friend) {
    return [];
  }

  return friend.mascotIds
    .map((mascotId) => friendMascots.find((mascot) => mascot.id === mascotId))
    .filter((mascot): mascot is FriendMascotPreview => Boolean(mascot));
}

export function getFriendCorrespondence(friendId: string) {
  return getFriendById(friendId)?.receivedCorrespondence ?? [];
}
