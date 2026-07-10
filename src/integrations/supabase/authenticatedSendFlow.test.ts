import { describe, expect, it } from "vitest";

import type {
  CorrespondenceOptionRow,
  FriendshipRow,
  ProfileRow,
} from "./authenticatedSendFlow";
import {
  composeAuthenticatedFriends,
  createLocalDeliveryPreview,
  getDefaultSendFlowSelection,
  mapCorrespondenceOptionRow,
} from "./authenticatedSendFlow";
import { starterMascots } from "../../game/mockData";

const currentProfileId = "00000000-0000-4000-8000-000000000001";
const friendProfileId = "00000000-0000-4000-8000-000000000101";

const friendshipRow: FriendshipRow = {
  addressee_profile_id: friendProfileId,
  created_at: "2026-07-10T13:00:00.000Z",
  exchange_count: 18,
  favorite_note_key: "friends.lia.note",
  friendship_level: 4,
  id: "00000000-0000-4000-8000-000000000301",
  mock_key: "friendship-lia",
  requester_profile_id: currentProfileId,
  status: "accepted",
  updated_at: "2026-07-10T13:00:00.000Z",
};

const friendProfileRow: ProfileRow = {
  auth_user_id: null,
  created_at: "2026-07-10T13:00:00.000Z",
  display_name: "Lia",
  home_label_key: "locations.lisbon",
  home_latitude: 38.7223,
  home_longitude: -9.1393,
  id: friendProfileId,
  mock_key: "friend-lisbon",
  updated_at: "2026-07-10T13:00:00.000Z",
};

const correspondenceOptionRow: CorrespondenceOptionRow = {
  active: true,
  description_key: "correspondence.postcard.description",
  id: "00000000-0000-4000-8000-000000000402",
  mock_key: "correspondence-postcard",
  name_key: "correspondence.postcard.name",
  sort_order: 2,
  type: "postcard",
};

describe("authenticated send flow mappers", () => {
  it("maps correspondence option rows to app options", () => {
    expect(mapCorrespondenceOptionRow(correspondenceOptionRow)).toEqual({
      descriptionKey: "correspondence.postcard.description",
      id: "correspondence-postcard",
      nameKey: "correspondence.postcard.name",
      type: "postcard",
    });
  });

  it("composes accepted friendship rows with readable profiles", () => {
    const friends = composeAuthenticatedFriends({
      currentProfileId,
      friendships: [friendshipRow],
      profiles: [friendProfileRow],
    });

    expect(friends).toHaveLength(1);
    expect(friends[0]).toMatchObject({
      exchangeCount: 18,
      favoriteNoteKey: "friends.lia.note",
      friendshipLevel: 4,
      id: "friend-lisbon",
      name: "Lia",
      location: {
        labelKey: "locations.lisbon",
      },
    });
  });

  it("ignores friendships without a matching profile", () => {
    expect(
      composeAuthenticatedFriends({
        currentProfileId,
        friendships: [friendshipRow],
        profiles: [],
      }),
    ).toEqual([]);
  });

  it("uses requested ids when they exist in available send flow data", () => {
    const selection = getDefaultSendFlowSelection({
      correspondenceOptions: [mapCorrespondenceOptionRow(correspondenceOptionRow)],
      friends: [
        {
          exchangeCount: 18,
          friendshipLevel: 4,
          id: "friend-lisbon",
          location: {
            labelKey: "locations.lisbon",
            latitude: 38.7223,
            longitude: -9.1393,
          },
          mascotIds: [],
          name: "Lia",
          receivedCorrespondence: [],
        },
      ],
      mascots: starterMascots,
      requestedFriendId: "friend-lisbon",
      requestedMascotId: "mascot-pipoca",
    });

    expect(selection).toEqual({
      correspondenceId: "correspondence-postcard",
      friendId: "friend-lisbon",
      mascotId: "mascot-pipoca",
    });
  });

  it("creates a local route estimate for preview", () => {
    const estimate = createLocalDeliveryPreview({
      friend: {
        exchangeCount: 18,
        friendshipLevel: 4,
        id: "friend-lisbon",
        location: {
          labelKey: "locations.lisbon",
          latitude: 38.7223,
          longitude: -9.1393,
        },
        mascotIds: [],
        name: "Lia",
        receivedCorrespondence: [],
      },
      mascot: starterMascots[0],
    });

    expect(estimate.distanceKm).toBeGreaterThan(7900);
    expect(estimate.durationHours).toBeGreaterThan(100);
  });
});
