import { describe, expect, it } from "vitest";

import {
  createDefaultCorrespondenceContent,
  createMockDeliveryFromSelection,
  estimateMascotSpeedKmh,
  isCorrespondenceContentValid,
  LETTER_MAX_CHARACTERS,
  POSTCARD_MAX_CHARACTERS,
  STICKER_MAX_SELECTION,
} from "./sendFlow";
import { starterMascots } from "./mockData";

describe("estimateMascotSpeedKmh", () => {
  it("derives a stable travel speed from mascot attributes", () => {
    const nuvem = starterMascots.find((mascot) => mascot.id === "mascot-nuvem");

    expect(nuvem).toBeDefined();
    expect(estimateMascotSpeedKmh(nuvem!)).toBe(72);
  });
});

describe("createMockDeliveryFromSelection", () => {
  it("creates a delivery from a complete send flow selection", () => {
    const result = createMockDeliveryFromSelection(
      {
        friendId: "friend-curitiba",
        mascotId: "mascot-pipoca",
        correspondenceId: "correspondence-postcard",
      },
      {
        postcardMessage: "Chegando devagar pelo correio.",
        postcardVariant: "city",
        type: "postcard",
      },
      new Date("2026-07-08T12:00:00.000Z"),
    );

    expect(result).toBeDefined();
    expect(result?.delivery.status).toBe("outbound");
    expect(result?.delivery.senderId).toBe("player-current");
    expect(result?.delivery.receiverId).toBe("friend-curitiba");
    expect(result?.delivery.mascotId).toBe("mascot-pipoca");
    expect(result?.delivery.distanceKm).toBeGreaterThan(300);
    expect(result?.delivery.outboundStartAt).toBe("2026-07-08T12:00:00.000Z");
    expect(result?.delivery.rewardSeed).toBe(
      "mascot-pipoca-friend-curitiba-correspondence-postcard",
    );
  });

  it("returns undefined when the selection is incomplete", () => {
    expect(
      createMockDeliveryFromSelection({
        friendId: "friend-curitiba",
        mascotId: "mascot-pipoca",
      }, createDefaultCorrespondenceContent("letter")),
    ).toBeUndefined();
  });
});

describe("correspondence content validation", () => {
  it("validates letter character limits", () => {
    expect(isCorrespondenceContentValid({ letterText: "Oi!", type: "letter" })).toBe(true);
    expect(isCorrespondenceContentValid({ letterText: "", type: "letter" })).toBe(false);
    expect(
      isCorrespondenceContentValid({
        letterText: "a".repeat(LETTER_MAX_CHARACTERS + 1),
        type: "letter",
      }),
    ).toBe(false);
  });

  it("validates postcard character limits", () => {
    expect(
      isCorrespondenceContentValid({
        postcardMessage: "Um verso pequeno.",
        postcardVariant: "city",
        type: "postcard",
      }),
    ).toBe(true);
    expect(
      isCorrespondenceContentValid({
        postcardMessage: "a".repeat(POSTCARD_MAX_CHARACTERS + 1),
        postcardVariant: "event",
        type: "postcard",
      }),
    ).toBe(false);
  });

  it("validates sticker selection limits", () => {
    expect(isCorrespondenceContentValid({ stickerIds: ["sticker-sun-stamp"], type: "sticker" })).toBe(
      true,
    );
    expect(isCorrespondenceContentValid({ stickerIds: [], type: "sticker" })).toBe(false);
    expect(
      isCorrespondenceContentValid({
        stickerIds: Array.from({ length: STICKER_MAX_SELECTION + 1 }, (_, index) => `s-${index}`),
        type: "sticker",
      }),
    ).toBe(false);
  });
});
