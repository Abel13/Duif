import {
  correspondenceOptions,
  currentPlayer,
  estimateMascotSpeedKmh,
  deriveMascotTravelModifiers,
  estimateTravelDurationHours,
  haversineDistanceKm,
  mockFriends,
  starterMascots,
  type CorrespondenceOption,
  type CorrespondenceContent,
  type Delivery,
  type FriendProfile,
  type Mascot,
  type SendFlowSelection,
  getFriendCoordinates,
} from "../../game";
import type { TranslationKey } from "../../i18n";
import { getSupabaseClient } from "./client";
import { readString, readTranslationKey } from "./catalogMappers";
import type { Database } from "./database.types";
import { fetchAuthenticatedMascots, mapDeliveryRowToDelivery, type DeliveryRow } from "./authenticatedMascots";

export type CorrespondenceOptionRow = Database["public"]["Tables"]["correspondence_options"]["Row"];
export type DeliveryCorrespondenceContentRow =
  Database["public"]["Tables"]["delivery_correspondence_contents"]["Row"];

export type SanitizedFriendProfileRow = {
  display_name: string;
  exchange_count: number;
  favorite_note_key: string | null;
  friendship_level: number;
  mock_key: string | null;
  postal_base_city: string;
  postal_base_country: string;
  postal_base_state: string;
  profile_id: string;
};

export type AuthenticatedSendFlowData = {
  correspondenceOptions: CorrespondenceOption[];
  friends: FriendProfile[];
  mascots: Mascot[];
};

export type ConfirmedAuthenticatedSend = {
  correspondence: CorrespondenceOption;
  content: CorrespondenceContent;
  delivery: Delivery;
  friend: FriendProfile;
  mascot: Mascot;
};

export const mockSendFlowData: AuthenticatedSendFlowData = {
  correspondenceOptions,
  friends: mockFriends,
  mascots: starterMascots,
};

export function mapCorrespondenceOptionRow(row: CorrespondenceOptionRow): CorrespondenceOption {
  return {
    descriptionKey: readTranslationKey(row.description_key, "correspondence.letter.description"),
    id: readString(row.mock_key, row.id),
    nameKey: readTranslationKey(row.name_key, "correspondence.letter.name"),
    type: row.type,
  };
}

export function mapSanitizedFriendProfileRow(row: SanitizedFriendProfileRow): FriendProfile {
  return {
    exchangeCount: row.exchange_count,
    favoriteNoteKey: row.favorite_note_key
      ? (row.favorite_note_key as TranslationKey)
      : undefined,
    friendshipLevel: row.friendship_level,
    id: readString(row.mock_key, row.profile_id),
    location: {
      city: row.postal_base_city,
      country: row.postal_base_country,
      state: row.postal_base_state,
    },
    mascotIds: [],
    name: row.display_name,
    receivedCorrespondence: [],
  };
}

export function mapCorrespondenceContentRow(
  row: DeliveryCorrespondenceContentRow,
): CorrespondenceContent {
  if (row.correspondence_type === "postcard") {
    return {
      postcardMessage: row.postcard_message ?? "",
      postcardVariant:
        row.postcard_variant === "event" || row.postcard_variant === "photo" ? row.postcard_variant : "city",
      type: "postcard",
    };
  }

  if (row.correspondence_type === "sticker") {
    return {
      stickerIds: row.sticker_ids,
      type: "sticker",
    };
  }

  if (row.correspondence_type === "smallGift") {
    return {
      giftNote: row.gift_note ?? "",
      type: "smallGift",
    };
  }

  return {
    letterText: row.letter_text ?? "",
    type: "letter",
  };
}

export function createCorrespondenceContentPayload(content: CorrespondenceContent) {
  if (content.type === "postcard") {
    return {
      postcardMessage: content.postcardMessage,
      postcardVariant: content.postcardVariant,
      type: content.type,
    };
  }

  if (content.type === "sticker") {
    return {
      stickerIds: content.stickerIds,
      type: content.type,
    };
  }

  if (content.type === "smallGift") {
    return {
      giftNote: content.giftNote,
      type: content.type,
    };
  }

  return {
    letterText: content.letterText,
    type: content.type,
  };
}

export function getDefaultSendFlowSelection({
  correspondenceOptions: availableCorrespondence,
  friends,
  mascots,
  requestedFriendId,
  requestedMascotId,
}: AuthenticatedSendFlowData & {
  requestedFriendId: string | null;
  requestedMascotId: string | null;
}): SendFlowSelection {
  const mascotId = mascots.some((mascot) => mascot.id === requestedMascotId)
    ? requestedMascotId ?? mascots[0]?.id
    : mascots[0]?.id;
  const friendId = friends.some((friend) => friend.id === requestedFriendId)
    ? requestedFriendId ?? friends[0]?.id
    : friends[0]?.id;

  return {
    correspondenceId: availableCorrespondence[0]?.id,
    friendId,
    mascotId,
  };
}

export function createLocalDeliveryPreview({
  friend,
  mascot,
}: {
  friend: FriendProfile;
  mascot: Mascot;
}) {
  const friendCoordinates = getFriendCoordinates(friend);

  if (!friendCoordinates) {
    return {
      distanceKm: 0,
      durationHours: 0,
    };
  }

  const distanceKm = haversineDistanceKm(currentPlayer.homeBase, friendCoordinates);
  const speedKmh = estimateMascotSpeedKmh(mascot);
  const modifiers = deriveMascotTravelModifiers(mascot, { distanceKm });

  return {
    distanceKm,
    durationHours: estimateTravelDurationHours(
      distanceKm,
      speedKmh * modifiers.outboundSpeedMultiplier,
    ),
    modifiers,
    returnDurationHours: estimateTravelDurationHours(
      distanceKm,
      speedKmh * modifiers.returnSpeedMultiplier,
    ),
  };
}

export async function fetchAuthenticatedSendFlowData(
  profileId: string,
): Promise<AuthenticatedSendFlowData | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const [{ data: friends }, { data: options }, mascots] = await Promise.all([
    supabase.rpc("get_accepted_friend_profiles"),
    supabase.from("correspondence_options").select("*").eq("active", true).order("sort_order"),
    fetchAuthenticatedMascots(profileId),
  ]);

  if (!friends || !options || mascots.length === 0) {
    return undefined;
  }

  return {
    correspondenceOptions: options.map(mapCorrespondenceOptionRow),
    friends: (friends as SanitizedFriendProfileRow[]).map(mapSanitizedFriendProfileRow),
    mascots,
  };
}

export async function createAuthenticatedDeliveryFromSelection({
  correspondence,
  content,
  friend,
  mascot,
}: {
  correspondence: CorrespondenceOption;
  content: CorrespondenceContent;
  friend: FriendProfile;
  mascot: Mascot;
}): Promise<Delivery | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase.rpc("create_delivery_from_selection", {
    correspondence_mock_key: correspondence.id,
    content_payload: createCorrespondenceContentPayload(content),
    friend_mock_key: friend.id,
    mascot_mock_key: mascot.id,
  });

  if (error || !data) {
    throw error ?? new Error("Delivery was not created.");
  }

  return mapDeliveryRowToDelivery(data as DeliveryRow, mascot.id);
}
