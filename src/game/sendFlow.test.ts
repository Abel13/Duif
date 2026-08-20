import { describe, expect, it } from "vitest";

import {
  createDefaultCorrespondenceContent,
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
        postcardCatalogKey: "postcard-duif-base",
        type: "postcard",
      }),
    ).toBe(true);
    expect(
      isCorrespondenceContentValid({
        postcardMessage: "a".repeat(POSTCARD_MAX_CHARACTERS + 1),
        postcardCatalogKey: "postcard-duif-base",
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
