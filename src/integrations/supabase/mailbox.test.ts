import { describe, expect, it } from "vitest";

import { getPostalVisitorMinutes, mapActivePostalVisitor, mapReceivedCorrespondence, mapReceivedLetterRow, parseReceivedLetterRows, type ReceivedCorrespondenceRow, type ReceivedLetterRow } from "./mailbox";

const receivedLetter: ReceivedLetterRow = {
  arrived_at: "2026-07-21T15:30:00.000Z",
  delivery_id: "00000000-0000-4000-8000-000000000501",
  letter_text: "Uma carta que chegou ao destino.",
  origin_label: "Londrina, Paraná • BR",
  sender_name: "Lia",
  sender_profile_id: "00000000-0000-4000-8000-000000000101",
  stamp_kind: "default",
  stamp_name_key: null,
  postmark_key: "postalMark.postalCancel",
};

describe("received letters", () => {
  it("maps only the public receipt data required by the mailbox", () => {
    expect(mapReceivedLetterRow(receivedLetter)).toEqual({
      arrivedAt: receivedLetter.arrived_at,
      deliveryId: receivedLetter.delivery_id,
      letterText: receivedLetter.letter_text,
      originLabel: receivedLetter.origin_label,
      senderName: receivedLetter.sender_name,
      senderProfileId: receivedLetter.sender_profile_id,
      stampKind: "default",
      stampNameKey: undefined,
      postmarkKey: "postalMark.postalCancel",
    });
  });

  it("discards incomplete rows instead of substituting another player's content", () => {
    expect(parseReceivedLetterRows([receivedLetter, { ...receivedLetter, letter_text: null }])).toEqual([
      mapReceivedLetterRow(receivedLetter),
    ]);
  });
});

describe("generic received correspondence", () => {
  const surprise: ReceivedCorrespondenceRow = {
    arrived_at: "2026-08-20T12:00:00.000Z", correspondence_type: "postcard",
    delivery_id: "00000000-0000-4000-8000-000000000601", direction: "outbound",
    is_opened: false, letter_text: null, origin_label: null, postcard_asset_key: null,
    postcard_catalog_key: null, postcard_message: null, postcard_name_key: null,
    return_reply_confirmed: false, return_reply_deadline: "2026-08-20T13:00:00.000Z",
    sender_name: null, sender_profile_id: null, stamp_asset_key: "stamp.default.front", postmark_key: "postalMark.custom", postmark_model: "route", postmark_color: "blue", postmark_city: "Londrina", postmark_country: "BR", postmark_date: "2026-08-20", sticker_ids: [], sticker_asset_keys: [],
  };

  it("preserves the unopened surprise without inventing sender data", () => {
    expect(mapReceivedCorrespondence(surprise)).toMatchObject({
      correspondenceType: "postcard", isOpened: false, senderName: undefined,
      letterText: undefined, returnReplyConfirmed: false, stampAssetKey: "stamp.default.front",
      postmark: { city: "Londrina", country: "BR", date: "2026-08-20", model: "route", color: "blue" },
    });
  });

  it("maps a private return letter after authorized opening", () => {
    expect(mapReceivedCorrespondence({ ...surprise, correspondence_type: "letter", direction: "return", is_opened: true, letter_text: "Voltei com resposta.", sender_name: "Lia", sender_profile_id: "00000000-0000-4000-8000-000000000101" })).toMatchObject({
      direction: "return", isOpened: true, letterText: "Voltei com resposta.", senderName: "Lia",
    });
  });
});

describe("active postal visitors", () => {
  it("maps only the public visitor snapshot and accepts an official portrait", () => {
    expect(mapActivePostalVisitor({ delivery_id:"delivery-1",departs_at:"2026-08-24T12:24:01.000Z",mascot_id:"mascot-1",mascot_name:"Nuvem",portrait_asset_key:"mascot.portrait.nuvem" })).toEqual({
      deliveryId:"delivery-1",departsAt:"2026-08-24T12:24:01.000Z",mascotId:"mascot-1",mascotName:"Nuvem",portraitAssetKey:"mascot.portrait.nuvem",
    });
  });

  it("rounds remaining time up and never returns negative minutes", () => {
    const now=new Date("2026-08-24T12:00:00.000Z").getTime();
    expect(getPostalVisitorMinutes("2026-08-24T12:00:01.000Z",now)).toBe(1);
    expect(getPostalVisitorMinutes("2026-08-24T12:24:01.000Z",now)).toBe(25);
    expect(getPostalVisitorMinutes("2026-08-24T11:59:00.000Z",now)).toBe(0);
  });
});
