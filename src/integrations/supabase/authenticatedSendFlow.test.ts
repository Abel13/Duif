import { describe, expect, it } from "vitest";

import type {
  CorrespondenceOptionRow,
  DeliveryCorrespondenceContentRow,
  SanitizedFriendProfileRow,
} from "./authenticatedSendFlow";
import {
  createCorrespondenceContentPayload,
  getAvailableSendMascots,
  getDefaultSendFlowSelection,
  mapCorrespondenceContentRow,
  mapCorrespondenceOptionRow,
  mapSanitizedFriendProfileRow,
} from "./authenticatedSendFlow";
import { starterMascots } from "../../game/mockData";

const friendProfileId = "00000000-0000-4000-8000-000000000101";

const sanitizedFriendRow: SanitizedFriendProfileRow = {
  city_latitude: 38.7223,
  city_longitude: -9.1393,
  display_name: "Lia",
  exchange_count: 18,
  favorite_note_key: "friends.lia.note",
  friendship_level: 4,
  postal_base_city: "Lisboa",
  postal_base_country: "Portugal",
  postal_base_state: "Lisboa",
  profile_id: friendProfileId,
};

const correspondenceOptionRow: CorrespondenceOptionRow = {
  catalog_key: "correspondence-postcard",
  description_key: "correspondence.postcard.description",
  id: "00000000-0000-4000-8000-000000000402",
  name_key: "correspondence.postcard.name",
  sort_order: 2,
  status: "active",
  type: "postcard",
};

const letterContentRow: DeliveryCorrespondenceContentRow = {
  correspondence_type: "letter",
  created_at: "2026-07-10T13:00:00.000Z",
  delivery_id: "00000000-0000-4000-8000-000000000501",
  gift_note: null,
  id: "00000000-0000-4000-8000-000000000901",
  letter_text: "Oi, Lia!",
  metadata: { prototype: true },
  postcard_message: null,
  postcard_catalog_key: null,
  postcard_variant: null,
  sticker_ids: [],
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

  it("maps the public city centroid without private postal-base fields", () => {
    const friend = mapSanitizedFriendProfileRow(sanitizedFriendRow);

    expect(friend).toMatchObject({
      exchangeCount: 18,
      favoriteNoteKey: "friends.lia.note",
      friendshipLevel: 4,
      id: friendProfileId,
      name: "Lia",
      location: {
        city: "Lisboa",
        country: "Portugal",
        latitude: 38.7223,
        longitude: -9.1393,
        state: "Lisboa",
      },
    });
    expect(friend.location).not.toHaveProperty("street");
    expect(friend.location).not.toHaveProperty("neighborhood");
  });

  it("maps persisted correspondence content rows", () => {
    expect(mapCorrespondenceContentRow(letterContentRow)).toEqual({
      letterText: "Oi, Lia!",
      type: "letter",
    });
  });

  it("creates RPC-safe correspondence content payloads", () => {
    expect(
      createCorrespondenceContentPayload({
        postcardMessage: "Saudades do caminho.",
        postcardCatalogKey: "postcard-duif-base",
        type: "postcard",
      }),
    ).toEqual({
      postcardMessage: "Saudades do caminho.",
      postcardCatalogKey: "postcard-duif-base",
      type: "postcard",
    });
  });

  it("uses requested ids when they exist in available send flow data", () => {
    const selection = getDefaultSendFlowSelection({
      correspondenceOptions: [mapCorrespondenceOptionRow(correspondenceOptionRow)],
      postalStamps: [],
      postcards: [],
      reputationLevel: 1,
      stickers: [],
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
      mascots: starterMascots.map((mascot) => ({ ...mascot, currentDelivery: undefined })),
      requestedFriendId: "friend-lisbon",
      requestedMascotId: "mascot-pipoca",
    });

    expect(selection).toEqual({
      correspondenceId: "correspondence-postcard",
      friendId: "friend-lisbon",
      mascotId: "mascot-pipoca",
    });
  });

  it("hides busy mascots and ignores a requested busy mascot", () => {
    const [busy, free] = starterMascots;
    const available = getAvailableSendMascots([
      busy,
      { ...free, currentDelivery: undefined },
    ]);

    expect(available.map((mascot) => mascot.id)).toEqual([free.id]);

    const selection = getDefaultSendFlowSelection({
      correspondenceOptions: [mapCorrespondenceOptionRow(correspondenceOptionRow)],
      friends: [],
      mascots: [busy, { ...free, currentDelivery: undefined }],
      postalStamps: [],
      postcards: [],
      reputationLevel: 1,
      requestedFriendId: null,
      requestedMascotId: busy.id,
      stickers: [],
    });

    expect(selection.mascotId).toBe(free.id);
  });

});
