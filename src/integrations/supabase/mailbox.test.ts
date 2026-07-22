import { describe, expect, it } from "vitest";

import { mapReceivedLetterRow, parseReceivedLetterRows, type ReceivedLetterRow } from "./mailbox";

const receivedLetter: ReceivedLetterRow = {
  arrived_at: "2026-07-21T15:30:00.000Z",
  delivery_id: "00000000-0000-4000-8000-000000000501",
  letter_text: "Uma carta que chegou ao destino.",
  origin_label: "Londrina, Paraná • BR",
  sender_name: "Lia",
  sender_profile_id: "00000000-0000-4000-8000-000000000101",
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
    });
  });

  it("discards incomplete rows instead of substituting another player's content", () => {
    expect(parseReceivedLetterRows([receivedLetter, { ...receivedLetter, letter_text: null }])).toEqual([
      mapReceivedLetterRow(receivedLetter),
    ]);
  });
});
