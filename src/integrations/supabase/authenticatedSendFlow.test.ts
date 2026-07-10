import { describe, expect, it } from "vitest";

import type {
  CorrespondenceOptionRow,
  SanitizedFriendProfileRow,
} from "./authenticatedSendFlow";
import {
  createLocalDeliveryPreview,
  getDefaultSendFlowSelection,
  mapCorrespondenceOptionRow,
  mapSanitizedFriendProfileRow,
} from "./authenticatedSendFlow";
import { starterMascots } from "../../game/mockData";

const friendProfileId = "00000000-0000-4000-8000-000000000101";

const sanitizedFriendRow: SanitizedFriendProfileRow = {
  display_name: "Lia",
  exchange_count: 18,
  favorite_note_key: "friends.lia.note",
  friendship_level: 4,
  mock_key: "friend-lisbon",
  postal_base_city: "Lisboa",
  postal_base_country: "Portugal",
  postal_base_state: "Lisboa",
  profile_id: friendProfileId,
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

  it("maps sanitized friend rows without private postal-base fields", () => {
    const friend = mapSanitizedFriendProfileRow(sanitizedFriendRow);

    expect(friend).toMatchObject({
      exchangeCount: 18,
      favoriteNoteKey: "friends.lia.note",
      friendshipLevel: 4,
      id: "friend-lisbon",
      name: "Lia",
      location: {
        city: "Lisboa",
        country: "Portugal",
        state: "Lisboa",
      },
    });
    expect(friend.location).not.toHaveProperty("latitude");
    expect(friend.location).not.toHaveProperty("longitude");
    expect(friend.location).not.toHaveProperty("street");
    expect(friend.location).not.toHaveProperty("neighborhood");
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
            city: "Lisboa",
            country: "Portugal",
            labelKey: "locations.lisbon",
            latitude: 38.7223,
            longitude: -9.1393,
            state: "Lisboa",
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
          city: "Lisboa",
          country: "Portugal",
          labelKey: "locations.lisbon",
          latitude: 38.7223,
          longitude: -9.1393,
          state: "Lisboa",
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

  it("returns an empty preview estimate when sanitized friends omit coordinates", () => {
    const estimate = createLocalDeliveryPreview({
      friend: mapSanitizedFriendProfileRow(sanitizedFriendRow),
      mascot: starterMascots[0],
    });

    expect(estimate).toEqual({
      distanceKm: 0,
      durationHours: 0,
    });
  });
});
