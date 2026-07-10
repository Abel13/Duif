import {
  correspondenceOptions,
  currentPlayer,
  estimateMascotSpeedKmh,
  estimateTravelDurationHours,
  haversineDistanceKm,
  mockFriends,
  starterMascots,
  type CorrespondenceOption,
  type Delivery,
  type FriendProfile,
  type Mascot,
  type SendFlowSelection,
} from "../../game";
import type { TranslationKey } from "../../i18n";
import { getSupabaseClient } from "./client";
import { readString, readTranslationKey } from "./catalogMappers";
import type { Database } from "./database.types";
import { fetchAuthenticatedMascots, mapDeliveryRowToDelivery, type DeliveryRow } from "./authenticatedMascots";

export type FriendshipRow = Database["public"]["Tables"]["friendships"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CorrespondenceOptionRow = Database["public"]["Tables"]["correspondence_options"]["Row"];

export type AuthenticatedSendFlowData = {
  correspondenceOptions: CorrespondenceOption[];
  friends: FriendProfile[];
  mascots: Mascot[];
};

export type ConfirmedAuthenticatedSend = {
  correspondence: CorrespondenceOption;
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

export function mapFriendProfileRow({
  friendship,
  profile,
}: {
  friendship: FriendshipRow;
  profile: ProfileRow;
}): FriendProfile {
  return {
    exchangeCount: friendship.exchange_count,
    favoriteNoteKey: friendship.favorite_note_key
      ? (friendship.favorite_note_key as TranslationKey)
      : undefined,
    friendshipLevel: friendship.friendship_level,
    id: readString(profile.mock_key, profile.id),
    location: {
      labelKey: profile.home_label_key as TranslationKey,
      latitude: profile.home_latitude,
      longitude: profile.home_longitude,
    },
    mascotIds: [],
    name: profile.display_name,
    receivedCorrespondence: [],
  };
}

export function composeAuthenticatedFriends({
  currentProfileId,
  friendships,
  profiles,
}: {
  currentProfileId: string;
  friendships: FriendshipRow[];
  profiles: ProfileRow[];
}) {
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  return friendships
    .filter((friendship) => friendship.status === "accepted")
    .map((friendship) => {
      const friendProfileId =
        friendship.requester_profile_id === currentProfileId
          ? friendship.addressee_profile_id
          : friendship.requester_profile_id;
      const profile = profilesById.get(friendProfileId);

      return profile ? mapFriendProfileRow({ friendship, profile }) : undefined;
    })
    .filter((friend): friend is FriendProfile => Boolean(friend));
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
  const distanceKm = haversineDistanceKm(currentPlayer.homeBase, friend.location);
  const speedKmh = estimateMascotSpeedKmh(mascot);

  return {
    distanceKm,
    durationHours: estimateTravelDurationHours(distanceKm, speedKmh),
  };
}

export async function fetchAuthenticatedSendFlowData(
  profileId: string,
): Promise<AuthenticatedSendFlowData | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const [{ data: friendships }, { data: options }, mascots] = await Promise.all([
    supabase.from("friendships").select("*").eq("status", "accepted"),
    supabase.from("correspondence_options").select("*").eq("active", true).order("sort_order"),
    fetchAuthenticatedMascots(profileId),
  ]);

  if (!friendships || !options || mascots.length === 0) {
    return undefined;
  }

  const friendProfileIds = friendships.map((friendship) =>
    friendship.requester_profile_id === profileId
      ? friendship.addressee_profile_id
      : friendship.requester_profile_id,
  );

  const { data: profiles } = await supabase.from("profiles").select("*").in("id", friendProfileIds);

  if (!profiles || profiles.length === 0) {
    return undefined;
  }

  return {
    correspondenceOptions: options.map(mapCorrespondenceOptionRow),
    friends: composeAuthenticatedFriends({
      currentProfileId: profileId,
      friendships,
      profiles,
    }),
    mascots,
  };
}

export async function createAuthenticatedDeliveryFromSelection({
  correspondence,
  friend,
  mascot,
}: {
  correspondence: CorrespondenceOption;
  friend: FriendProfile;
  mascot: Mascot;
}): Promise<Delivery | undefined> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase.rpc("create_delivery_from_selection", {
    correspondence_mock_key: correspondence.id,
    friend_mock_key: friend.id,
    mascot_mock_key: mascot.id,
  });

  if (error || !data) {
    throw error ?? new Error("Delivery was not created.");
  }

  return mapDeliveryRowToDelivery(data as DeliveryRow, mascot.id);
}
