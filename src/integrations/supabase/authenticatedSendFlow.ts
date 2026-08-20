import {
  type CorrespondenceOption,
  type CorrespondenceContent,
  type Delivery,
  type FriendProfile,
  type Mascot,
  type OwnedPostcard,
  type OwnedSticker,
  type OfficialAssetKey,
  type SendFlowSelection,
  getFriendCoordinates,
  isOfficialAssetKey,
} from "../../game";
import type { TranslationKey } from "../../i18n";
import { getSupabaseClient } from "./client";
import { requireTranslationKey } from "./catalogMappers";
import type { Database } from "./database.types";
import { fetchAuthenticatedMascots, mapDeliveryRowToDelivery, type DeliveryRow } from "./authenticatedMascots";

export type CorrespondenceOptionRow = Database["public"]["Tables"]["correspondence_options"]["Row"];
export type DeliveryCorrespondenceContentRow =
  Database["public"]["Tables"]["delivery_correspondence_contents"]["Row"];

export type SanitizedFriendProfileRow = {
  display_name: string;
  city_latitude: number | null;
  city_longitude: number | null;
  exchange_count: number;
  favorite_note_key: string | null;
  friendship_level: number;
  postal_base_city: string;
  postal_base_country: string;
  postal_base_state: string;
  profile_id: string;
};

export type AuthenticatedSendFlowData = {
  correspondenceOptions: CorrespondenceOption[];
  friends: FriendProfile[];
  mascots: Mascot[];
  postalStamps: { assetKey?: OfficialAssetKey; id: string; nameKey: TranslationKey }[];
  postcards: OwnedPostcard[];
  reputationLevel: number;
  stickers: OwnedSticker[];
};

export type ConfirmedAuthenticatedSend = {
  correspondence: CorrespondenceOption;
  content: CorrespondenceContent;
  delivery: Delivery;
  friend: FriendProfile;
  mascot: Mascot;
};

export function mapCorrespondenceOptionRow(row: CorrespondenceOptionRow): CorrespondenceOption {
  return {
    descriptionKey: requireTranslationKey(row.description_key, "correspondence description key"),
    id: row.catalog_key,
    nameKey: requireTranslationKey(row.name_key, "correspondence name key"),
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
    id: row.profile_id,
    location: {
      city: row.postal_base_city,
      country: row.postal_base_country,
      latitude: row.city_latitude ?? undefined,
      longitude: row.city_longitude ?? undefined,
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
      postcardCatalogKey: row.postcard_catalog_key ?? "",
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
      postcardCatalogKey: content.postcardCatalogKey,
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

export async function fetchAuthenticatedSendFlowData(
  profileId: string,
): Promise<AuthenticatedSendFlowData | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const [friendsResult, optionsResult, stampsResult, postcardsResult, stickersResult, progressionResult, mascots] = await Promise.all([
    supabase.rpc("get_accepted_friend_profiles"),
    supabase.from("correspondence_options").select("*").eq("status", "active").order("sort_order"),
    supabase.from("inventory_items").select("id, name_key, thumbnail_asset_key").eq("owner_profile_id", profileId).eq("category", "stamps"),
    supabase.rpc("list_owned_postcards"),
    supabase.rpc("list_owned_stickers"),
    supabase.from("profile_postal_progression").select("level").eq("profile_id", profileId).maybeSingle(),
    fetchAuthenticatedMascots(profileId),
  ]);

  return {
    correspondenceOptions: (optionsResult.data ?? []).map(mapCorrespondenceOptionRow),
    friends: ((friendsResult.data as SanitizedFriendProfileRow[] | null) ?? []).map(mapSanitizedFriendProfileRow),
    mascots,
    postalStamps: (stampsResult.data ?? []).flatMap((stamp) => stamp.name_key ? [{
      assetKey: isOfficialAssetKey(stamp.thumbnail_asset_key) ? stamp.thumbnail_asset_key : undefined,
      id: stamp.id,
      nameKey: stamp.name_key as TranslationKey,
    }] : []),
    postcards: (postcardsResult.data ?? []).map((postcard) => ({
      artworkAssetKey: postcard.artwork_asset_key as OwnedPostcard["artworkAssetKey"],
      availability: postcard.availability as OwnedPostcard["availability"],
      catalogKey: postcard.catalog_key,
      descriptionKey: postcard.description_key as TranslationKey,
      nameKey: postcard.name_key as TranslationKey,
      quantity: postcard.quantity ?? undefined,
    })),
    reputationLevel: progressionResult.data?.level ?? 1,
    stickers: (stickersResult.data ?? []).map((sticker) => ({
      artworkAssetKey: sticker.artwork_asset_key as OwnedSticker["artworkAssetKey"],
      catalogKey: sticker.catalog_key,
      descriptionKey: sticker.description_key as TranslationKey,
      nameKey: sticker.name_key as TranslationKey,
      quantity: sticker.quantity,
    })),
  };
}

export async function createAuthenticatedDeliveryFromSelection({
  correspondence,
  content,
  friend,
  mascot,
  postmark,
  stampInventoryItemId,
}: {
  correspondence: CorrespondenceOption;
  content: CorrespondenceContent;
  friend: FriendProfile;
  mascot: Mascot;
  postmark: import("../../game").PostmarkCustomization;
  stampInventoryItemId?: string;
}): Promise<Delivery | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase.rpc("create_delivery_from_selection", {
    correspondence_catalog_key: correspondence.id,
    content_payload: { ...createCorrespondenceContentPayload(content), postalFinishing: { stampInventoryItemId: stampInventoryItemId ?? null, postmarkKey: "postalMark.custom", postmarkModel: postmark.model, postmarkColor: postmark.color } },
    friend_profile_id: friend.id,
    mascot_id: mascot.id,
  });

  if (error || !data) {
    throw error ?? new Error("Delivery was not created.");
  }

  return mapDeliveryRowToDelivery(data as DeliveryRow, mascot.id);
}
