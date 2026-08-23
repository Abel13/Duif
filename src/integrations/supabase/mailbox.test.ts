import { describe, expect, it } from "vitest";

import { mapReceivedCorrespondence, mapReceivedLetterRow, parseReceivedLetterRows, type ReceivedCorrespondenceRow, type ReceivedLetterRow } from "./mailbox";

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
    sender_name: null, sender_profile_id: null, stamp_asset_key: null, postmark_key: null, sticker_ids: [],
  };

  it("preserves the unopened surprise without inventing sender data", () => {
    expect(mapReceivedCorrespondence(surprise)).toMatchObject({
      correspondenceType: "postcard", isOpened: false, senderName: undefined,
      letterText: undefined, returnReplyConfirmed: false,
    });
  });

  it("maps a private return letter after authorized opening", () => {
    expect(mapReceivedCorrespondence({ ...surprise, correspondence_type: "letter", direction: "return", is_opened: true, letter_text: "Voltei com resposta.", sender_name: "Lia", sender_profile_id: "00000000-0000-4000-8000-000000000101" })).toMatchObject({
      direction: "return", isOpened: true, letterText: "Voltei com resposta.", senderName: "Lia",
    });
  });
});
